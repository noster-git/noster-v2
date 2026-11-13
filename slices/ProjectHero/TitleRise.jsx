"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { lineRise } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * The project title, rising line by line out of its own masks when the page arrives (direct load or the
 * curtain lifting). When the page was opened from a project card, the photo-grow transition owns the
 * title instead (html[data-project-opening], globals.css), so this stays out of its way.
 */
export default function TitleRise({ className, children }) {
	const ref = useRef(null);

	useGSAP(() => {
		const el = ref.current;
		const root = document.documentElement;
		if (!root.classList.contains("js-anim")) return;
		if ("projectOpening" in root.dataset) {
			// Opened from a project card: the photo-grow owns the title (it rises in after the hand-over,
			// html[data-project-opening], globals.css).
			el.removeAttribute("data-split");
			return;
		}
		// Split as soon as the fonts are in (under the curtain); the gate only starts the rise.
		let split;
		let live = true;
		document.fonts.ready
			.then(() => {
				if (!live || !el.isConnected) return;
				split = SplitText.create(el, { type: "lines", mask: "lines" });
				gsap.set(split.lines, lineRise.from);
				gsap.set(el, { autoAlpha: 1 });
				return ready();
			})
			.then(() => live && split && gsap.to(split.lines, { ...lineRise.to, delay: 0.15 }));
		return () => {
			live = false;
			split?.revert();
		};
	});

	return (
		<h1 ref={ref} data-project-title data-split className={className}>
			{children}
		</h1>
	);
}
