// Shared motion. Every entrance on the site uses these, so the page moves as one.
// expo.out: a fast start that settles softly (cubic-bezier(0.16, 1, 0.3, 1) in CSS).

export const EASE = "expo.out";

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
		items.forEach((el) => {
			const { top, bottom } = el.getBoundingClientRect();
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
