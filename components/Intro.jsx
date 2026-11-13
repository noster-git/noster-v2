"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { useLenis } from "lenis/react";
import { finishIntro } from "@/lib/intro";
import { EASE } from "@/lib/motion";

/**
 * Page-load intro, once per page load (mounted in the layout, so client-side navigations don't replay it).
 *
 * First visit of a session, landing on Home (the curtain in app/layout.js is showing):
 *   0.0s  the Noster logo rises into the white curtain
 *   0.85s it leaves upwards, and the curtain lifts off the page (clip from the bottom up)
 *   ≈1.1s the page takes over (finishIntro): the hero settles, its title rises line by line
 *   …     the header items drop in one by one
 * Other pages and repeat visits: no curtain; the page and header start at once.
 * Reduced motion or no JS: nothing is hidden (see INTRO_SCRIPT, lib/intro.js) and this does nothing.
 */
export default function Intro() {
	const lenis = useLenis();

	useEffect(() => {
		const root = document.documentElement;
		const nav = gsap.utils.toArray("[data-intro]");
		const showNav = (delay = 0) =>
			gsap.fromTo(nav, { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.06, delay, clearProps: "transform" });

		if (!root.classList.contains("js-anim")) return finishIntro();

		const curtain = document.querySelector("[data-curtain]");
		if (root.classList.contains("intro-skip") || !curtain) {
			finishIntro();
			showNav(0.35);
			return;
		}

		lenis?.stop(); // the page stays put under the curtain
		const logo = curtain.querySelector("[data-curtain-logo]");
		const tl = gsap.timeline({
			onComplete: () => {
				curtain.style.display = "none";
				root.classList.add("intro-skip");
				try {
					sessionStorage.setItem("noster-intro", "1");
				} catch {}
				lenis?.start();
			},
		});
		tl.fromTo(logo, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: EASE })
			.to(logo, { yPercent: -110, duration: 0.45, ease: "expo.in" }, "+=0.15")
			.fromTo(curtain, { clipPath: "inset(0% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut" }, "-=0.15")
			.add(finishIntro, "-=0.7")
			.add(() => showNav(), "-=0.45");

		return () => tl.kill();
		// Once per page load: the layout keeps this mounted across navigations.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;
}
