"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Live site moves the photo a fixed -300px → 300px while it crosses the viewport.
const DRIFT = 300;

export default function Parallax({ children, className }) {
	const ref = useRef(null);

	useGSAP(() => {
		gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
			gsap.fromTo(
				ref.current,
				{ y: -DRIFT },
				{ y: DRIFT, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } },
			);
		});
	});

	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
}
