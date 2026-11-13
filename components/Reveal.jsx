"use client";

import { useRef } from "react";
import gsap from "gsap";
import { reveal } from "@/lib/motion";
import { ready } from "@/lib/intro";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Fades and lifts every [data-reveal] element inside it as it scrolls into view, in DOM order, after the
 * page-load intro. The elements are already held hidden by CSS (.js-anim, globals.css), so this only
 * ever animates them in: no flash. Renders as the given element (default section) so it can be a slice's root.
 */
export default function Reveal({ as: Tag = "section", children, ...props }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			const items = gsap.utils.toArray("[data-reveal]", scope.current);
			if (!items.length || !document.documentElement.classList.contains("js-anim")) return;
			let tween;
			ready().then(() => {
				if (!scope.current) return;
				tween = gsap.fromTo(items, reveal.from, {
					...reveal.to,
					scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
				});
			});
			return () => tween?.scrollTrigger?.kill();
		},
		{ scope },
	);

	return (
		<Tag ref={scope} {...props}>
			{children}
		</Tag>
	);
}
