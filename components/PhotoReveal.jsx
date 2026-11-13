"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EASE } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Reveals every [data-photo-reveal] inside it as it scrolls in, in batches: the photo unmasks from the
 * bottom (1.3s expo.inOut) and settles from 1.15×, 0.1s apart. Start state held by CSS (.js-anim
 * [data-photo-reveal], globals.css). Renders as `as` (default div) with the given props.
 */
export default function PhotoReveal({ as: Tag = "div", children, ...props }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			if (!document.documentElement.classList.contains("js-anim")) return;
			let triggers = [];
			ready().then(() => {
				if (!scope.current) return;
				triggers = ScrollTrigger.batch(gsap.utils.toArray("[data-photo-reveal]", scope.current), {
					start: "top 92%",
					once: true,
					onEnter: (items) => {
						const imgs = items.map((p) => p.querySelector("img")).filter(Boolean);
						gsap.set(items, { autoAlpha: 1 });
						gsap.fromTo(items, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: 0.1, clearProps: "clipPath" });
						gsap.fromTo(imgs, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: EASE, stagger: 0.1, clearProps: "transform" });
					},
				});
			});
			return () => triggers.forEach((t) => t.kill());
		},
		{ scope },
	);

	return (
		<Tag ref={scope} {...props}>
			{children}
		</Tag>
	);
}
