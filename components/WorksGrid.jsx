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
import { hasPlayed, markPlayed, revealBatch } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Desk: cards fill rows of the 10-column grid in a repeating cadence: one full-width lead, a row of
// 3 + 4 + 3 columns (the middle card dropped a little, so the row doesn't read as one straight edge),
// then a row of 5 + 5. A last row the cards don't fill takes the row shape for the cards it has (one card
// runs full width, two split 5 + 5), so the grid never ends on a gap. 3 columns are square, 4 at 4:3 and
// 5 at 5:3 (≈ 0.29 × the page width tall); the lead is 21:9. Written out so Tailwind sees them.
const CADENCE = [[10], [3, 4, 3], [5, 5]];
const FIT = { 1: [10], 2: [5, 5], 3: [3, 4, 3] };
const SPAN = { 3: "desk:col-span-3", 4: "desk:col-span-4", 5: "desk:col-span-5", 10: "desk:col-span-10" };
const START = { 1: "desk:col-start-1", 4: "desk:col-start-4", 6: "desk:col-start-6", 8: "desk:col-start-8" };
const SHAPE = { 3: "desk:aspect-square", 4: "desk:aspect-[4/3]", 5: "desk:aspect-[5/3]", 10: "desk:aspect-[21/9]" };

/** Each card's desk place: { span, cls } in card order, following CADENCE. */
function places(count) {
	const out = [];
	for (let r = 0; out.length < count; r++) {
		let row = CADENCE[r % CADENCE.length];
		if (out.length + row.length > count) row = FIT[count - out.length];
		let col = 1;
		row.forEach((span, k) => {
			const dropped = row.length === 3 && k === 1 ? "desk:mt-6" : "";
			out.push({ span, cls: `${SPAN[span]} ${START[col]} ${dropped}` });
			col += span;
		});
	}
	return out;
}

// Compact: two columns, every third card full width; large phones (600–767px) keep every card at one column.
const COMPACT = (i) => (i % 3 === 0 ? "col-span-2 [@media(min-width:600px)_and_(max-width:767px)]:col-span-1" : "");
// The photo widths those layouts give, so each card fetches a file its own size.
const SIZES = (i, span) => `(min-width: 768px) ${span * 10}vw, ` + (i % 3 === 0 ? "(min-width: 600px) 50vw, 100vw" : "50vw");
const pad = (n) => String(n).padStart(2, "0");

const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

/**
 * A value kept outside React state: only the components that read it (useSyncExternalStore) re-render
 * when it changes, not the list that sets it.
 */
export function valueStore(initial) {
	let value = initial;
	const subs = new Set();
	return {
		get: () => value,
		set(next) {
			if (next === value) return;
			value = next;
			subs.forEach((fn) => fn());
		},
		subscribe(fn) {
			subs.add(fn);
			return () => subs.delete(fn);
		},
	};
}

const SETTLE_MS = 200; // touch: cards preload their hero once the cards on screen have stopped changing this long

/**
 * Project cards on the page grid: the name (Lucide corner-down-right in front, 14 / 16px) and its number
 * above the photo (4:3; on desk shaped per column span, see CADENCE), 6px column gaps, 6 lines between rows.
 * With a mouse a "View project" pill follows the pointer over the photos and the photo eases in to 1.04
 * (globals.css). Clicking a photo grows it into the project hero (components/ProjectTransition.jsx); the
 * page curtain (PageTransition) leaves card links (data-card-media) to that.
 *
 * `lead`: the grid opens the page, so the first photo is its LCP: it loads at high priority (eager) and
 * is painted under the load curtain (data-lcp, globals.css). Leave it off where the grid sits below the fold.
 *
 * `entrance` (default on): the cards reveal as they scroll in. Off, they are shown as they are, already
 * played (the works page's Grid / List toggle).
 *
 * `edit` on a work (studio preview only): what its photo and name open for editing (toWorks).
 *
 * @param {{ lead?: boolean, entrance?: boolean, works: { href: string, name: string, image: import("@/lib/sanity/image").SanityImage, hero?: import("@/lib/sanity/image").SanityImage | null, edit?: { item?: string, name?: string } }[] }} props
 */
export default function WorksGrid({ works, lead = false, entrance = true }) {
	// The "View project" pill's state lives outside the grid, so hovering a card re-renders only the pill.
	const [cursor] = useState(() => valueStore(false));
	const { open, warm } = useProjectTransition();
	// Cards hovered/pressed so far: each preloads its project's hero photo (below), so the photo that
	// grows on click is already the hero's own and the project page shows it at once.
	const [preload, setPreload] = useState(() => new Set());
	const warmCard = (e, i) => {
		warm(e.currentTarget);
		setPreload((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
	};
	// Touch: the cards on screen (once the scroll rests) that preload their hero.
	const [near, setNear] = useState([]);
	const scope = useRef(null);

	// Touch screens have no hover to warm a card before it's tapped, so there the cards on screen preload
	// their project's hero photo. The photo that grows on a tap is then the hero's own, as with a mouse,
	// rather than the card's photo swapping for the hero's as it lands. Every card on screen does, but only
	// once the cards on screen stop changing (SETTLE_MS), so a fast scroll down a long grid doesn't fetch every
	// full-width hero on the way.
	// Starts once the curtain has lifted, so it never competes with the page's own first load.
	useEffect(() => {
		if (!window.matchMedia("(hover: none)").matches) return;
		let io;
		let live = true;
		let settle;
		const onScreen = new Set();
		ready().then(() => {
			if (!live || !scope.current) return;
			io = new IntersectionObserver((entries) => {
				entries.forEach((e) => {
					const i = Number(e.target.dataset.i);
					if (e.isIntersecting) onScreen.add(i);
					else onScreen.delete(i);
				});
				clearTimeout(settle);
				settle = setTimeout(() => {
					const next = [...onScreen].sort((a, b) => a - b);
					setNear((prev) => (prev.length === next.length && prev.every((n, k) => n === next[k]) ? prev : next));
				}, SETTLE_MS);
			});
			scope.current.querySelectorAll("[data-card]").forEach((card) => io.observe(card));
		});
		return () => {
			live = false;
			clearTimeout(settle);
			io?.disconnect();
		};
	}, []);

	// Cards reveal in batches as they scroll in (the start state is held by CSS from the first frame,
	// .js-anim [data-card]): each rises 40px while its photo unmasks from the bottom, then its name slides
	// up out of its mask as the photo opens (revealBatch, lib/motion.js). The triggers are set up straight
	// away (under the curtain, not in the frame it lifts); a batch plays once the entrances are released.
	useGSAP(
		() => {
			if (!document.documentElement.classList.contains("js-anim")) return;
			const stops = [];
			// Cards already revealed stay as they are when the page comes back (lib/motion.js → hasPlayed).
			const cards = gsap.utils.toArray("[data-card]", scope.current).filter((card) => !hasPlayed(card));
			if (!entrance) {
				// Shown before the first paint (a layout effect), out of the start state CSS holds them in.
				cards.forEach((card) => {
					markPlayed(card);
					card.style.opacity = "1";
					card.style.visibility = "visible";
				});
				return;
			}
			const triggers = ScrollTrigger.batch(cards, {
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

	const layout = places(works.length);

	return (
		<section ref={scope}>
			<ViewCursor state={cursor} />
			<div className="grid grid-cols-2 items-start gap-x-g gap-y-4 px-m pt-2 pb-6 desk:grid-cols-10 desk:pb-4">
				{works.map((work, i) => {
					const { span, cls } = layout[i];
					return (
						<div key={work.href} data-card data-i={i} data-lcp={(lead && i === 0) || undefined} className={`relative flex min-w-0 flex-col ${COMPACT(i)} ${cls}`}>
							{/* Clips the name so it can rise into view after its photo (revealBatch); the padding keeps
							    descenders inside the clip and the margin makes up for it, so the spacing is unchanged. */}
							<p data-sanity={work.edit?.name} className="mb-[3px] overflow-hidden pb-[3px] text-name">
								<span data-card-name className="flex min-w-0 items-center gap-icon">
									<CornerIcon className="size-[0.85em] shrink-0" />
									<span className="truncate" title={work.name}>
										{work.name}
									</span>
									<span aria-hidden="true" className="ml-auto pl-g text-body text-muted tabular-nums">
										{pad(i + 1)}
									</span>
								</span>
							</p>
							<Link
								href={work.href}
								aria-label={work.name}
								// Full prefetch: the project's own content too, not just the shared page shell
								// (partialPrefetching), so it's ready when the photo has grown.
								prefetch
								onMouseEnter={(e) => {
									cursor.set(true);
									warmCard(e, i);
								}}
								onMouseLeave={() => cursor.set(false)}
								onPointerDown={(e) => warmCard(e, i)}
								onClick={(e) => {
									cursor.set(false); // the pill scales away as the photo opens
									open(e, work.href);
								}}
								data-card-media
								// Studio preview: the photo opens the project's entry (photo, name, page). Not dragged:
								// the grid shows the list newest first, so a drop would land the other way round.
								data-sanity={work.edit?.item}
								data-sanity-drag-disable={work.edit ? "true" : undefined}
								// Press feedback: the card gives a little (0.98) the moment it's pressed, before the photo grows.
								// bg: a faint tone while the photo loads, so it never pops onto white.
								className={`relative block aspect-[4/3] overflow-hidden rounded-ui bg-wash transition-[scale] duration-100 ease-out active:scale-[0.98] desk-mouse:cursor-none ${SHAPE[span]}`}
							>
								<Img
									image={work.image}
									fill
									sizes={SIZES(i, span)}
									{...(lead && i === 0 && { loading: "eager", fetchPriority: "high" })}
									fallbackAlt=""
									className="object-cover"
								/>
							</Link>
							{/* The project hero's photo, loaded invisibly once the card is hovered (or, on touch, while it
							    is on screen): same image, same sizes as ProjectHero, so the browser fetches exactly the
							    file the hero will show. */}
							{work.hero && (preload.has(i) || near.includes(i)) && (
								<span data-hero-preload aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
									<Img image={work.hero} fill sizes="100vw" loading="eager" fallbackAlt="" className="object-cover" />
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
 * "View project" pill centred on the pointer over the photos: 7 × 14px padding, 4px radius, body text
 * with an 11px arrow; grows in from 0.9 as it fades in (and back out) in 0.28s, only fading under reduced
 * motion. Rendered into <body> so
 * no transformed ancestor can trap its position: fixed. Shown while `state` (valueStore) is true.
 */
function ViewCursor({ state }) {
	const ref = useRef(null);
	const client = useIsClient();
	const active = useSyncExternalStore(state.subscribe, state.get, () => false);

	useEffect(() => {
		const move = (e) => {
			if (ref.current) ref.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
		};
		document.addEventListener("pointermove", move);
		return () => document.removeEventListener("pointermove", move);
	}, []);

	if (!client) return null;
	return createPortal(
		<div ref={ref} aria-hidden="true" data-view-cursor className="pointer-events-none fixed top-0 left-0 z-(--z-cursor) hidden will-change-transform desk-mouse:block">
			<div
				className={`flex -translate-1/2 items-center gap-[8px] rounded-ui bg-black px-[10px] py-[6px] whitespace-nowrap text-white transition-[scale,opacity] duration-280 ease-out-quint motion-reduce:scale-100 ${active ? "scale-100 opacity-100" : "scale-[0.9] opacity-0"}`}
			>
				View project
				<ArrowIcon className="size-[11px]" />
			</div>
		</div>,
		document.body,
	);
}
