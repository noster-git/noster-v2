"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The hero sits at the very top, so the photo starts in place (no gap above it) and sinks up to
// 300px while the hero scrolls away — about the same speed as live (~0.25px per px scrolled).
const DRIFT = 300;

export default function Parallax({ children, className }) {
	const ref = useRef(null);

	useGSAP(() => {
		gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
			gsap.fromTo(
				ref.current,
				{ y: 0 },
				{ y: DRIFT, ease: "none", scrollTrigger: { trigger: ref.current.parentElement, start: "top top", end: "bottom top", scrub: true } },
			);
		});
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
