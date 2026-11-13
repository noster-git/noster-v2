"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const setTheme = (dark) => {
	if (dark) document.documentElement.dataset.theme = "dark";
	else delete document.documentElement.dataset.theme;
};

/**
 * Same behaviour as the live site (old ContactShowcase):
 * - section top reaches 80% of the screen → the two rules draw in left→right (0.8s); back up → they retract;
 * - section top reaches 35% → page turns dark immediately, 400ms later the two extra title copies slide in
 *   (one up from behind, one down and fading in); back up → copies retract immediately, page turns light after 500ms.
 */
export default function ContactClient({ sliceType, variation, title, intro, contacts }) {
	const scope = useRef(null);
	const [lines, setLines] = useState(false);
	const [copies, setCopies] = useState(false);

	useGSAP(
		() => {
			const timers = [];
			const later = (fn, ms) => timers.push(setTimeout(fn, ms));

			ScrollTrigger.create({
				trigger: scope.current,
				start: "top 80%",
				onEnter: () => setLines(true),
				onLeaveBack: () => setLines(false),
			});
			ScrollTrigger.create({
				trigger: scope.current,
				start: "top 35%",
				onEnter: () => {
					setTheme(true);
					later(() => setCopies(true), 400);
				},
				onLeaveBack: () => {
					setCopies(false);
					later(() => setTheme(false), 500);
				},
			});

			return () => {
				timers.forEach(clearTimeout);
				setTheme(false);
			};
		},
		{ scope },
	);

	const quint = "duration-600 ease-[cubic-bezier(0.85,0,0.15,1)]";
	const line = `absolute left-0 h-[2px] bg-(--ink) transition-all duration-800 ease-[cubic-bezier(0.83,0,0.17,1)] ${lines ? "w-full" : "w-0"}`;
	// Lime once the page is dark, like live.
	const heading = "text-[86px] leading-[normal] font-normal tracking-[-0.55vw] my-[0.25em] md:my-0 md:tracking-[-0.16669vw] lg:text-[10.375em] [[data-theme=dark]_&]:text-lime transition-colors duration-300 ease-quart";

	return (
		<section
			ref={scope}
			data-slice-type={sliceType}
			data-slice-variation={variation}
			className="relative w-full overflow-hidden px-[1vw] pb-[5vw] text-[3vw] md:p-[2vw] md:text-[1.3vw] lg:text-[1vw]"
		>
			{/* transparent 1px border like live: keeps the inner 3em margins inside, so the lines sit clear of the text */}
			<div className="relative border border-transparent">
				<div className={`top-0 ${line}`} />
				<div className={`bottom-0 ${line}`} />

				<div className="mt-[3em] flex flex-col items-start px-[1vw] md:items-center md:px-0">
					<div aria-hidden="true" className={`relative hidden transition-all md:block ${quint} ${copies ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
						<p className={heading}>{title}</p>
					</div>
					<div className="relative">
						<h2 className={heading}>{title}</h2>
					</div>
					<div aria-hidden="true" className={`relative hidden transition-all md:block ${quint} ${copies ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
						<p className={heading}>{title}</p>
					</div>
				</div>

				<div className="mx-0 my-[3em] flex w-full flex-col items-start justify-between px-[1vw] md:flex-row md:px-0">
					<div className="w-[70%] md:w-[30%]">
						<p className="w-[16ch] text-[1.9em] leading-none tracking-[-0.01em] md:text-[2em]">{intro}</p>
					</div>
					<div className="flex w-[70%] flex-col items-start py-[1em] md:items-end md:py-0">
						{contacts.map((c) => (
							<a key={c.value} href={c.href} className="text-[1.9em] leading-[1.395] tracking-[-0.04vw] md:text-[2em]">
								{c.value}
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
