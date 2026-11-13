"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";

const PER_ROW = 3;
// Variants: [@media(min-width:681px)_and_(hover:hover)] = mouse, tablet+; ..._(hover:none) = touch tablets. Written out in full so Tailwind can see them.

/**
 * Project cards, as on the live site:
 * - mouse, tablet+: rows of three alternating left/right; the hovered card widens (27% → 45%) and shows its text;
 *   a "View →" cursor follows the mouse over the photos;
 * - touch tablets: 3-column grid, all text visible;
 * - phones: stacked list.
 *
 * Project names are headings (1.6× the description, medium weight). The name takes its own width (up to
 * 45%, wrapping beyond that) with a fixed 1em gap, and the description fills the rest, so long names never touch it. Name and
 * description are top-aligned; the description's 0.1em top padding lines up the tops of the letters.: h3 under a section heading (Home), h2 on Our Works.
 *
 * @param {{ works: { href: string, name: string, description: string, image: import("@prismicio/client").ImageField }[], headingLevel?: 2 | 3 }} props
 */
export default function WorksGrid({ works, headingLevel = 3 }) {
	const Name = `h${headingLevel}`;
	const [cursorOn, setCursorOn] = useState(false);
	const rows = [];
	for (let i = 0; i < works.length; i += PER_ROW) rows.push(works.slice(i, i + PER_ROW));

	return (
		<section>
			<ViewCursor active={cursorOn} />
			<div className={`hidden text-[1vw] [@media(min-width:681px)_and_(hover:hover)]:block`}>
				{rows.map((row, i) => (
					<Row key={row[0].href + i} works={row} reverse={i % 2 === 1} setCursorOn={setCursorOn} Name={Name} />
				))}
			</div>

			<div
				className={`flex flex-col items-center text-[3vw] [@media(min-width:681px)_and_(hover:hover)]:hidden [@media(min-width:681px)_and_(hover:none)]:grid [@media(min-width:681px)_and_(hover:none)]:grid-cols-3 [@media(min-width:681px)_and_(hover:none)]:items-start [@media(min-width:681px)_and_(hover:none)]:gap-x-[1vw] [@media(min-width:681px)_and_(hover:none)]:gap-y-[3em] [@media(min-width:681px)_and_(hover:none)]:px-[2vw] [@media(min-width:681px)_and_(hover:none)]:pt-[4em] [@media(min-width:681px)_and_(hover:none)]:pb-[6em] [@media(min-width:681px)_and_(hover:none)]:text-[1vw]`}
			>
				{works.map((work, i) => (
					<div key={work.href + i} className={`my-[2em] w-[95%] [@media(min-width:681px)_and_(hover:none)]:m-0 [@media(min-width:681px)_and_(hover:none)]:w-auto`}>
						<Link href={work.href} aria-label={work.name} className="relative block aspect-[3/2]">
							<PrismicNextImage field={work.image} fill sizes="(min-width: 681px) 33vw, 95vw" imgixParams={{ ar: "3:2", fit: "crop" }} fallbackAlt="" className="object-cover" />
						</Link>
						<div className={`mt-[0.35em] flex items-start gap-[1em] [@media(min-width:681px)_and_(hover:none)]:mt-[0.75em] [@media(min-width:681px)_and_(hover:none)]:flex-col [@media(min-width:681px)_and_(hover:none)]:gap-[0.4em]`}>
							<Name className={`max-w-[45%] flex-none break-words text-[1.6em] leading-[1.15] font-medium [@media(min-width:681px)_and_(hover:none)]:max-w-none`}>{work.name}</Name>
							<p className={`min-w-0 flex-1 pt-[0.1em] pr-[1.25%] [@media(min-width:681px)_and_(hover:none)]:pt-0 [@media(min-width:681px)_and_(hover:none)]:pr-0`}>{work.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function Row({ works, reverse, setCursorOn, Name }) {
	const [active, setActive] = useState(0);

	return (
		<div className={`mt-[8em] mb-[6em] flex h-[28em] items-start gap-[0.4em] px-[2vw] ${reverse ? "flex-row-reverse" : ""}`}>
			{works.map((work, i) => {
				const on = active === i;
				return (
					<div
						key={work.href + i}
						onMouseOver={() => setActive(i)}
						className={`relative transition-all delay-50 duration-400 ease-quart ${on ? "h-[28em] w-[45%]" : "h-[16.25em] w-[27%]"}`}
					>
						<Link
							href={work.href}
							aria-label={work.name}
							onMouseEnter={() => setCursorOn(true)}
							onMouseLeave={() => setCursorOn(false)}
							className="relative block size-full cursor-none"
						>
							<PrismicNextImage field={work.image} fill sizes="45vw" imgixParams={{ ar: "3:2", fit: "crop" }} fallbackAlt="" className="object-cover" />
						</Link>
						<div className={`absolute inset-x-0 top-full mt-[0.76em] overflow-hidden transition-all duration-400 ease-quart`}>
							<div
								className={`relative flex items-start gap-[1em] transition-all duration-400 ease-quart ${on ? "translate-y-0 delay-200" : "-translate-y-full"}`}
							>
								<Name className="max-w-[45%] flex-none break-words text-[1.6em] leading-[1.15] font-medium">{work.name}</Name>
								<p className="min-w-0 flex-1 pt-[0.1em] pr-[1.25%]">{work.description}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/**
 * "View →" tag that follows the mouse over the photos — timings copied from the old .cursor-A CSS
 * (each step 0.2s, ease cubic-bezier(0.85,0,0.15,1)):
 *   enter: white box scales in → 150ms: black fills left→right + text turns lime → 300ms: underline → 350ms: arrow
 *   leave: arrow out → 150ms: text black + underline out → 300ms: black fill out → 600ms: box scales away
 */
function ViewCursor({ active }) {
	const ref = useRef(null);

	useEffect(() => {
		const move = (e) => {
			if (!ref.current) return;
			ref.current.style.left = `${e.clientX}px`;
			ref.current.style.top = `${e.clientY}px`;
		};
		document.addEventListener("mousemove", move);
		return () => document.removeEventListener("mousemove", move);
	}, []);

	const q = "duration-200 ease-[cubic-bezier(0.85,0,0.15,1)]";
	return (
		<div
			ref={ref}
			aria-hidden="true"
			className={`pointer-events-none fixed z-[200] hidden bg-white text-[1vw] transition-[scale] ${q} [@media(min-width:681px)_and_(hover:hover)]:block ${active ? "scale-100" : "scale-0 delay-600"}`}
		>
			<div className="relative p-[0.4em]">
				<div className={`absolute top-0 left-0 h-full bg-black transition-all ${q} ${active ? "w-full delay-150" : "w-0 delay-300"}`} />
				<div className={`relative flex items-center text-[0.875em] transition-colors delay-150 ${q} ${active ? "text-lime" : "text-black"}`}>
					View
					<span className="overflow-hidden">
						<span className={`block text-lime transition-transform ${q} ${active ? "translate-x-0 delay-350" : "-translate-x-full"}`}>-&gt;</span>
					</span>
					<span className={`absolute bottom-0 left-0 h-px bg-lime transition-all ${q} ${active ? "w-full delay-300" : "w-0 delay-150"}`} />
				</div>
			</div>
		</div>
	);
}
