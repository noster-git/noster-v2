import "./globals.css";
import { Suspense } from "react";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Geist } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProjectTransition from "@/components/ProjectTransition";
import Intro from "@/components/Intro";
import PageTransition from "@/components/PageTransition";
import NosterLogo from "@/components/NosterLogo";
import { INTRO_SCRIPT, NO_ENTRANCES_SCRIPT } from "@/lib/intro";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SanityLive } from "@/lib/sanity/live";
import { expirePublishedContent } from "@/lib/sanity/actions";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, OPEN_GRAPH, PAPER } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: OPEN_GRAPH,
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

// Browser UI (address bar, overscroll) matches the white page; the site has one light theme.
export const viewport = {
  themeColor: PAPER,
  colorScheme: "light",
};

/**
 * SanityLive, with drafts (and the preview token) only in draft mode, where an edit just re-renders the page
 * (draft mode never reads the cache). For visitors, a publish expires the content it changed and the open
 * page re-renders with it (lib/sanity/actions.js).
 * In draft mode every change re-renders the page, with no debounce: SanityLive's `action` is either
 * "refresh" or a server action, and a server action can't hold back the refresh it hands to the browser.
 * Each re-render reads every query once (lib/sanity/live.js → fetchOrNull), and a dragged list shows its
 * new order before that (components/EditOrderLive.jsx).
 */
async function Live() {
  const { isEnabled } = await draftMode();
  return <SanityLive includeDrafts={isEnabled} action={isEnabled ? "refresh" : expirePublishedContent} />;
}

/**
 * Click-to-edit overlays, in draft mode only (the studio's live preview): visitors never load them. Content
 * shows at once there, with no curtain or entrances (lib/intro.js), so edits and reordered sections are
 * never held hidden.
 */
async function Preview() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: NO_ENTRANCES_SCRIPT }} />
      <VisualEditing />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: INTRO_SCRIPT adds classes to <html> before React hydrates.
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        {/* First in <body> (not <head>, where dev tooling injects its own scripts): runs before any page
            content is drawn, so the start states apply from the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        {/* Points AI tools at the plain-text site guide. React moves it into <head>. It sits here, not in
            `metadata.alternates`, because each page sets its own alternates (canonical), which would replace it. */}
        <link rel="alternate" type="text/plain" href="/llms.txt" title="Site guide for AI tools" />
        {/* First stop for keyboard users: jumps past the nav to the page content. Above the curtain. */}
        <a
          href="#main"
          className="sr-only z-(--z-skip) rounded-ui bg-black px-[10px] py-[6px] text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:top-m focus-visible:left-m focus-visible:outline-white"
        >
          Skip to content
        </a>
        {/* The curtain: a lime panel with the wordmark across its foot. It covers every page load from the
            first frame (shown when INTRO_SCRIPT has marked the page js-anim, globals.css) until it wipes up off
            the page (Intro), and comes back for page changes (PageTransition). */}
        <div data-curtain aria-hidden="true" className="curtain fixed inset-0 z-(--z-curtain) bg-lime text-black">
          <div className="absolute inset-x-0 bottom-0 px-m pb-m">
            <div data-curtain-logo>
              <NosterLogo className="block h-auto w-full" />
            </div>
          </div>
        </div>
        <SmoothScroll>
          {/* The curtain on page load and on every internal link but project cards. */}
          <Intro />
          <PageTransition />
          {/* In the layout so it survives the route change: a project card's photo grows into the next page's hero. */}
          <ProjectTransition>
            <Navigation />
            {/* data-page: the page content that fades while a project photo grows (the nav stays put). */}
            <div data-page>
              {/* tabIndex -1: the skip link moves focus here, not just the scroll position. */}
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
            </div>
          </ProjectTransition>
        </SmoothScroll>
        {/* Refreshes the page when content it shows is published (drafts too, in draft mode). */}
        <Live />
        <Suspense fallback={null}>
          <Preview />
        </Suspense>
        {/* Page views (Vercel Web Analytics) and real visitors' Core Web Vitals, INP included (Speed Insights):
            no cookies, so no consent banner. Only on Vercel builds: the scripts are served by Vercel's edge, so
            anywhere else they would 404. */}
        {process.env.VERCEL && <Analytics />}
        {process.env.VERCEL && <SpeedInsights />}
      </body>
    </html>
  );
}
