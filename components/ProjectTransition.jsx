"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";

/**
 * Project open transition: the card photo you click grows — from the very next frame — out of its
 * place into the project page's full-screen hero, keeping its rounded corners until it reaches the
 * screen edges. Only then does the page change underneath; the photo hands over to the hero in a
 * single frame and the title rises in.
 *
 * How: a layer on top of the page (fixed, under the nav) holds the whole photo laid out exactly as
 * the hero lays it out (full width, 110% of the screen tall, centred — ProjectHero at scroll 0).
 * At the click it is scaled and moved so the photo sits exactly on the card's photo, and masked
 * (clip-path, rounded like the card) to the card's box: nothing changes on screen. Then the mask
 * opens in a straight line to the full screen while the photo settles to full size, and its 25%
 * shade fades in. The grid underneath stays exactly as it was the whole time.
 *
 * Reduced motion, modified clicks (new tab etc.) and non-project links navigate normally.
 */

const Ctx = createContext({ open: () => {}, warm: () => {} });
export const useProjectTransition = () => useContext(Ctx);

const GROW_MS = 900; // travels up to a full screen: longer than UI motion
const EASE = "cubic-bezier(0.76, 0, 0.24, 1)"; // --ease-quart: on-screen movement, ease-in-out
const SQUARE_FROM = 0.7; // corners stay rounded until the last 30% of the grow
const SHADE = 0.25; // the hero's black shade
const WAIT_MS = 3000; // longest the grown photo waits for the project page before handing over
const IMG_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]; // next/image sizes

const isProject = (href) => /^\/works\/[^/?#]+/.test(href || "");
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const frame = () => new Promise((done) => requestAnimationFrame(done));

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

/** The card image's full-width version: the largest srcset candidate the screen needs. */
function fullWidthSrc(img) {
	const candidates = (img.srcset || "")
		.split(/,\s+/)
		.map((s) => s.trim().split(/\s+/))
		.filter(([url, w]) => url && w)
		.map(([url, w]) => ({ url, w: parseInt(w, 10) }));
	if (!candidates.length) return img.currentSrc || img.src;
	const need = document.documentElement.clientWidth * (window.devicePixelRatio || 1);
	return (candidates.find((c) => c.w >= need) ?? candidates.at(-1)).url;
}

export default function ProjectTransition({ children }) {
	const router = useRouter();
	const lenis = useLenis();
	const busy = useRef(false);
	const layer = useRef(null); // the window (clip-path)
	const photo = useRef(null); // the whole photo
	const shade = useRef(null);
	const preloaded = useRef(new WeakMap()); // card <img> → decoded full-width Image

	/** On hover/press: fetch the project page, and load + decode the card photo at full width. */
	const warm = useCallback(
		(link) => {
			const href = link?.getAttribute("href");
			if (!isProject(href)) return;
			router.prefetch(href);
			const card = link.querySelector("img");
			if (!card || preloaded.current.has(card)) return;
			const img = new Image();
			img.src = fullWidthSrc(card);
			preloaded.current.set(card, img);
			img.decode().then(
				() => (img.dataset.ready = "1"),
				() => {},
			);
		},
		[router],
	);

	const open = useCallback(
		(e, href) => {
			if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
			if (busy.current) return e.preventDefault(); // one at a time
			const card = e.currentTarget.querySelector("img");
			if (!isProject(href) || !card?.naturalWidth || !layer.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
			e.preventDefault();
			busy.current = true;
			router.prefetch(href);

			// Stop a smooth-scroll glide where it is, so the card doesn't move under the photo.
			lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
			const root = document.documentElement;
			root.dataset.projectOpening = ""; // "View" tag goes; the project title will wait (globals.css)

			// The card as it is on screen now: its visible box (rounded), and its image's own box.
			const box = e.currentTarget.getBoundingClientRect();
			const imgBox = card.getBoundingClientRect();
			const radius = parseFloat(getComputedStyle(e.currentTarget).borderTopLeftRadius) || 0;
			const aspect = card.naturalWidth / card.naturalHeight;

			// The hero's photo box: full width, 110% of the screen tall, from the top (ProjectHero, Parallax).
			const W = layer.current.offsetWidth;
			const H = layer.current.offsetHeight;
			const P = cover(W, H * 1.1, aspect);
			const px = W / 2 - P.w / 2;
			const py = H * 0.55 - P.h / 2;

			// Start: the photo the size it is on the card, its centre on the card image's centre.
			const s0 = cover(imgBox.width, imgBox.height, aspect).w / P.w;
			const tx0 = imgBox.left + imgBox.width / 2 - s0 * (W / 2);
			const ty0 = imgBox.top + imgBox.height / 2 - s0 * (H * 0.55);

			// The photo: full width if it's ready (hovered first), else the card's own image (already loaded).
			const full = preloaded.current.get(card);
			const src = full?.dataset.ready ? full.src : card.currentSrc || card.src;
			const img = photo.current;
			Object.assign(img.style, { left: "0px", top: "0px", width: `${P.w}px`, height: `${P.h}px` });
			img.src = src;

			const place = (s, tx, ty) => `translate(${s * px + tx}px, ${s * py + ty}px) scale(${s})`;
			const window_ = (p, r) => {
				const lerp = (a, b) => a + (b - a) * p;
				return `inset(${lerp(box.top, 0)}px ${lerp(W - box.right, 0)}px ${lerp(H - box.bottom, 0)}px ${lerp(box.left, 0)}px round ${r}px)`;
			};

			img.decode()
				.catch(() => {})
				.then(() => {
					const timing = { duration: GROW_MS, easing: EASE, fill: "forwards" };
					// Shown exactly over the card first (same frame as the animation's start: no jump).
					layer.current.style.visibility = "visible";
					layer.current.animate(
						[
							{ clipPath: window_(0, radius) },
							{ clipPath: window_(SQUARE_FROM, radius), offset: SQUARE_FROM },
							{ clipPath: window_(1, 0) },
						],
						timing,
					);
					img.animate([{ transform: place(s0, tx0, ty0) }, { transform: place(1, 0, 0) }], timing); // origin: top-left
					return shade.current.animate([{ opacity: 0 }, { opacity: SHADE }], timing).finished;
				})
				.then(async () => {
					// The photo now fills the screen exactly as the hero: change page underneath it.
					router.push(href, { scroll: true });
					const path = href.split(/[?#]/)[0];
					await until(() => location.pathname === path && document.querySelector("[data-project-hero] img"), WAIT_MS);
					lenis?.scrollTo(0, { immediate: true, force: true });
					window.scrollTo(0, 0);
					const heroImg = document.querySelector("[data-project-hero] img");
					if (heroImg) await ready(heroImg, WAIT_MS);
					await frame();
					await frame();
					// Hand over in one frame (same photo, same place, same shade); the title rises in.
					delete root.dataset.projectOpening;
					layer.current.style.visibility = "hidden";
					[layer.current, img, shade.current].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
					img.removeAttribute("src");
				})
				.finally(() => {
					busy.current = false;
				});
		},
		[router, lenis],
	);

	return (
		<Ctx.Provider value={{ open, warm }}>
			{children}
			{/* The growing photo: over the page, under the nav (z-50) and the top CTA. */}
			<div ref={layer} aria-hidden="true" className="pointer-events-none invisible fixed inset-x-0 top-0 z-40 h-svh overflow-hidden">
				{/* eslint-disable-next-line @next/next/no-img-element -- a copy of an image already loaded on the page */}
				<img ref={photo} alt="" className="absolute max-w-none origin-top-left object-cover" />
				<div ref={shade} className="absolute inset-0 bg-black opacity-0" />
			</div>
		</Ctx.Provider>
	);
}
