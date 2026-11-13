import "./globals.css";
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

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning: INTRO_SCRIPT adds classes to <html> before React hydrates.
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        {/* First in <body> (not <head>, where dev tooling injects its own scripts): runs before any page
            content is drawn, so the start states apply from the first frame. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        {/* First visit of a session: a white curtain with the logo, lifted by Intro. Shown only when
            INTRO_SCRIPT has marked the page js-anim and not intro-skip (globals.css), so it is there
            from the first frame and never flashes on repeat visits or without JS. */}
        <div data-curtain aria-hidden="true" className="curtain fixed inset-0 z-[1000] items-center justify-center bg-white text-black">
          <span className="block overflow-hidden">
            <span data-curtain-logo className="block">
              <NosterLogo className="h-[18px] w-auto desk:h-[24px]" />
            </span>
          </span>
        </div>
        <SmoothScroll>
          <Intro />
          <PageTransition />
          {/* In the layout so it survives the route change: a project card's photo opens into the next page's hero. */}
          <ProjectTransition>
            <Navigation />
            {/* data-page: what eases out under the veil on a page transition (the nav stays put). */}
            <div data-page>
              {children}
              <Footer />
            </div>
          </ProjectTransition>
        </SmoothScroll>
      </body>
    </html>
  );
}
