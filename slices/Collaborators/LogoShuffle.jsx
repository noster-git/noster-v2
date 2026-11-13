"use client";

import { useEffect, useRef, useState } from "react";
import { PrismicNextImage } from "@prismicio/next";

const DESK = "(min-width: 901px) and (orientation: landscape), (min-width: 1101px)";
const SLOTS = { compact: 3, desk: 6 };
const EVERY = 1600; // ms between swaps; one slot changes at a time

/**
 * A fixed row of logo slots. Nothing slides: every EVERY ms one slot blurs its logo out and the next
 * unseen logo blurs in on the same spot, cycling through the whole list. Logos sit greyscale and take
 * their colour back on hover (a hovered slot also stops swapping). Pauses off-screen; no swapping
 * under reduced motion.
 */
export default function LogoShuffle({ logos }) {
	const root = useRef(null);
	const [count, setCount] = useState(SLOTS.compact);
	// each slot: the logo showing, the one leaving, and a key that remounts both so the keyframes replay
	const [slots, setSlots] = useState(() => initial(SLOTS.compact, logos.length));
	const hovered = useRef(-1);
	const next = useRef(SLOTS.compact % Math.max(logos.length, 1));
	const last = useRef(-1);

	useEffect(() => {
		const mq = window.matchMedia(DESK);
		const set = () => {
			const n = Math.min(mq.matches ? SLOTS.desk : SLOTS.compact, logos.length);
			setCount(n);
			setSlots(initial(n, logos.length));
			next.current = n % logos.length;
		};
		set();
		mq.addEventListener("change", set);
		return () => mq.removeEventListener("change", set);
	}, [logos.length]);

	useEffect(() => {
		if (logos.length <= count || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		let visible = false;
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(root.current);

		const id = setInterval(() => {
			if (!visible || document.hidden) return;
			// a random slot, never the one just changed or the one under the cursor
			const pool = [...Array(count).keys()].filter((i) => i !== last.current && i !== hovered.current);
			if (!pool.length) return;
			const slot = pool[Math.floor(Math.random() * pool.length)];
			last.current = slot;
			setSlots((prev) => {
				const showing = new Set(prev.map((s) => s.cur));
				let pick = next.current;
				while (showing.has(pick)) pick = (pick + 1) % logos.length;
				next.current = (pick + 1) % logos.length;
				return prev.map((s, i) => (i === slot ? { cur: pick, prev: s.cur, n: s.n + 1 } : s));
			});
		}, EVERY);

		return () => {
			clearInterval(id);
			io.disconnect();
		};
	}, [count, logos.length]);

	return (
		<ul ref={root} className="flex justify-center px-g">
			{slots.map((s, i) => (
				<li
					key={i}
					onMouseEnter={() => (hovered.current = i)}
					onMouseLeave={() => (hovered.current = -1)}
					className="logo-slot grid h-[40px] w-1/3 place-items-center px-3 desk:h-[56px] desk:w-[180px]"
				>
					{s.prev !== null && <Logo key={`o${s.n}`} item={logos[s.prev]} className="logo-out" hidden />}
					<Logo key={`i${s.n}`} item={logos[s.cur]} className={s.n ? "logo-in" : ""} />
				</li>
			))}
		</ul>
	);
}

function initial(n, total) {
	return Array.from({ length: Math.min(n, total) }, (_, i) => ({ cur: i, prev: null, n: 0 }));
}

function Logo({ item, className, hidden }) {
	return (
		<PrismicNextImage
			field={item.logo}
			fallbackAlt=""
			aria-hidden={hidden || undefined}
			// multiply: white logo backgrounds disappear into the page. Greyscale until hover (globals.css .logo-slot).
			className={`logo [grid-area:1/1] w-auto max-w-full object-contain mix-blend-multiply ${item.large ? "h-[30px] desk:h-[40px]" : "h-[22px] desk:h-[30px]"} ${className}`}
		/>
	);
}
