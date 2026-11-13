"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { useProjectTransition } from "@/components/ProjectTransition";
import { ArrowIcon, CornerIcon } from "@/components/Arrow";
import { EASE } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Desk: where each card sits on the 10-column grid, repeating every five cards (a row of 3 + 4 + 3
// columns, then a row of 5 + 5), and the photo's shape. Every row spans the full width, and the shapes
// keep every row the same height: 3 columns square, 4 columns at 4:3 and 5 columns at 5:3 all come out
// ≈ 0.29 × the page width tall. Written out so Tailwind sees them.
const PLACES = [
	["desk:col-span-3 desk:col-start-1", "desk:aspect-square"],
	["desk:col-span-4 desk:col-start-4", "desk:aspect-[4/3]"],
	["desk:col-span-3 desk:col-start-8", "desk:aspect-square"],
	["desk:col-span-5 desk:col-start-1", "desk:aspect-[5/3]"],
	["desk:col-span-5 desk:col-start-6", "desk:aspect-[5/3]"],
];
// Compact: two columns, every third card full width; upright tablets keep every card at one column.
const COMPACT = (i) => (i % 3 === 0 ? "col-span-2 [@media(min-width:600px)_and_(max-width:1100px)_and_(orientation:portrait)]:col-span-1" : "");

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * Project cards on the page grid: the name (Lucide corner-down-right in front, 14 / 16px) above the photo
 * (4:3; on desk shaped per column span so each row is one even height, ≈ 0.29 × the page width),
 * 6px column gaps, 6 lines between rows. With a mouse a
 * "View project" pill follows the pointer over the photos. Clicking a photo opens it into the project
 * hero (components/ProjectTransition.jsx).
 *
 * @param {{ works: { href: string, name: string, image: import("@prismicio/client").ImageField }[] }} props
 */
export default function WorksGrid({ works }) {
	const [cursorOn, setCursorOn] = useState(false);
	const { open, warm } = useProjectTransition();
	const scope = useRef(null);

	// Cards reveal in batches as they scroll in (the start state is held by CSS from the first frame,
	// .js-anim [data-card]): each rises 40px while its photo unmasks from the bottom and settles from 1.15×.
	useGSAP(
		() => {
			if (!document.documentElement.classList.contains("js-anim")) return;
			let triggers = [];
			ready().then(() => {
				if (!scope.current) return;
				triggers = ScrollTrigger.batch(gsap.utils.toArray("[data-card]", scope.current), {
					start: "top 90%",
					once: true,
					onEnter: (cards) => {
						const media = cards.map((c) => c.querySelector("[data-card-media]"));
						const imgs = cards.map((c) => c.querySelector("img")).filter(Boolean);
						gsap.fromTo(cards, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.2, ease: EASE, stagger: 0.1 });
						gsap.fromTo(media, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: 0.1, clearProps: "clipPath" });
						gsap.fromTo(imgs, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: EASE, stagger: 0.1, clearProps: "transform" });
					},
				});
			});
			return () => triggers.forEach((t) => t.kill());
		},
		{ scope },
	);

	return (
		<section ref={scope}>
			<ViewCursor active={cursorOn} />
			<div className="grid grid-cols-2 items-start gap-x-g gap-y-6 px-g pt-2 pb-8 desk:grid-cols-10 desk:pb-5">
				{works.map((work, i) => {
					const [place, shape] = PLACES[i % PLACES.length];
					return (
						<div key={work.href + i} data-card className={`flex min-w-0 flex-col ${COMPACT(i)} ${place}`}>
							<p className="mb-[6px] flex min-w-0 items-center gap-[0.3em] text-[14px] leading-[1.2] tracking-[-0.02em] desk:text-[16px]">
								<CornerIcon className="size-[0.85em] shrink-0" />
								<span className="truncate">{work.name}</span>
							</p>
							<Link
								href={work.href}
								aria-label={work.name}
								onMouseEnter={(e) => {
									setCursorOn(true);
									warm(e.currentTarget);
								}}
								onMouseLeave={() => setCursorOn(false)}
								onPointerDown={(e) => warm(e.currentTarget)}
								onClick={(e) => {
									setCursorOn(false); // the pill scales away as the photo opens
									open(e, work.href);
								}}
								data-card-media
								className={`relative block aspect-[4/3] overflow-hidden rounded-media desk-mouse:cursor-none ${shape}`}
							>
								<PrismicNextImage
									field={work.image}
									fill
									sizes="(min-width: 901px) 40vw, (min-width: 600px) 50vw, 100vw"
									fallbackAlt=""
									className="object-cover transition-[opacity,scale] duration-[1.2s] ease-out-quint hover:scale-[1.04] hover:opacity-95"
								/>
							</Link>
						</div>
					);
				})}
			</div>
		</section>
	);
}

/**
 * "View project" pill centred on the pointer over the photos: 7 × 14px padding, 6px radius, body text
 * with an 11px arrow; scales in and out in 0.28s. Rendered into <body> so no transformed ancestor can
 * trap its position: fixed.
 */
function ViewCursor({ active }) {
	const ref = useRef(null);
	const client = useIsClient();

	useEffect(() => {
		const move = (e) => {
			if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
		};
		document.addEventListener("pointermove", move);
		return () => document.removeEventListener("pointermove", move);
	}, []);

	if (!client) return null;
	return createPortal(
		<div ref={ref} aria-hidden="true" data-view-cursor className="pointer-events-none fixed top-0 left-0 z-[400] hidden will-change-transform desk-mouse:block">
			<div
				className={`flex -translate-1/2 items-center gap-[8px] rounded-ui bg-black px-[14px] py-[7px] whitespace-nowrap text-white transition-[scale] duration-[280ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] ${active ? "scale-100" : "scale-0"}`}
			>
				View project
				<ArrowIcon className="size-[11px]" />
			</div>
		</div>,
		document.body,
	);
}
