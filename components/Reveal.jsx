"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Fades and lifts every [data-reveal] element inside it when it scrolls into view, in DOM order.
 * Renders as the given element (default section) so it can be a slice's root.
 */
export default function Reveal({ as: Tag = "section", children, ...props }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from("[data-reveal]", {
					autoAlpha: 0,
					y: 40,
					duration: 1.2,
					ease: "expo.out",
					stagger: 0.12,
					scrollTrigger: { trigger: scope.current, start: "top 80%", once: true },
				});
			});
		},
		{ scope },
	);

	return (
		<Tag ref={scope} {...props}>
			{children}
		</Tag>
	);
}
