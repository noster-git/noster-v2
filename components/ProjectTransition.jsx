"use client";

import { createContext, memo, use, useCallback, useContext, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { CSS_EXPO_OUT } from "@/lib/motion";
import { shown, transitioning } from "@/lib/intro";

/**
 * Project open transition: the card photo you click grows out of its place into the project page's
 * hero. (Every other link uses the page curtain: PageTransition, which leaves card links,
 * data-card-media, to this.)
 *
 *   press   the card gives a little (0.98, WorksGrid)
 *   0ms     the photo starts growing from exactly where the card is — fast at first, gliding in to
 *           land (750ms, strong ease-out). No zoom: the picture keeps its framing as it grows.
 *           Corners stay rounded until near the edges; the hero's shade (25%, and its darker band at
 *           the top) fades in. The rest of the page fades out so the photo has the stage (350ms).
 *           The project page starts loading and rendering at the click.
 *   350ms   the old page is gone: the project page goes in underneath, at the top. A white panel holds
 *           the hero's place around the photo; on phones, where the hero is half the screen, the rest
 *           of the project page fades up below it while the photo lands.
 *   750ms   landed. The photo, its shade and the panel go in one frame, and the hero underneath is the
 *           same image in the same place under the same shade, so nothing moves. The title rises
 *           straight in (TitleRise).
 *
 * How: a layer on top of the page (fixed, full screen, under the nav) holds the whole photo laid out
 * exactly as the hero lays it out (full width, 110% of the hero tall, centred — ProjectHero at scroll 0),
 * in the hero's own box at the top (--hero-h: full screen on desk, half the screen on phones). The layer
 * itself is full screen so a card anywhere on screen starts in view, not only one inside the hero's box.
 * The window (clip-path) moves in a straight line from the card's box to the hero's box, so it only
 * ever grows outward; the photo's scale and position follow the same progress, so it starts exactly
 * on the card's photo and ends exactly as the hero. Everything is transform, opacity and clip-path.
 *
 * The project page is asked for at the click, but goes on screen only once the old page has faded out
 * (Hold), so the old page never cuts to the new one mid-fade.
 *
 * The photo is the hero's own image when the card has preloaded it (WorksGrid: on hover, or while it is on
 * screen on touch): the exact file the hero shows, decoded already, so it hands over the moment it lands.
 * If it hasn't loaded yet, the card's photo grows instead and, once landed, stays still until the hero's
 * photo has decoded under it; then it hands over in one frame the same way. The hero is never uncovered
 * before its photo is decoded, unless the page or its photo never comes (ROUTE_MS, DECODE_MS). Reduced
 * motion, no JS, modified clicks (new tab etc.) and non-project links navigate normally.
 */

const Ctx = createContext({ open: () => {}, warm: () => {} });
export const useProjectTransition = () => useContext(Ctx);

const GROW_MS = 750;
const EASE = CSS_EXPO_OUT; // strong ease-out: moves the instant it's clicked, glides in
const STEPS = 24; // keyframes for the grow (evenly spaced in progress; the whole run is eased)
const SQUARE_FROM = 0.75; // corners stay rounded until the last quarter of the grow
const FADE = { duration: 350, easing: "cubic-bezier(0.33, 1, 0.68, 1)" }; // the old page fading out behind the photo
const RISE_MIN_MS = 200; // phones: shortest fade for the project page coming up below the photo
const START_MS = 300; // longest the grow waits for its photo to decode before it starts
const ROUTE_MS = 8000; // longest the grown photo waits for the project page to arrive
const DECODE_MS = 3000; // then for its hero photo to decode, before handing over

const isProject = (href) => /^\/works\/[^/?#]+/.test(href || "");
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const lerp = (a, b, p) => a + (b - a) * p;

/** Size of an image of this aspect ratio covering a box (object-fit: cover). */
function cover(w, h, aspect) {
	return w / h > aspect ? { w, h: w / aspect } : { w: h * aspect, h };
}

/** Resolves once fn() is truthy (or after ms), with its value. */
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

/** The project page opening now, { path, gone }: it goes on screen once `gone` resolves (Hold). */
let opening = null;

/**
 * Keeps the project page off the screen until the old page has faded out. It sits after the page in the
 * layout, so the page renders first and only putting it on screen waits: a navigation is a transition,
 * and React keeps the old page up while one is suspended.
 * This depends on Next running router.push inside startTransition: check that it still does after an upgrade.
 */
const Hold = memo(function Hold() {
	const pathname = usePathname();
	if (opening?.path === pathname) use(opening.gone);
	return null;
});

export default function ProjectTransition({ children }) {
	const router = useRouter();
	const lenis = useLenis();
	const layer = useRef(null); // the window (clip-path)
	const photo = useRef(null); // the whole photo
	const veil = useRef(null); // the hero's shade and top band
	const heroBox = useRef(null); // the hero's box, for its height
	const panel = useRef(null); // white, in the hero's place around the photo once the project page is in

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

			// The project page loads and renders from now on; it goes on screen once the old page has faded (Hold).
			const path = href.split(/[?#]/)[0];
			let release = () => {};
			const gone = new Promise((done) => (release = done));
			const ours = { path, gone };
			opening = ours;
			router.push(href, { scroll: true });
			// Waits for the project page to be in: its hero photo, or a page with no hero (not found, an error).
			// Back or Forward meanwhile stops the wait, and the hand-over below.
			let left = false;
			let leave = () => {};
			const leaving = new Promise((done) => (leave = done));
			const onPop = () => {
				left = true;
				leave();
			};
			window.addEventListener("popstate", onPop, { once: true });
			const arrived = until(
				() => left || (location.pathname === path && (shown("[data-project-hero] img") || shown("#main h1"))),
				ROUTE_MS,
			).then(() => (left ? null : shown("[data-project-hero] img")));

			// Stop a smooth-scroll glide where it is, and hold the page still while the photo grows, so the card
			// doesn't move under it.
			lenis?.scrollTo(window.scrollY, { immediate: true, force: true });
			lenis?.stop();
			root.dataset.projectOpening = ""; // "View" tag goes; the project title waits for the hand-over (TitleRise)

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

			// The hero's photo box: full width, 110% of the hero tall, from the top (ProjectHero, components/Parallax).
			const W = layer.current.offsetWidth;
			const VH = layer.current.offsetHeight; // the layer: the whole screen
			const H = heroBox.current.offsetHeight; // the hero, where the photo lands
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
				// Never quite 0: Chrome won't run a clip-path animation on the compositor when a frame's radius is 0px.
				const r = Math.max(0.01, p <= SQUARE_FROM ? radius : radius * (1 - (p - SQUARE_FROM) / (1 - SQUARE_FROM)));
				windowFrames.push({ clipPath: `inset(${win.top}px ${W - win.right}px ${VH - win.bottom}px ${win.left}px round ${r}px)` });

				// The photo follows the same progress: card → hero.
				const s = lerp(s0, 1, p);
				photoFrames.push({ transform: `translate(${s * px + lerp(tx0, 0, p)}px, ${s * py + lerp(ty0, 0, p)}px) scale(${s})` });
			}

			const link = e.currentTarget;
			const img = photo.current;
			Object.assign(img.style, { left: "0px", top: "0px", width: `${P.w}px`, height: `${P.h}px` });
			img.src = src;
			let recede = null;
			let rise = null;

			// Starts once the photo is decoded (at once: it is already loaded on the page), and never waits long for it.
			Promise.race([img.decode().catch(() => {}), sleep(START_MS)])
				.then(async () => {
					const timing = { duration: GROW_MS, easing: EASE, fill: "forwards" };
					const t0 = performance.now();
					// Shown exactly over the card first (same frame as the animation's start: no jump).
					layer.current.style.visibility = "visible";
					link.style.visibility = "hidden"; // the card's own photo goes as its copy lifts off it, so it never shows twice
					layer.current.animate(windowFrames, timing);
					img.animate(photoFrames, timing); // origin: top-left
					veil.current.animate([{ opacity: 0 }, { opacity: 1 }], timing);
					recede = page.animate([{ opacity: 1 }, { opacity: 0 }], { ...FADE, fill: "forwards" });
					recede.finished.then(release, release); // the old page is gone: the project page may go in
					const landed = sleep(GROW_MS);

					// The project page is in (under the photo, the panel and the faded-out page): take it to the top.
					const hero = await arrived;
					if (!hero) return; // it never came, has no hero, or Back/Forward went elsewhere: hand back what is there
					panel.current.style.visibility = "visible";
					lenis?.scrollTo(0, { immediate: true, force: true });
					window.scrollTo(0, 0);
					// Phones: the rest of the page fades up below the hero's box, landing with the photo. On desk the
					// hero fills the screen and the panel covers it all, so it is simply back.
					if (VH - H > 1) {
						const rest = GROW_MS - (performance.now() - t0);
						rise = page.animate([{ opacity: 0 }, { opacity: 1 }], { duration: Math.max(RISE_MIN_MS, rest), easing: FADE.easing });
					}
					recede.cancel();

					// Hand over once landed, the page has come up and the hero's photo is decoded (at once when it is
					// the file that grew: the card preloaded it); at once on Back or Forward.
					await Promise.race([Promise.all([landed, rise?.finished, ready(hero, DECODE_MS)]), leaving]);
				})
				.catch(() => {})
				.finally(() => {
					// The hand-over, in one frame (and the way out if anything above failed): the photo, its shade and
					// the panel go, the page is on show.
					release();
					window.removeEventListener("popstate", onPop);
					if (opening === ours) opening = null;
					delete root.dataset.projectOpening;
					recede?.cancel(); // never leave the page hidden
					rise?.cancel();
					if (layer.current) layer.current.style.visibility = "hidden";
					if (panel.current) panel.current.style.visibility = "hidden";
					[layer.current, img, veil.current].forEach((el) => el?.getAnimations().forEach((a) => a.cancel()));
					img.removeAttribute("src");
					link.style.visibility = ""; // the card is back for when the works page is shown again
					lenis?.start();
					delete root.dataset.transition;
					// The card that was clicked is now hidden with the old page: start keyboard focus at the content.
					if (!document.activeElement?.checkVisibility()) document.getElementById("main")?.focus({ preventScroll: true });
				});
		},
		[router, lenis],
	);

	const value = useMemo(() => ({ open, warm }), [open, warm]);

	return (
		<Ctx.Provider value={value}>
			{children}
			<Hold />
			{/* Over the page, under the nav (z-50) and the top CTA: the panel in the hero's place, and the growing photo. */}
			<div ref={panel} aria-hidden="true" className="pointer-events-none invisible fixed inset-x-0 top-0 z-40 h-(--hero-h) bg-white" />
			<div ref={layer} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-40 overflow-hidden">
				<div ref={heroBox} className="absolute inset-x-0 top-0 h-(--hero-h)" />
				{/* eslint-disable-next-line @next/next/no-img-element -- a copy of an image already loaded on the page */}
				<img ref={photo} alt="" className="absolute max-w-none origin-top-left object-cover" />
				{/* The hero's shade and its darker band at the top (ProjectHero). */}
				<div ref={veil} className="absolute inset-0 opacity-0">
					<div className="absolute inset-0 bg-black/25" />
					<div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />
				</div>
			</div>
		</Ctx.Provider>
	);
}
