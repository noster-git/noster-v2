"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger);

// Board size and photo sizes in em, from the live site's 12 hand-placed slots.
const BOARD = { w: 320, h: 200 };
const SIZES = [
	[20, 25], [20, 30], [30, 30], [25, 30], [20, 30], [25, 20],
	[23.2, 22.5], [20, 20], [23.2, 15], [20, 25], [25, 30], [35, 30],
];
const GAP = 4; // minimum em between photos
const TRIES = 200;

/**
 * Random, non-overlapping spots. Each coordinate is the mean of two random numbers, so photos
 * cluster toward the middle of the board — the part visible before anyone drags. `reserved` is
 * the title's box, which photos keep clear of.
 */
function layout(count, reserved) {
	const placed = [reserved];
	const pick = (span) => ((Math.random() + Math.random()) / 2) * span;
	for (let i = 0; i < count; i++) {
		const [w, h] = SIZES[i % SIZES.length];
		let spot;
		for (let t = 0; t < TRIES; t++) {
			spot = { x: pick(BOARD.w - w), y: pick(BOARD.h - h), w, h };
			const clash = placed.some(
				(p) => spot.x < p.x + p.w + GAP && p.x < spot.x + w + GAP && spot.y < p.y + p.h + GAP && p.y < spot.y + h + GAP,
			);
			if (!clash) break;
		}
		placed.push(spot);
	}
	return placed.slice(1);
}

/**
 * The draggable board. Live feel: the CSS transform transition (1.2s overshoot) makes the board
 * trail the pointer with a spring. Photos grow to 1.1 the moment the board is pressed — the live
 * site only did this once the pointer moved — and settle back on release.
 */
export default function Canvas({ children }) {
	const board = useRef(null);

	useGSAP(
		() => {
			const photos = gsap.utils.toArray("[data-photo]", board.current);
			// Title box in board ems (the title is centred on the board).
			const em = parseFloat(getComputedStyle(board.current).fontSize);
			const title = board.current.querySelector("[data-title]");
			const tw = title.offsetWidth / em;
			const th = title.offsetHeight / em;
			const reserved = { x: (BOARD.w - tw) / 2, y: (BOARD.h - th) / 2, w: tw, h: th };
			layout(photos.length, reserved).forEach((s, i) => {
				gsap.set(photos[i], { left: `${s.x}em`, top: `${s.y}em`, width: `${s.w}em`, height: `${s.h}em`, autoAlpha: 1 });
			});

			const mm = gsap.matchMedia();
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				gsap.to(photos, {
					scale: 1,
					duration: 0.3,
					ease: "expo.inOut",
					stagger: 0.2,
					scrollTrigger: { trigger: board.current.parentElement, start: "top center", once: true },
				});
			});
			mm.add("(prefers-reduced-motion: reduce)", () => gsap.set(photos, { scale: 1 }));

			const grow = (scale) => gsap.to(photos, { scale, duration: 0.2, ease: "power1.out", overwrite: "auto" });
			Draggable.create(board.current, {
				type: "x,y",
				bounds: board.current.parentElement,
				onPress: () => grow(1.1),
				onRelease: () => grow(1),
			});
		},
		{ scope: board },
	);

	return (
		<div
			ref={board}
			className="absolute top-[calc(50%-100em)] left-[calc(50%-160em)] h-[200em] w-[320em] cursor-pointer touch-none transition-transform duration-[1.2s] ease-[cubic-bezier(0.34,1.56,0.64,1)]"
		>
			{children}
		</div>
	);
}
