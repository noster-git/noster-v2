"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { hasPlayed, lineRise, markPlayed, reveal, splitLines } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * "Let's Build Together", on the white page:
 * - section top reaches 80% of the screen → the two rules draw in left→right (0.8s), once;
 * - section top reaches 75% → the big title rises line by line out of its own masks, then the intro and the
 *   email / phone links rise in (once). Start states are held by CSS from the first frame (.js-anim
 *   [data-rule] / [data-split] / [data-fade], globals.css), so nothing flashes; without them (reduced
 *   motion, no JS) everything is simply shown, the rules drawn.
 */
export default function ContactClient({ sliceType, variation, title, intro, contacts }) {
	const scope = useRef(null);
	const [drawn, setDrawn] = useState(false);

	useGSAP(
		() => {
			const el = scope.current;
			if (!document.documentElement.classList.contains("js-anim")) return;
			let live = true;
			// The rules draw once the entrances are released. The state outlives the page being hidden and
			// shown again (cacheComponents), so coming back shows them drawn.
			const rules = ScrollTrigger.create({
				trigger: el,
				start: "top 80%",
				once: true,
				onEnter: () => ready().then(() => live && setDrawn(true)),
			});
			if (hasPlayed(el)) {
				return () => {
					live = false;
					rules.kill();
				};
			}
			// Split as soon as the fonts are in (not in the frame the curtain lifts); plays once in view and
			// the entrances are released. Once only: coming back shows it as it was left.
			let split;
			let trigger;
			let tl;
			document.fonts.ready.then(() => {
				if (!live || !el.isConnected) return;
				split = splitLines(el.querySelector("[data-split]"));
				const fades = gsap.utils.toArray("[data-fade]", el);
				trigger = ScrollTrigger.create({
					trigger: el,
					start: "top 75%",
					once: true,
					onEnter: () =>
						ready().then(() => {
							if (!live) return;
							markPlayed(el);
							tl = gsap
								.timeline()
								.to(split.lines, { ...lineRise.to, onComplete: split.restore })
								.fromTo(fades, reveal.from, reveal.to, "-=0.8");
						}),
				});
			});
			return () => {
				live = false;
				rules.kill();
				trigger?.kill();
				tl?.progress(1).kill();
				split?.restore();
			};
		},
		{ scope },
	);

	// Held undrawn by CSS while js-anim is set (.js-anim [data-rule], globals.css); drawing clears that.
	const line = "absolute inset-x-0 h-[2px] bg-(--ink) transition-transform duration-800 ease-quart motion-reduce:transition-none";
	const rule = drawn ? { transform: "none" } : undefined;

	return (
		<section
			ref={scope}
			data-slice-type={sliceType}
			data-slice-variation={variation}
			className="relative w-full overflow-hidden px-m pt-6 pb-6"
		>
			<div className="relative">
				<div data-rule aria-hidden="true" style={rule} className={`top-0 ${line}`} />
				<div data-rule aria-hidden="true" style={rule} className={`bottom-0 ${line}`} />

				<div className="flex flex-col items-start pt-3 desk:items-center">
					<h2 data-split className="text-display py-[0.08em] desk:text-center">
						{title}
					</h2>
				</div>

				<div className="grid-site gap-y-2 pt-3 pb-3">
					<p data-fade className="col-span-5 text-lead desk:col-span-4">
						{intro}
					</p>
					<div className="col-span-5 flex flex-col items-start desk:col-span-4 desk:col-start-7 desk:items-end">
						{contacts.map((c) => (
							<a key={c.value} data-fade href={c.href} className="text-lead transition-colors duration-200 hover:text-muted">
								{c.value}
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
