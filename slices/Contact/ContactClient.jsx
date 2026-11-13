"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { EASE, lineRise } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

/**
 * "Let's Build Together", on the white page:
 * - section top reaches 80% of the screen → the two rules draw in left→right (0.8s); back up → they retract;
 * - section top reaches 75% → the big title rises line by line out of its own masks, then the intro and the
 *   email / phone links rise in (once). Start states are held by CSS from the first frame (.js-anim
 *   [data-split] / [data-fade], globals.css), so nothing flashes.
 */
export default function ContactClient({ sliceType, variation, title, intro, contacts }) {
	const scope = useRef(null);
	const [lines, setLines] = useState(false);

	useGSAP(
		() => {
			ScrollTrigger.create({
				trigger: scope.current,
				start: "top 80%",
				onEnter: () => setLines(true),
				onLeaveBack: () => setLines(false),
			});

			if (!document.documentElement.classList.contains("js-anim")) return;
			const el = scope.current;
			let split;
			let trigger;
			Promise.all([ready(), document.fonts.ready]).then(() => {
				if (!el.isConnected) return;
				const heading = el.querySelector("[data-split]");
				split = SplitText.create(heading, { type: "lines", mask: "lines" });
				gsap.set(heading, { autoAlpha: 1 });
				gsap.set(split.lines, lineRise.from);
				const fades = gsap.utils.toArray("[data-fade]", el);
				trigger = ScrollTrigger.create({
					trigger: el,
					start: "top 75%",
					once: true,
					onEnter: () =>
						gsap
							.timeline()
							.to(split.lines, lineRise.to)
							.fromTo(fades, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08 }, "-=0.8"),
				});
			});
			return () => {
				trigger?.kill();
				split?.revert();
			};
		},
		{ scope },
	);

	const line = `absolute left-0 h-[2px] bg-(--ink) transition-all duration-800 ease-[cubic-bezier(0.83,0,0.17,1)] ${lines ? "w-full" : "w-0"}`;

	return (
		<section
			ref={scope}
			data-slice-type={sliceType}
			data-slice-variation={variation}
			className="relative w-full overflow-hidden px-g pt-8 pb-8"
		>
			<div className="relative">
				<div className={`top-0 ${line}`} />
				<div className={`bottom-0 ${line}`} />

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
