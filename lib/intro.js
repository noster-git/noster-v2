// The page-load intro (components/Intro.jsx) and everything that waits for it.
//
// ready() is the gate entrances wait on before they play. It is closed while the curtain covers the page
// and opens as it lifts: on a load (Intro) and on every page change (PageTransition), so a new page's
// entrances always play as it is uncovered, never hidden under the curtain.

let open = () => {};
let gate = typeof window === "undefined" ? Promise.resolve() : new Promise((r) => (open = r));

/** Closes the gate (the curtain is coming down): entrances that mount from now on wait. */
export const holdEntrances = () => {
	open();
	gate = new Promise((r) => (open = r));
};

/** Opens the gate (the curtain is lifting off the page). */
export const finishIntro = () => open();

/** The current gate: entrances call this when they mount and play once it resolves. */
export const ready = () => gate;

/** The first match that is on show: earlier pages can stay in the DOM, hidden (cacheComponents). */
export const shown = (selector) => [...document.querySelectorAll(selector)].find((el) => el.checkVisibility());

/** True while a page change or project open is running (html[data-transition]): one at a time. */
export const transitioning = () => "transition" in document.documentElement.dataset;

// Runs first thing in <body>, before the first paint (app/(site)/layout.js). Marks the document so CSS can hold
// animated elements in their start state from the very first frame (no flash of content, then a jump):
// - js-anim: JavaScript is on and the visitor has no reduced-motion preference. The curtain then covers
//   every page load from the first frame (Intro lifts it and adds intro-skip once it has).
//   Never in the studio's live preview, the page in a frame (only the site's own studio may frame it:
//   frame-ancestors, next.config.mjs): there everything shows at once, so a section dragged to a new place
//   is never left hidden, waiting for an entrance that measured its old place.
// If the curtain still hasn't started to lift 8s in (Intro adds intro-lift; its script failed or never
// arrived), js-anim comes off: the curtain goes and everything it held is simply shown.
export const INTRO_SCRIPT = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches||self!==top)return;var r=document.documentElement;r.classList.add("js-anim");setTimeout(function(){if(!r.classList.contains("intro-lift"))r.classList.remove("js-anim")},8000)}catch(e){}})();`;

// Draft mode outside the studio's frame (the preview opened in a window of its own): the same, from the
// moment the draft-mode part of the layout arrives (app/(site)/layout.js, Preview). The start states are
// held by CSS under js-anim, so nothing stays hidden from then on, and entrances set up later find no js-anim
// and do nothing.
export const NO_ENTRANCES_SCRIPT = `document.documentElement.classList.remove("js-anim");`;
