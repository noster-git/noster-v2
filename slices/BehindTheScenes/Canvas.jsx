"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { EASE, hasPlayed, markPlayed } from "@/lib/motion";
import { ready } from "@/lib/intro";

gsap.registerPlugin(useGSAP, Draggable, ScrollTrigger);

// Board size and photo sizes in em: 12 hand-placed slots.
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
 * The draggable board. The CSS transform transition (0.9s ease-out-quint) makes the board trail the
 * pointer and glide to a stop, never past the edges. Arrow-key steps take a quicker 300ms glide instead,
 * so each press answers at once; the next press on the board brings the drag glide back. Photos grow
 * to 1.1 the moment the board is pressed and settle back on release (not under reduced motion).
 */
// Arrow keys move the board this far (em), the keyboard alternative to dragging.
const KEY_STEP = 24;
const KEYS = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
const KEY_GLIDE = "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)";

export default function Canvas({ children }) {
	const board = useRef(null);
	const drag = useRef(null);
	// The spots are drawn once: coming back to the page shows the board as it was left.
	const spots = useRef(null);

	// Arrows look around the board (the board moves the opposite way), held inside the same bounds as a drag.
	const onKeyDown = (e) => {
		const dir = KEYS[e.key];
		const d = drag.current;
		if (!dir || !d) return;
		e.preventDefault();
		if (!matchMedia("(prefers-reduced-motion: reduce)").matches) board.current.style.transition = KEY_GLIDE;
		const step = KEY_STEP * parseFloat(getComputedStyle(board.current).fontSize);
		gsap.set(board.current, { x: d.x + dir[0] * step, y: d.y + dir[1] * step });
		d.update(true);
	};

	useGSAP(
		() => {
			// The board only shows above 1180px (index.jsx): it is laid out, measured and made draggable only
			// while it is on show, and all of it is undone when the screen narrows past that.
			const mm = gsap.matchMedia();
			mm.add({ shown: "(min-width: 1181px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
				if (!conditions.shown) return;
				const el = board.current;
				const photos = gsap.utils.toArray("[data-photo]", el);
				// Title box in board ems (the title is centred on the board).
				const em = parseFloat(getComputedStyle(el).fontSize);
				const title = el.querySelector("[data-title]");
				const tw = title.offsetWidth / em;
				const th = title.offsetHeight / em;
				const reserved = { x: (BOARD.w - tw) / 2, y: (BOARD.h - th) / 2, w: tw, h: th };
				spots.current ??= layout(photos.length, reserved);
				spots.current.forEach((s, i) => {
					gsap.set(photos[i], { left: `${s.x}em`, top: `${s.y}em`, width: `${s.w}em`, height: `${s.h}em` });
				});

				// Photos come in once the board is half up the screen and the entrances are released: each grows
				// from 0.6 as it fades in (0.7s expo.out, 0.06s apart). Once only: coming back shows them as left.
				let live = true;
				if (!conditions.motion || hasPlayed(el)) gsap.set(photos, { autoAlpha: 1 });
				else {
					ScrollTrigger.create({
						trigger: el.parentElement,
						start: "top center",
						once: true,
						onEnter: () =>
							ready().then(() => {
								if (!live) return;
								markPlayed(el);
								gsap.fromTo(photos, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: EASE, stagger: 0.06 });
							}),
					});
				}

				// With motion, photos grow to 1.1 while the board is held.
				const grow = (scale) => gsap.to(photos, { scale, duration: 0.2, ease: "power1.out", overwrite: "auto" });
				[drag.current] = Draggable.create(el, {
					type: "x,y",
					bounds: el.parentElement,
					...(conditions.motion && { onPress: () => grow(1.1), onRelease: () => grow(1) }),
				});
				return () => {
					live = false;
					drag.current = null;
				};
			});
		},
		{ scope: board },
	);

	return (
		<div
			ref={board}
			tabIndex={0}
			role="group"
			aria-label="Behind the scenes photos. Drag, or use the arrow keys, to look around."
			onKeyDown={onKeyDown}
			// Back to the drag glide (the class below) for a drag.
			onPointerDown={() => board.current.style.removeProperty("transition")}
			// Focus shows on the framed box around the board (index.jsx); the board itself is mostly off-screen.
			className="absolute top-[calc(50%-100em)] left-[calc(50%-160em)] h-[200em] w-[320em] cursor-grab touch-none transition-transform duration-900 ease-out-quint select-none outline-none active:cursor-grabbing motion-reduce:transition-none"
		>
			{children}
		</div>
	);
}
