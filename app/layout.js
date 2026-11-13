import "./globals.css";
import { preconnect } from "react-dom";
import { Geist } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProjectTransition from "@/components/ProjectTransition";
import Intro from "@/components/Intro";
import PageTransition from "@/components/PageTransition";
import NosterLogo from "@/components/NosterLogo";
import { INTRO_SCRIPT } from "@/lib/intro";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Noster Associates | Elevating Workspaces",
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, locale: "en_IN", type: "website" },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#5bbad5" }],
  },
};

// Browser UI (address bar, overscroll) matches the white page; the site has one light theme.
export const viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  // Every content photo comes from Prismic's image CDN: open the connection before the first <img> asks.
  preconnect("https://images.prismic.io");

  return (
    // suppressHydrationWarning: INTRO_SCRIPT adds classes to <html> before React hydrates.
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        {/* First in <body> (not <head>, where dev tooling injects its own scripts): runs before any page
            content is drawn, so the start states apply from the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        {/* First stop for keyboard users: jumps past the nav to the page content. Above the curtain. */}
        <a
          href="#main"
          className="sr-only z-[1001] rounded-ui bg-black px-[12px] py-[8px] text-white focus-visible:not-sr-only focus-visible:fixed focus-visible:top-m focus-visible:left-m focus-visible:outline-white"
        >
          Skip to content
        </a>
        {/* The curtain: a lime panel with the wordmark across its foot. It covers every page load from the
            first frame (shown when INTRO_SCRIPT has marked the page js-anim, globals.css) until it wipes up off
            the page (Intro), and comes back for page changes (PageTransition). */}
        <div data-curtain aria-hidden="true" className="curtain fixed inset-0 z-[1000] bg-lime text-black">
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
      </body>
    </html>
  );
}
