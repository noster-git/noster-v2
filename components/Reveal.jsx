"use client";

import { useRef } from "react";
import gsap from "gsap";
import { reveal, lineRise, EASE, hasPlayed, markPlayed, splitLines } from "@/lib/motion";
import { ready } from "@/lib/intro";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const GAP = reveal.to.stagger; // 0.08s between items, in reading order

/**
 * Plays every [data-reveal] element inside it, in DOM (reading) order, as the block scrolls into view,
 * after the page-load intro. The elements are already held hidden by CSS (.js-anim, globals.css), so
 * this only ever animates them in: no flash. Renders as the given element (default section) so it can
 * be a slice's root. One choreography for the whole site; each element says how it enters:
 *
 *   data-reveal          fades up 32px (1.1s expo.out)              — labels, details, blocks
 *   data-reveal="lines"  its lines rise out of their own masks      — headings, lead statements
 *                        (the hero/project-title move, lib/motion.js → lineRise)
 *   data-reveal="rule"   draws across from the left (scaleX 0 → 1)  — ruled lines (LineCta)
 *
 * Plays once: coming back to the page shows the block as it was left (lib/motion.js → hasPlayed).
 */
export default function Reveal({ as: Tag = "section", children, ...props }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			const block = scope.current;
			const items = gsap.utils.toArray("[data-reveal]", block);
			if (!items.length || hasPlayed(block) || !document.documentElement.classList.contains("js-anim")) return;
			// The trigger is set up straight away (under the curtain); it plays once the entrances are released.
			let live = true;
			let tl;
			// Lines are split as soon as the fonts are in (so the line breaks are the final ones), under the
			// curtain rather than in the frame it lifts.
			const splits = new Map();
			const split = document.fonts.ready.then(() => {
				if (!live || !block.isConnected) return;
				items.forEach((el) => el.getAttribute("data-reveal") === "lines" && splits.set(el, splitLines(el)));
			});
			const play = () => {
				markPlayed(block);
				tl = gsap.timeline();
				items.forEach((el, i) => {
					const at = i * GAP;
					const kind = el.getAttribute("data-reveal");
					const lines = splits.get(el);
					if (lines) {
						tl.to(lines.lines, { ...lineRise.to, onComplete: lines.restore }, at);
					} else if (kind === "rule") {
						tl.set(el, { autoAlpha: 1, transformOrigin: "left center" }, at).fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE, clearProps: "transform" }, at);
					} else {
						tl.fromTo(el, reveal.from, { ...reveal.to, stagger: 0 }, at);
					}
				});
			};
			const trigger = ScrollTrigger.create({
				trigger: block,
				start: "top 85%",
				once: true,
				onEnter: () => Promise.all([ready(), split]).then(() => live && play()),
			});
			return () => {
				live = false;
				trigger.kill();
				// Leaving mid-entrance: finish it, so coming back shows the block as it ends.
				tl?.progress(1).kill();
				splits.forEach((s) => s.restore());
			};
		},
		{ scope },
	);

	return (
		<Tag ref={scope} {...props}>
			{children}
		</Tag>
	);
}
