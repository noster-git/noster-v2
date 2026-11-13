// The curtain (app/layout.js): one lime panel for the page-load intro (components/Intro.jsx) and page
// changes (components/PageTransition.jsx), so both move the same way.

/** Every curtain wipe: up over the page, and up off it. */
export const CURTAIN_MS = 700;
export const CURTAIN_EASE = "cubic-bezier(0.58, 0.08, 0.13, 1)";

/** How long the curtain stays down once the page behind it is ready, on a load and on a page change. */
export const CURTAIN_HOLD_MS = 300;

/** Share of the lift at which the page's entrances start, so they play as it is uncovered. */
export const REVEAL_AT = 0.35;

/** Wipes the curtain up over the page (from below). */
export const cover = (curtain) =>
	curtain.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: CURTAIN_MS, easing: CURTAIN_EASE, fill: "forwards" });

/** Wipes the curtain on up, off the page. */
export const lift = (curtain) =>
	curtain.animate([{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], { duration: CURTAIN_MS, easing: CURTAIN_EASE, fill: "forwards" });
