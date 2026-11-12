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
 * @param {{ works: { href: string, name: string, description: string, image: import("@prismicio/client").ImageField }[] }} props
 */
export default function WorksGrid({ works }) {
	const [cursorOn, setCursorOn] = useState(false);
	const rows = [];
	for (let i = 0; i < works.length; i += PER_ROW) rows.push(works.slice(i, i + PER_ROW));

	return (
		<section>
			<ViewCursor active={cursorOn} />
			<div className={`hidden text-[1vw] [@media(min-width:681px)_and_(hover:hover)]:block`}>
				{rows.map((row, i) => (
					<Row key={row[0].href + i} works={row} reverse={i % 2 === 1} setCursorOn={setCursorOn} />
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
						<div className={`mt-[0.35em] flex items-start justify-between [@media(min-width:681px)_and_(hover:none)]:mt-[0.75em] [@media(min-width:681px)_and_(hover:none)]:flex-col [@media(min-width:681px)_and_(hover:none)]:gap-[0.4em]`}>
							<p className={`w-1/4 [@media(min-width:681px)_and_(hover:none)]:w-full`}>{work.name}</p>
							<p className={`w-3/4 pr-[1.25%] [@media(min-width:681px)_and_(hover:none)]:w-full [@media(min-width:681px)_and_(hover:none)]:pr-0`}>{work.description}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

function Row({ works, reverse, setCursorOn }) {
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
						<div className={`absolute bottom-[-17%] h-[4em] overflow-hidden transition-all duration-400 ease-quart`}>
							<div
								className={`relative flex items-start justify-between transition-all duration-400 ease-quart ${on ? "translate-y-0 delay-200" : "-translate-y-full"}`}
							>
								<p className="w-1/4">{work.name}</p>
								<p className="w-3/4 pr-[1.25%]">{work.description}</p>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/** White "View →" tag that follows the mouse; wipes to black with lime text when over a photo. */
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
			className={`pointer-events-none fixed z-[200] hidden bg-white text-[1vw] text-black transition-[scale] ${q} [@media(min-width:681px)_and_(hover:hover)]:block ${active ? "scale-100" : "scale-0"}`}
		>
			<div className="relative p-[0.4em]">
				<div className={`relative z-10 flex items-center text-[0.875em] transition-colors delay-150 ${q} ${active ? "text-lime" : "text-black"}`}>
					<span className="relative">
						View
						<span className={`absolute bottom-0 left-0 h-px bg-current transition-all ${q} ${active ? "w-full" : "w-0"}`} />
					</span>
					<span className="overflow-hidden">
						<span className={`block transition-transform ${q} ${active ? "translate-x-0" : "-translate-x-full"}`}>-&gt;</span>
					</span>
				</div>
				<div className={`absolute top-0 left-0 h-full bg-black transition-all ${q} ${active ? "w-full delay-150" : "w-0"}`} />
			</div>
		</div>
	);
}
