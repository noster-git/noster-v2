"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { finishIntro } from "@/lib/intro";
import { EASE } from "@/lib/motion";
import { CURTAIN_HOLD_MS, CURTAIN_MS, REVEAL_AT, lift } from "@/lib/curtain";

const READY_CAP_MS = 2500; // longest it waits for fonts and the hero media

/**
 * Page-load intro, on every full page load (mounted in the layout, so client-side navigations don't
 * replay it; they run the same curtain through PageTransition).
 *
 *   0.0s   the lime curtain already covers the page (from the first frame, globals.css), the wordmark
 *          across its foot already in place (as a page change holds it)
 *   ready  fonts and the hero's media (photo or poster, and the video's first frame) have loaded and
 *          decoded (at most 2.5s), then the curtain holds briefly (CURTAIN_HOLD_MS, lib/curtain.js)
 *   lift   it wipes up off the page (0.7s); the page's entrances play as it goes (finishIntro), and the
 *          header items drop in
 * Reduced motion or no JS: there is no curtain (see INTRO_SCRIPT, lib/intro.js) and this does nothing.
 */
export default function Intro() {
	const lenis = useLenis();
	// Lenis is created after this first runs (in its provider's own effect): keep the latest instance, and
	// hold the page still under the curtain as soon as it exists, as a page change does.
	const lenisRef = useRef(lenis);
	const lifted = useRef(false);
	useEffect(() => {
		lenisRef.current = lenis;
		if (lenis && !lifted.current && document.documentElement.classList.contains("js-anim")) lenis.stop();
	}, [lenis]);

	useEffect(() => {
		const root = document.documentElement;
		const nav = gsap.utils.toArray("[data-intro]");
		// Header items drop in from above; items at the foot of the screen (data-intro="up", the phone CTA)
		// rise in from below, towards the middle of the screen like the rest.
		const showNav = () => {
			const to = { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.06, clearProps: "transform" };
			const up = nav.filter((el) => el.dataset.intro === "up");
			const down = nav.filter((el) => el.dataset.intro !== "up");
			if (down.length) gsap.fromTo(down, { autoAlpha: 0, y: -12 }, { ...to });
			if (up.length) gsap.fromTo(up, { autoAlpha: 0, y: 12 }, { ...to });
		};

		// From the lift on, the main element (data-lcp) is held in its start state like the rest (globals.css).
		const lifting = () => root.classList.add("intro-lift");
		const curtain = document.querySelector("[data-curtain]");
		if (!root.classList.contains("js-anim") || !curtain) {
			lifting();
			gsap.set(nav, { autoAlpha: 1 }); // the header items are held hidden while js-anim is set
			return finishIntro();
		}

		let cancelled = false;
		const timers = [];
		const later = (fn, ms) => timers.push(setTimeout(() => !cancelled && fn(), ms));

		// Ready: fonts, the hero's photo or poster decoded (so it doesn't paint in as the curtain goes), and
		// its video able to play (so it doesn't crossfade over the poster mid-reveal).
		const heroImg = document.querySelector("[data-hero-media] img, [data-project-hero] img");
		const heroVideo = document.querySelector("[data-hero-media] video");
		const image = heroImg?.decode ? heroImg.decode().catch(() => {}) : Promise.resolve();
		// A video with no source for this screen (an uploaded showreel is desk only) never loads.
		const loads = [...(heroVideo?.querySelectorAll("source") ?? [])].some((s) => !s.media || matchMedia(s.media).matches);
		const video = new Promise((done) => {
			if (!heroVideo || !loads || heroVideo.readyState >= 3) return done();
			heroVideo.addEventListener("canplay", done, { once: true });
			heroVideo.addEventListener("error", done, { once: true });
		});
		const readyNow = Promise.race([Promise.all([document.fonts.ready, image, video]), new Promise((done) => setTimeout(done, READY_CAP_MS))]);

		readyNow.then(() =>
			later(() => {
				lifting();
				const up = lift(curtain);
				later(() => {
					finishIntro(); // entrances play as the page is uncovered
					showNav();
					lifted.current = true;
					lenisRef.current?.start();
				}, CURTAIN_MS * REVEAL_AT);
				up.finished.then(() => {
					if (cancelled) return;
					up.cancel();
					curtain.style.display = "none"; // PageTransition shows it again for page changes
					root.classList.add("intro-skip");
				});
			}, CURTAIN_HOLD_MS),
		);

		return () => {
			cancelled = true;
			timers.forEach(clearTimeout);
		};
		// Once per page load: the layout keeps this mounted across navigations.
	}, []);

	return null;
}
