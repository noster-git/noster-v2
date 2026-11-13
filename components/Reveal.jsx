"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { reveal, lineRise, EASE } from "@/lib/motion";
import { ready } from "@/lib/intro";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

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
 */
export default function Reveal({ as: Tag = "section", children, ...props }) {
	const scope = useRef(null);

	useGSAP(
		() => {
			const items = gsap.utils.toArray("[data-reveal]", scope.current);
			if (!items.length || !document.documentElement.classList.contains("js-anim")) return;
			// The trigger is set up straight away (under the curtain); it plays once the entrances are released.
			let live = true;
			let tl;
			const splits = [];
			const play = () => {
				tl = gsap.timeline();
				items.forEach((el, i) => {
					const at = i * GAP;
					const kind = el.getAttribute("data-reveal");
					if (kind === "lines") {
						// linesClass → each mask is .reveal-line-mask (room for descenders, globals.css).
						const split = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "reveal-line" });
						splits.push(split);
						tl.set(el, { autoAlpha: 1 }, at).fromTo(split.lines, lineRise.from, lineRise.to, at);
					} else if (kind === "rule") {
						tl.set(el, { autoAlpha: 1, transformOrigin: "left center" }, at).fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: EASE, clearProps: "transform" }, at);
					} else {
						tl.fromTo(el, reveal.from, { ...reveal.to, stagger: 0 }, at);
					}
				});
			};
			const trigger = ScrollTrigger.create({
				trigger: scope.current,
				start: "top 85%",
				once: true,
				// Lines are split once the fonts are in, so the line breaks are the final ones.
				onEnter: () => Promise.all([ready(), document.fonts.ready]).then(() => live && play()),
			});
			return () => {
				live = false;
				trigger.kill();
				tl?.kill();
				splits.forEach((s) => s.revert());
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
