"use client";

import { useEffect } from "react";
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
 *   0.0s   the lime curtain already covers the page (from the first frame, globals.css); the wordmark
 *          across its foot comes in from a blur
 *   ready  fonts and the hero's media (photo or poster, and the video's first frame) have loaded and
 *          decoded (at most 2.5s), then the curtain holds briefly (CURTAIN_HOLD_MS, lib/curtain.js)
 *   lift   it wipes up off the page (0.7s); the page's entrances play as it goes (finishIntro), and the
 *          header items drop in
 * Reduced motion or no JS: there is no curtain (see INTRO_SCRIPT, lib/intro.js) and this does nothing.
 */
export default function Intro() {
	const lenis = useLenis();

	useEffect(() => {
		const root = document.documentElement;
		const nav = gsap.utils.toArray("[data-intro]");
		const showNav = () =>
			gsap.fromTo(nav, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.06, clearProps: "transform" });

		const curtain = document.querySelector("[data-curtain]");
		if (!root.classList.contains("js-anim") || !curtain) return finishIntro();

		lenis?.stop(); // the page stays put under the curtain
		let cancelled = false;
		const timers = [];
		const later = (fn, ms) => timers.push(setTimeout(() => !cancelled && fn(), ms));

		// Ready: fonts, the hero's photo or poster decoded (so it doesn't paint in as the curtain goes), and
		// its video able to play (so it doesn't crossfade over the poster mid-reveal).
		const heroImg = document.querySelector("[data-hero-media] img, [data-project-hero] img");
		const heroVideo = document.querySelector("[data-hero-media] video");
		const image = heroImg?.decode ? heroImg.decode().catch(() => {}) : Promise.resolve();
		const video = new Promise((done) => {
			if (!heroVideo || heroVideo.readyState >= 3) return done();
			heroVideo.addEventListener("canplay", done, { once: true });
			heroVideo.addEventListener("error", done, { once: true });
		});
		const readyNow = Promise.race([Promise.all([document.fonts.ready, image, video]), new Promise((done) => setTimeout(done, READY_CAP_MS))]);

		readyNow.then(() =>
			later(() => {
				const up = lift(curtain);
				later(() => {
					finishIntro(); // entrances play as the page is uncovered
					showNav();
					lenis?.start();
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
