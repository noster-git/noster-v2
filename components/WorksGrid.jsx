"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Img from "@/components/Img";
import { useProjectTransition } from "@/components/ProjectTransition";
import { ArrowIcon, CornerIcon } from "@/components/Arrow";
import { revealBatch } from "@/lib/motion";
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
// Compact: two columns, every third card full width; large phones (600–767px) keep every card at one column.
const COMPACT = (i) => (i % 3 === 0 ? "col-span-2 [@media(min-width:600px)_and_(max-width:767px)]:col-span-1" : "");
// The photo widths those layouts give, so each card fetches a file its own size.
const SIZES = (i, place) =>
	`(min-width: 768px) ${+place.match(/col-span-(\d+)/)[1] * 10}vw, ` + (i % 3 === 0 ? "(min-width: 600px) 50vw, 100vw" : "50vw");

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * Project cards on the page grid: the name (Lucide corner-down-right in front, 14 / 16px) above the photo
 * (4:3; on desk shaped per column span so each row is one even height, ≈ 0.29 × the page width),
 * 6px column gaps, 6 lines between rows. With a mouse a "View project" pill follows the pointer over the
 * photos. Clicking a photo grows it into the project hero (components/ProjectTransition.jsx). Card links
 * carry data-glimm-skip: the page sweep (SiteSweep) leaves them to that.
 *
 * @param {{ works: { href: string, name: string, image: import("@prismicio/client").ImageField, hero?: import("@prismicio/client").ImageField | null }[] }} props
 */
export default function WorksGrid({ works }) {
	const [cursorOn, setCursorOn] = useState(false);
	const { open, warm } = useProjectTransition();
	// Cards hovered/pressed so far: each preloads its project's hero photo (below), so the photo that
	// grows on click is already the hero's own and the project page shows it at once.
	const [preload, setPreload] = useState(() => new Set());
	const warmCard = (e, i) => {
		warm(e.currentTarget);
		setPreload((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
	};
	const scope = useRef(null);

	// Cards reveal in batches as they scroll in (the start state is held by CSS from the first frame,
	// .js-anim [data-card]): each rises 40px while its photo unmasks from the bottom, then its name slides
	// up out of its mask as the photo opens (revealBatch, lib/motion.js). The triggers are set up straight
	// away (under the curtain, not in the frame it lifts); a batch plays once the entrances are released.
	useGSAP(
		() => {
			if (!document.documentElement.classList.contains("js-anim")) return;
			const stops = [];
			const triggers = ScrollTrigger.batch(gsap.utils.toArray("[data-card]", scope.current), {
				start: "top 90%",
				once: true,
				onEnter: (cards) => stops.push(revealBatch(cards, ready, { rise: 40 })),
			});
			return () => {
				stops.forEach((stop) => stop());
				triggers.forEach((t) => t.kill());
			};
		},
		{ scope },
	);

	return (
		<section ref={scope}>
			<ViewCursor active={cursorOn} />
			<div className="grid grid-cols-2 items-start gap-x-g gap-y-4 px-m pt-2 pb-6 desk:grid-cols-10 desk:pb-4">
				{works.map((work, i) => {
					const [place, shape] = PLACES[i % PLACES.length];
					return (
						<div key={work.href} data-card className={`relative flex min-w-0 flex-col ${COMPACT(i)} ${place}`}>
							{/* Clips the name so it can rise into view after its photo (revealBatch); the padding keeps
							    descenders inside the clip and the margin makes up for it, so the spacing is unchanged. */}
							<p className="mb-[3px] overflow-hidden pb-[3px] text-name">
								<span data-card-name className="flex min-w-0 items-center gap-[0.3em]">
									<CornerIcon className="size-[0.85em] shrink-0" />
									<span className="truncate">{work.name}</span>
								</span>
							</p>
							<Link
								href={work.href}
								aria-label={work.name}
								// Full prefetch: the project's own content too, not just the shared page shell
								// (partialPrefetching), so it's ready when the photo has grown.
								prefetch
								onMouseEnter={(e) => {
									setCursorOn(true);
									warmCard(e, i);
								}}
								onMouseLeave={() => setCursorOn(false)}
								onPointerDown={(e) => warmCard(e, i)}
								onClick={(e) => {
									setCursorOn(false); // the pill scales away as the photo opens
									open(e, work.href);
								}}
								data-card-media
								data-glimm-skip
								// Press feedback: the card gives a little (0.98) the moment it's pressed, before the photo grows.
								className={`relative block aspect-[4/3] overflow-hidden rounded-media transition-[scale] duration-100 ease-out active:scale-[0.98] desk-mouse:cursor-none ${shape}`}
							>
								<Img field={work.image} fill sizes={SIZES(i, place)} fallbackAlt="" className="object-cover" />
							</Link>
							{/* The project hero's photo, loaded invisibly once the card is hovered: same image, same
							    sizes as ProjectHero, so the browser fetches exactly the file the hero will show. */}
							{work.hero && preload.has(i) && (
								<span data-hero-preload aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
									<Img field={work.hero} fill sizes="100vw" loading="eager" fallbackAlt="" className="object-cover" />
								</span>
							)}
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
