// The page-load intro (components/Intro.jsx), page transitions (components/PageTransition.jsx), and
// everything that waits for them.
//
// ready() is the gate entrances wait on before they play. On load it opens when the intro hands over
// (straight away on repeat visits, or as the curtain lifts). During a page transition it is closed when
// the veil covers the page and opened as the veil lifts off the new one, so the new page's entrances
// play as it is revealed, not hidden underneath.

let openIntro = () => {};
let gate = typeof window === "undefined" ? Promise.resolve() : new Promise((r) => (openIntro = r));

/** Called by the intro when it hands over to the page. */
export const finishIntro = () => openIntro();

/** The current gate: entrances call this when they mount and play once it resolves. */
export const ready = () => gate;

/** Closes the gate for a page transition; returns the function that opens it again. */
export function holdEntrances() {
	let release;
	gate = new Promise((r) => (release = r));
	return () => release();
}

// Runs first thing in <body>, before the first paint (app/layout.js). Marks the document so CSS can hold
// animated elements in their start state from the very first frame (no flash of content, then a jump):
// - js-anim: JavaScript is on and the visitor has no reduced-motion preference;
// - intro-skip: no curtain: it has already played this session, or this isn't the home page.
export const INTRO_SCRIPT = `(function(){try{var d=document.documentElement;if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;d.classList.add("js-anim");if(location.pathname!=="/"||sessionStorage.getItem("noster-intro"))d.classList.add("intro-skip")}catch(e){}})();`;
