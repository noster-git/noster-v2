"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { CSS_EXPO_OUT } from "@/lib/motion";
import { shown, transitioning } from "@/lib/intro";

/**
 * Project open transition: the card photo you click grows out of its place into the project page's
 * hero. (Every other link uses the site's sweep: SiteSweep. Card links carry
 * data-glimm-skip so only this runs for them.)
 *
 *   press   the card gives a little (0.98, WorksGrid)
 *   0ms     the photo starts growing from exactly where the card is — fast at first, gliding in to
 *           land (750ms, strong ease-out). No zoom: the picture keeps its framing as it grows.
 *           Corners stay rounded until near the edges; the hero's 25% shade fades in.
 *           The rest of the page fades out so the photo has the stage.
 *   ~60%    the page is gone, so the project page loads underneath already
 *   landed  the photo hands over to the hero in one frame (same image, same place, same shade) and
 *           the title rises straight in.
 *
 * How: a layer on top of the page (fixed, under the nav) holds the whole photo laid out exactly as
 * the hero lays it out (full width, 110% of the hero tall, centred — ProjectHero at scroll 0). The layer is
 * the hero's own box (--hero-h: full screen on desk, half the screen on phones).
 * The window (clip-path) moves in a straight line from the card's box to the hero's box, so it only
 * ever grows outward; the photo's scale and position follow the same progress, so it starts exactly
 * on the card's photo and ends exactly as the hero. Everything is transform, opacity and clip-path.
 *
 * The photo is the hero's own image when the card has preloaded it (WorksGrid, on hover): the exact
 * file the hero shows, so the hand-over is identical. Reduced motion, no JS, modified clicks (new tab
 * etc.) and non-project links navigate normally.
 */

const Ctx = createContext({ open: () => {}, warm: () => {} });
export const useProjectTransition = () => useContext(Ctx);

const GROW_MS = 750;
const EASE = CSS_EXPO_OUT; // strong ease-out: moves the instant it's clicked, glides in
const STEPS = 24; // keyframes for the grow (evenly spaced in progress; the whole run is eased)
const SQUARE_FROM = 0.75; // corners stay rounded until the last quarter of the grow
const SHADE = 0.25; // the hero's black shade
const FADE = { duration: 350, easing: "cubic-bezier(0.33, 1, 0.68, 1)" }; // the page fades out behind the photo
const SWAP_AT = 0.6; // change page underneath at this share of the grow (the page has gone by then)
const WAIT_MS = 3000; // longest the grown photo waits for the project page before handing over

const isProject = (href) => /^\/works\/[^/?#]+/.test(href || "");
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const frame = () => new Promise((done) => requestAnimationFrame(done));
const lerp = (a, b, p) => a + (b - a) * p;

/** Size of an image of this aspect ratio covering a box (object-fit: cover). */
function cover(w, h, aspect) {
	return w / h > aspect ? { w, h: w / aspect } : { w: h * aspect, h };
}

/** Resolves once fn() is truthy (or after ms). */
async function until(fn, ms) {
	const end = Date.now() + ms;
	while (!fn() && Date.now() < end) await sleep(16);
	return fn();
}

/** Resolves once an image is loaded and decoded (or after ms). */
function ready(img, ms) {
	const loaded = img.complete
		? Promise.resolve()
		: new Promise((done) => {
				img.addEventListener("load", done, { once: true });
				img.addEventListener("error", done, { once: true });
			});
	return Promise.race([loaded.then(() => img.decode().catch(() => {})), sleep(ms)]);
}

export default function ProjectTransition({ children }) {
	const router = useRouter();
	const lenis = useLenis();
	const layer = useRef(null); // the window (clip-path)
	const photo = useRef(null); // the whole photo
	const shade = useRef(null);

	/** On hover/press: fetch the project page (WorksGrid also preloads its hero photo). */
	const warm = useCallback(
		(link) => {
			const href = link?.getAttribute("href");
			if (isProject(href)) router.prefetch(href);
		},
		[router],
	);

	const open = useCallback(
		(e, href) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			if (transitioning()) return e.preventDefault(); // one page change or project open at a time
			const card = e.currentTarget.querySelector("img");
			const root = document.documentElement;
			const page = document.querySelector("[data-page]");
			if (!isProject(href) || !card?.naturalWidth || !layer.current || !page || !root.classList.contains("js-anim")) return;
			e.preventDefault();
			root.dataset.transition = "";
			router.prefetch(href);

			// Stop a smooth-scroll glide where it is, so the card doesn't move under the photo.
			lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
			root.dataset.projectOpening = ""; // "View" tag goes; the project title will wait (globals.css)

			// The card as it is on screen now: its visible box (rounded), and its image's own box.
			const box = e.currentTarget.getBoundingClientRect();
			const imgBox = card.getBoundingClientRect();
			const radius = parseFloat(getComputedStyle(e.currentTarget).borderTopLeftRadius) || 0;
			const cardAspect = card.naturalWidth / card.naturalHeight;

			// The photo that grows: the project hero's own image if the card has preloaded it, else the card's
			// own image (already on screen).
			const heroPre = e.currentTarget.parentElement?.querySelector("[data-hero-preload] img");
			const heroReady = heroPre?.complete && heroPre.naturalWidth > 0;
			const aspect = heroReady ? heroPre.naturalWidth / heroPre.naturalHeight : cardAspect;
			const src = heroReady ? heroPre.currentSrc : card.currentSrc || card.src;

			// The hero's photo box: full width, 110% of the hero tall, from the top (ProjectHero, Parallax).
			const W = layer.current.offsetWidth;
			const H = layer.current.offsetHeight;
			const P = cover(W, H * 1.1, aspect);
			const px = W / 2 - P.w / 2;
			const py = H * 0.55 - P.h / 2;

			// Start: the photo the size it is on the card, its centre on the card image's centre. (The card
			// image may be a different crop of the same photo: match the whole photo's width.)
			const onCard = cover(imgBox.width, imgBox.height, cardAspect);
			const photoW = cardAspect >= aspect ? onCard.w : onCard.h * aspect;
			const s0 = photoW / P.w;
			const tx0 = imgBox.left + imgBox.width / 2 - s0 * (W / 2);
			const ty0 = imgBox.top + imgBox.height / 2 - s0 * (H * 0.55);

			// Keyframes along the grow (progress p, 0 → 1): the window, and the photo inside it.
			const windowFrames = [];
			const photoFrames = [];
			for (let k = 0; k <= STEPS; k++) {
				const p = k / STEPS;
				const win = { top: lerp(box.top, 0, p), right: lerp(box.right, W, p), bottom: lerp(box.bottom, H, p), left: lerp(box.left, 0, p) };
				const r = p <= SQUARE_FROM ? radius : radius * (1 - (p - SQUARE_FROM) / (1 - SQUARE_FROM));
				windowFrames.push({ clipPath: `inset(${win.top}px ${W - win.right}px ${H - win.bottom}px ${win.left}px round ${r}px)` });

				// The photo follows the same progress: card → hero.
				const s = lerp(s0, 1, p);
				photoFrames.push({ transform: `translate(${s * px + lerp(tx0, 0, p)}px, ${s * py + lerp(ty0, 0, p)}px) scale(${s})` });
			}

			const img = photo.current;
			Object.assign(img.style, { left: "0px", top: "0px", width: `${P.w}px`, height: `${P.h}px` });
			img.src = src;
			let recede = null;

			img.decode()
				.catch(() => {})
				.then(() => {
					const timing = { duration: GROW_MS, easing: EASE, fill: "forwards" };
					// Shown exactly over the card first (same frame as the animation's start: no jump).
					layer.current.style.visibility = "visible";
					layer.current.animate(windowFrames, timing);
					img.animate(photoFrames, timing); // origin: top-left
					shade.current.animate([{ opacity: 0 }, { opacity: SHADE }], timing);
					recede = page.animate([{ opacity: 1 }, { opacity: 0 }], { ...FADE, fill: "forwards" });

					// The page has gone by now: load the project page underneath while the photo lands.
					const path = href.split(/[?#]/)[0];
					const arrived = sleep(GROW_MS * SWAP_AT).then(async () => {
						router.push(href, { scroll: true });
						await until(() => location.pathname === path && shown("[data-project-hero] img"), WAIT_MS);
						lenis?.scrollTo(0, { immediate: true, force: true });
						window.scrollTo(0, 0);
						const heroImg = shown("[data-project-hero] img");
						if (heroImg) await ready(heroImg, WAIT_MS); // instant when the card preloaded it
					});
					return Promise.all([sleep(GROW_MS), arrived]);
				})
				.then(async () => {
					// Landed, and the hero is ready under it: bring the page back (it is the hero now), let it
					// paint once, then hand over in one frame. The title rises straight in.
					recede?.cancel();
					await frame();
					delete root.dataset.projectOpening;
					layer.current.style.visibility = "hidden";
					[layer.current, img, shade.current].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
					img.removeAttribute("src");
					// The card that was clicked is now hidden with the old page: start keyboard focus at the content.
					if (!document.activeElement?.checkVisibility()) document.getElementById("main")?.focus({ preventScroll: true });
				})
				.finally(() => {
					recede?.cancel(); // never leave the page hidden
					delete root.dataset.transition;
				});
		},
		[router, lenis],
	);

	return (
		<Ctx.Provider value={{ open, warm }}>
			{children}
			{/* The growing photo: over the page, under the nav (z-50) and the top CTA. */}
			<div ref={layer} aria-hidden="true" className="pointer-events-none invisible fixed inset-x-0 top-0 z-40 h-(--hero-h) overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element -- a copy of an image already loaded on the page */}
				<img ref={photo} alt="" className="absolute max-w-none origin-top-left object-cover" />
				<div ref={shade} className="absolute inset-0 bg-black opacity-0" />
			</div>
		</Ctx.Provider>
	);
}
