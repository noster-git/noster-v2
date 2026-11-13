"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { lineRise } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * The project title, rising line by line out of its own masks when the page arrives (direct load or a
 * page transition). When the page was opened from a project card the photo-grow transition owns the
 * title instead (html[data-project-opening], globals.css), so this stays out of its way.
 */
export default function TitleRise({ className, children }) {
	const ref = useRef(null);

	useGSAP(() => {
		const el = ref.current;
		const root = document.documentElement;
		if (!root.classList.contains("js-anim")) return;
		if ("projectOpening" in root.dataset || "projectVt" in root.dataset) {
			el.removeAttribute("data-split"); // the card transition reveals it (data-project-title)
			return;
		}
		let split;
		Promise.all([ready(), document.fonts.ready]).then(() => {
			if (!el.isConnected) return;
			split = SplitText.create(el, { type: "lines", mask: "lines" });
			gsap.set(el, { autoAlpha: 1 });
			gsap.fromTo(split.lines, lineRise.from, { ...lineRise.to, delay: 0.15 });
		});
		return () => split?.revert();
	});

	return (
		<h1 ref={ref} data-project-title data-split className={className}>
			{children}
		</h1>
	);
}
