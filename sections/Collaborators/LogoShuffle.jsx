"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Img from "@/components/Img";

const SLOTS = 4; // logos on show at once, at every width
const EVERY = 3000; // ms between waves
const STAGGER = 0.15; // s between neighbouring slots within a wave
const SWAP_MS = 500; // one slot's swap (.logo-in / .logo-out, globals.css)

// Logos are kept small and even whatever their upload: each is sized towards the same area within a narrow
// height band and a width cap (globals.css .logo-slot .logo). "Large" (CMS) is a manual nudge on top, for a
// mark that still looks small. SIZES fetches files about the width shown (uploads are often 1000px+ wide
// for a 130px slot).
const SIZES = "130px";
const LARGE = 1.25;

/**
 * Logo carousel: a row of four slots (up to 240px each, narrower on phones),
 * each with its own column of logos (logo i goes to slot i % slots). Every EVERY ms a wave runs left to
 * right: in each slot the logo lifts 20px and fades out while the next rises 20px from below and fades in,
 * both at once, clipped to the slot. Logos sit greyscale and take their colour back on hover. Holds while the
 * row is hovered, off-screen, or paused with its toggle; no swapping under reduced motion. Screen readers read
 * a plain list of the logos' alt texts instead. Keyframes in globals.css (.logo-slot).
 */
export default function LogoShuffle({ logos }) {
	const root = useRef(null);
	const count = Math.min(SLOTS, logos.length);
	// each slot: position in its column, the logo leaving, and a key that remounts both so the keyframes replay
	const [slots, setSlots] = useState(() => initial(count, logos.length));
	// The swaps run for as long as the row is on screen, so they can be stopped: hovering the row holds
	// every slot, and a toggle (shown when tabbed to) pauses them outright.
	const held = useRef(false);
	const [paused, setPaused] = useState(false);
	const reduced = useSyncExternalStore(onReducedChange, isReduced, () => false);
	const rotates = logos.length > count && !reduced;
	// The logos still to come are fetched once the row is within half a screen of view, not with the page.
	const [near, setNear] = useState(false);

	useEffect(() => {
		if (!rotates || near) return;
		const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "50% 0px" });
		io.observe(root.current);
		return () => io.disconnect();
	}, [rotates, near]);

	useEffect(() => {
		if (!rotates || paused) return;
		let visible = false;
		const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
		io.observe(root.current);

		// Once a wave is over, its slots settle: the leaving logo goes and the new one drops its keyframes.
		// CSS animations restart when a hidden page is shown again (pages stay in the DOM, hidden, after
		// leaving them), so a logo still carrying them would swap in again on coming back.
		const settle = () => setSlots((prev) => (prev.some((s) => s.moving) ? prev.map((s) => ({ ...s, prev: null, moving: false })) : prev));
		let settling;
		const id = setInterval(() => {
			if (!visible || document.hidden || held.current) return;
			setSlots((prev) =>
				prev.map((s, i) => {
					const column = columnOf(i, count, logos.length);
					if (column.length < 2) return s;
					const step = (s.step + 1) % column.length;
					return { step, cur: column[step], prev: s.cur, n: s.n + 1, moving: true };
				}),
			);
			clearTimeout(settling);
			settling = setTimeout(settle, SWAP_MS + count * STAGGER * 1000);
		}, EVERY);

		return () => {
			clearInterval(id);
			clearTimeout(settling);
			io.disconnect();
			settle();
		};
	}, [count, logos.length, rotates, paused]);

	// Screen readers get every collaborator once, as a plain list; the animated row is visual only.
	const names = logos.map((item) => item.logo.alt).filter(Boolean);

	return (
		<div className="relative">
		{names.length > 0 && (
			<ul className="sr-only">
				{names.map((name, i) => (
					<li key={i}>{name}</li>
				))}
			</ul>
		)}
		<ul
			ref={root}
			aria-hidden="true"
			onMouseEnter={() => (held.current = true)}
			onMouseLeave={() => (held.current = false)}
			className="flex justify-between gap-2 desk:gap-4"
		>
			{slots.map((s, i) => (
				<li
					key={i}
					style={{ "--delay": `${(i * STAGGER).toFixed(2)}s` }}
					// clipped so the 20px rise/lift fades at the slot edge; the slot's height is the row's, logos centred in it
					className="logo-slot grid h-[64px] min-w-0 flex-[0_1_240px] place-items-center overflow-hidden desk:h-[88px]"
				>
					{s.prev !== null && <Logo key={`o${s.n}`} item={logos[s.prev]} className="logo-out" hidden />}
					<Logo key={`i${s.n}`} item={logos[s.cur]} className={s.moving ? "logo-in" : ""} />
				</li>
			))}
			{/* fetch every logo ahead of its turn so an incoming one is decoded before it rises in */}
			{near && (
				<li hidden aria-hidden className="relative">
					{logos.map((item) => (
						<Img key={item._key} image={item.logo} fill fallbackAlt="" loading="eager" sizes={SIZES} />
					))}
				</li>
			)}
		</ul>
		{rotates && (
			<button
				type="button"
				onClick={() => setPaused(!paused)}
				className="sr-only cursor-pointer underline underline-offset-2 focus-visible:not-sr-only focus-visible:absolute focus-visible:top-full focus-visible:left-1/2 focus-visible:mt-2 focus-visible:-translate-x-1/2"
			>
				{paused ? "Play logos" : "Pause logos"}
			</button>
		)}
		</div>
	);
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const isReduced = () => window.matchMedia(REDUCED).matches;
function onReducedChange(callback) {
	const mq = window.matchMedia(REDUCED);
	mq.addEventListener("change", callback);
	return () => mq.removeEventListener("change", callback);
}

/** Logo indexes for slot i: i, i + slots, i + 2·slots… */
function columnOf(i, slots, total) {
	const out = [];
	for (let j = i; j < total; j += slots) out.push(j);
	return out;
}

function initial(n, total) {
	return Array.from({ length: Math.min(n, total) }, (_, i) => ({ step: 0, cur: i, prev: null, n: 0 }));
}

function Logo({ item, className, hidden }) {
	const { width, height } = item.logo;
	const ratio = width && height ? width / height : 1;
	return (
		<Img
			image={item.logo}
			sizes={SIZES}
			fallbackAlt=""
			aria-hidden={hidden || undefined}
			// Studio preview: opens the logo's entry. Not dragged: the slots show the logos in turns, not in order.
			data-sanity={item.edit}
			data-sanity-drag-disable={item.edit ? "true" : undefined}
			// Sized towards the same area: --logo-k = 1 / √(width / height) (globals.css .logo-slot .logo).
			style={{ "--logo-k": (item.large ? LARGE : 1) / Math.sqrt(ratio) }}
			// multiply: white logo backgrounds disappear into the page. Greyscale until hover (globals.css .logo-slot).
			className={`logo [grid-area:1/1] w-auto object-contain mix-blend-multiply ${className}`}
		/>
	);
}
