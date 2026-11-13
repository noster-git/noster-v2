// The page-load intro (components/Intro.jsx) and everything that waits for it.
//
// ready() is the gate entrances wait on before they play. It is closed while the curtain covers the page
// and opens as the sweep reveals it: on a load (Intro) and on every page change (SiteSweep), so a new
// page's entrances always play as it is revealed, never hidden under the curtain.

let open = () => {};
let gate = typeof window === "undefined" ? Promise.resolve() : new Promise((r) => (open = r));

/** Closes the gate (the curtain is coming down): entrances that mount from now on wait. */
export const holdEntrances = () => {
	open();
	gate = new Promise((r) => (open = r));
};

/** Opens the gate (the sweep is revealing the page). */
export const finishIntro = () => open();

/** The current gate: entrances call this when they mount and play once it resolves. */
export const ready = () => gate;

/** The first match that is on show: earlier pages can stay in the DOM, hidden (cacheComponents). */
export const shown = (selector) => [...document.querySelectorAll(selector)].find((el) => el.checkVisibility());

/** True while a page change or project open is running (html[data-transition]): one at a time. */
export const transitioning = () => "transition" in document.documentElement.dataset;

// Runs first thing in <body>, before the first paint (app/layout.js). Marks the document so CSS can hold
// animated elements in their start state from the very first frame (no flash of content, then a jump):
// - js-anim: JavaScript is on and the visitor has no reduced-motion preference. The curtain then covers
//   every page load from the first frame (Intro lifts it and adds intro-skip once it has).
export const INTRO_SCRIPT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;document.documentElement.classList.add("js-anim")}catch(e){}})();`;
