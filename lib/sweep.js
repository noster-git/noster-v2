import { accentChain } from "glimm";

// The site's transition look (glimm, a WebGL band that sweeps across a view and reveals the new one
// behind it), for page changes and the page-load reveal only (components/SiteSweep.jsx, Intro.jsx).
// Project cards don't use it.

/** The band's colours: the brand lime, through a cooler mint and back. */
export const SWEEP_PALETTE = accentChain(["#d3fd5e", "#9dffc8", "#d3fd5e"]);

/** Page changes and the load reveal: the band rises up the screen. */
export const PAGE_SWEEP = { palette: SWEEP_PALETTE, direction: "btt", sweepMs: 800, easing: "easeInOutQuint" };

/** How long the curtain stays down once the page behind it is ready, on a load and on a page change. */
export const CURTAIN_HOLD_MS = 200;
