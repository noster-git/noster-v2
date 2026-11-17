// Shared motion. Every entrance on the site uses these, so the page moves as one.
// expo.out: a fast start that settles softly (cubic-bezier(0.16, 1, 0.3, 1) in CSS).

import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { EDIT_MARKERS } from "./edit-markers.js";

gsap.registerPlugin(SplitText);

export const EASE = "expo.out";

// Pages stay in the DOM, hidden, after leaving them (cacheComponents), and their effects run again when
// they come back. An entrance plays once per element: coming back shows the page as it was left.
const played = new WeakSet();
export const hasPlayed = (el) => played.has(el);
export const markPlayed = (el) => played.add(el);

// from/to are getters: each use gets its own copy. GSAP writes into the vars it is given (a timeline's
// tween gets parent: <that timeline>), so a shared object would carry one timeline into every later tween.

/** Scroll reveal: fade and rise 32px, 1.1s, 0.08s between items (components/Reveal.jsx). */
export const reveal = {
	get from() {
		return { autoAlpha: 0, y: 32 };
	},
	get to() {
		return { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08 };
	},
};

/** Masked line rise: lines slide up out of their own clip (hero title, SplitText). */
export const lineRise = {
	get from() {
		return { yPercent: 110 };
	},
	get to() {
		return { yPercent: 0, duration: 1.2, ease: EASE, stagger: 0.09 };
	},
};

/**
 * Masked lines for lineRise, held at its start. The split is made from a copy of el's content laid exactly
 * over it (same classes, same box) while el's own content stays hidden underneath: SplitText rewrites the
 * nodes it splits and puts them back as new copies, which would leave React holding nodes that are no
 * longer on the page. restore() removes the copy and puts el's own content back: on show once the lines
 * have risen, otherwise back in its hidden start state (the entrance never played). Safe to call twice.
 */
export function splitLines(el) {
	const layer = document.createElement("div");
	layer.className = el.className;
	layer.setAttribute("aria-hidden", "true");
	layer.inert = true;
	// The copy takes el's classes for its type and wrapping (font, alignment, balance, child spacing), but
	// its box is pinned to el's own box here: el's sizing, spacing and transform classes don't apply to it.
	layer.style.cssText =
		"position:absolute;inset:0;width:auto;height:auto;min-width:0;max-width:none;min-height:0;max-height:none;" +
		"margin:0;padding:inherit;border:0;transform:none;translate:none;scale:none;rotate:none;" +
		"visibility:visible;opacity:1;pointer-events:none";
	el.childNodes.forEach((node) => layer.append(node.cloneNode(true)));
	// In the studio's live preview, text carries click-to-edit markers: runs of invisible characters that
	// SplitText would turn into spaces. The copy goes without them (el keeps its own, for the editor).
	const text = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
	for (let node = text.nextNode(); node; node = text.nextNode()) node.data = node.data.replace(EDIT_MARKERS, "");

	const prev = { position: el.style.position, visibility: el.style.visibility, opacity: el.style.opacity };
	if (getComputedStyle(el).position === "static") el.style.position = "relative";
	el.style.visibility = "hidden";
	el.style.opacity = "1";
	el.append(layer);

	const split = SplitText.create(layer, { type: "lines", mask: "lines", linesClass: "split-line" });
	gsap.set(split.lines, lineRise.from);
	let done = false;
	return {
		lines: split.lines,
		restore() {
			if (done) return;
			done = true;
			const last = split.lines[split.lines.length - 1];
			if (last && gsap.getProperty(last, "yPercent") !== 0) el.style.opacity = prev.opacity;
			split.kill();
			layer.remove();
			el.style.position = prev.position;
			el.style.visibility = prev.visibility;
		},
	};
}

// The same curves in CSS, for motion handed to the browser (WAAPI) so it keeps running smoothly while
// the page is busy loading, hydrating or decoding images.
export const CSS_EXPO_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const CSS_EXPO_IN_OUT = "cubic-bezier(0.87, 0, 0.13, 1)";

/** Resolves once the image is loaded and decoded (or after capMs), so a reveal never unmasks an empty box. */
function decoded(img, capMs) {
	if (!img?.decode) return Promise.resolve();
	return Promise.race([img.decode().catch(() => {}), new Promise((done) => setTimeout(done, capMs))]);
}

const STAGGER = 90; // ms between items that come in together
const MAX_STAGGER = 360; // the last of a big batch never waits longer than this
const NAME_DELAY = 520; // a card's name rises as its photo's mask snaps open (expo.inOut is halfway at 650ms)

/**
 * Photo reveal for one ScrollTrigger batch, on the compositor. Once the entrances are released (`ready`,
 * lib/intro.js), each item:
 * - if a fast scroll has already carried it out of view, is simply shown, with no animation;
 * - otherwise takes a stagger slot among the items still on screen (90ms apart, capped at 360ms) and
 *   plays when its slot comes and its own photo is decoded, so one slow photo never holds back the rest
 *   and nothing unmasks an empty box.
 * Playing: the photo unmasks from the bottom (1.3s expo.inOut) as it settles from 1.15× (1.8s expo.out),
 * the item rises `rise` px, and a card's name ([data-card-name], clipped by its parent) slides up out of
 * its mask as the photo opens, so the name always follows its photo. The end state is the element's own
 * style, so nothing is left behind. Returns a function that cancels whatever has not started yet.
 */
export function revealBatch(items, ready, { rise = 0 } = {}) {
	let live = true;
	ready().then(() => {
		if (!live) return;
		let slot = 0;
		// Every position is read before anything is written, so showing one item never forces the browser
		// to lay the page out again to measure the next.
		const rects = items.map((el) => el.getBoundingClientRect());
		items.forEach((el, i) => {
			const { top, bottom } = rects[i];
			if (bottom < 0 || top > window.innerHeight) return show(el);
			const media = el.matches("[data-card]") ? el.querySelector("[data-card-media]") : el;
			const img = media?.querySelector("img");
			const turn = new Promise((done) => setTimeout(done, Math.min(slot++ * STAGGER, MAX_STAGGER)));
			Promise.all([turn, decoded(img, 2500)]).then(() => requestAnimationFrame(() => live && play(el, media, img, rise)));
		});
	});
	return () => (live = false);
}

function show(el) {
	markPlayed(el);
	el.style.opacity = "1";
	el.style.visibility = "visible";
}

function play(el, media, img, rise) {
	show(el);
	if (rise) el.animate([{ transform: `translateY(${rise}px)` }, { transform: "none" }], { duration: 1300, easing: CSS_EXPO_OUT });
	media?.animate([{ clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)" }], { duration: 1300, easing: CSS_EXPO_IN_OUT });
	img?.animate([{ transform: "scale(1.15)" }, { transform: "none" }], { duration: 1800, easing: CSS_EXPO_OUT });
	el.querySelector("[data-card-name]")?.animate([{ transform: "translateY(110%)" }, { transform: "none" }], {
		duration: 1000,
		delay: NAME_DELAY,
		easing: CSS_EXPO_OUT,
		fill: "backwards",
	});
}
