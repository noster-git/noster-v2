"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Hero photo drift (home hero, project heroes). Heroes sit at the very top, so the photo starts in place
 * (no gap above it) and sinks `drift` px while its parent scrolls away (300px over a full-screen hero,
 * ~0.33px per px scrolled, so the gap it opens at the top stays above the screen). Give it 110% of the
 * hero's height so the foot never shows. Optional [data-parallax-shade] children darken from 0 to
 * `shade` over the same scroll, so the photo recedes as the next section comes up. Off under reduced motion.
 * Other props (a click-to-edit `data-sanity`) go on its element.
 */
export default function Parallax({ children, className, drift = 300, shade = 0, ...props }) {
	const ref = useRef(null);

	useGSAP(() => {
		gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
			const scrollTrigger = { trigger: ref.current.parentElement, start: "top top", end: "bottom top", scrub: true };
			gsap.fromTo(ref.current, { y: 0 }, { y: drift, ease: "none", scrollTrigger });
			const shades = ref.current.querySelectorAll("[data-parallax-shade]");
			if (shade && shades.length) gsap.fromTo(shades, { opacity: 0 }, { opacity: shade, ease: "none", scrollTrigger: { ...scrollTrigger } });
		});
	});

	return (
		<div ref={ref} className={className} {...props}>
			{children}
		</div>
	);
}
