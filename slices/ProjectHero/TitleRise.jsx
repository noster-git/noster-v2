"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hasPlayed, lineRise, markPlayed, splitLines } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP);

/** Resolves once the project-open photo has handed over to the hero (html[data-project-opening] is gone). */
function handedOver(onStop) {
	const root = document.documentElement;
	return new Promise((done) => {
		if (!("projectOpening" in root.dataset)) return done();
		const watch = new MutationObserver(() => {
			if ("projectOpening" in root.dataset) return;
			watch.disconnect();
			done();
		});
		watch.observe(root, { attributes: true, attributeFilter: ["data-project-opening"] });
		onStop(() => watch.disconnect());
	});
}

/**
 * The project title, rising line by line out of its own masks as the page arrives: when the curtain lifts
 * (a load or a page change), or the moment the photo grown from a project card hands over to the hero
 * (ProjectTransition). Coming back to a project shows the title as it was left; opening it from a card
 * always brings it in, as part of that transition.
 */
export default function TitleRise({ className, children }) {
	const ref = useRef(null);

	useGSAP(() => {
		const el = ref.current;
		const root = document.documentElement;
		if (!root.classList.contains("js-anim")) return;
		const opening = "projectOpening" in root.dataset;
		if (hasPlayed(el) && !opening) return;
		// Split as soon as the fonts are in (under the curtain or the growing photo); the rise waits for the
		// page to be uncovered.
		let split;
		let rise;
		let stopWatch;
		let live = true;
		document.fonts.ready
			.then(() => {
				if (!live || !el.isConnected) return;
				split = splitLines(el);
				return opening ? handedOver((stop) => (stopWatch = stop)) : ready();
			})
			.then(() => {
				if (!live || !split) return;
				markPlayed(el);
				rise = gsap.to(split.lines, { ...lineRise.to, delay: opening ? 0 : 0.15, onComplete: split.restore });
			});
		return () => {
			live = false;
			stopWatch?.();
			rise?.progress(1).kill();
			split?.restore();
		};
	});

	return (
		<h1 ref={ref} data-project-title data-split className={className}>
			{children}
		</h1>
	);
}
