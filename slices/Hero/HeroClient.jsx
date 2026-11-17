"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { CSS_EXPO_OUT, EASE, hasPlayed, lineRise, markPlayed, splitLines } from "@/lib/motion";
import { ready } from "@/lib/intro";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import Parallax from "@/components/Parallax";

gsap.registerPlugin(useGSAP);

const REDUCED_MOTION = typeof window === "undefined" ? null : matchMedia("(prefers-reduced-motion: reduce)");
const subscribeReducedMotion = (onChange) => {
	REDUCED_MOTION.addEventListener("change", onChange);
	return () => REDUCED_MOTION.removeEventListener("change", onChange);
};

/**
 * Interactive part of the Hero: entrance animation, poster → video fade-in, and the showreel dialog.
 * Fills the first screen; the title sits at the bottom on the page grid (6 of 10 columns on desk). The
 * picture drifts and darkens as the hero scrolls away (components/Parallax).
 */
export default function HeroClient({ sliceType, variation, title, backdrop, videoSrc, loopSources }) {
	const scope = useRef(null);
	const videoRef = useRef(null);
	const dialogRef = useRef(null);
	const showreelRef = useRef(null);
	const lenis = useLenis();
	// The background video starts from here, not the autoplay attribute, so a reduced-motion preference
	// keeps it on its first frame. Pause / Play (below) overrides that either way once it is used.
	const reducedMotion = useSyncExternalStore(subscribeReducedMotion, () => REDUCED_MOTION.matches, () => false);
	const [choice, setChoice] = useState(null);
	const playing = choice ?? !reducedMotion;

	// The loop's sources may all be for some screen sizes only (a video picked in Prismic is desk only, so
	// phones show the poster): Pause / Play is only offered where a loop plays.
	const loopQuery = loopSources?.every((s) => s.media) ? loopSources.map((s) => s.media).join(", ") : null;
	const subscribeLoop = useCallback(
		(onChange) => {
			if (!loopQuery) return () => {};
			const mq = matchMedia(loopQuery);
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		},
		[loopQuery],
	);
	const hasLoop = useSyncExternalStore(subscribeLoop, () => !loopQuery || matchMedia(loopQuery).matches, () => true);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		if (playing) video.play().catch(() => {});
		else video.pause();
		// Home stays in the DOM, hidden, after leaving it (cacheComponents): stop decoding while it is away.
		return () => video.pause();
	}, [playing]);

	// Entrance, after the page-load intro (components/Intro.jsx). The start states are already held by CSS
	// from the first frame (.js-anim, globals.css), so nothing flashes:
	//   the photo settles from 1.12× (first visit, as the curtain lifts), the title rises line by line out of
	//   its own masks, then "Play showreel" rises in.
	// The title is split and the timeline built as soon as the fonts are in (under the curtain); the gate
	// (ready) only presses play, so the frame the curtain starts lifting has no layout work in it. The
	// photo's settle runs on the compositor (WAAPI): it is full-screen and plays while the page is busiest.
	useGSAP(
		() => {
			// The video may already be playable by the time this runs.
			if (videoRef.current && videoRef.current.readyState >= 3) revealVideo();

			const root = document.documentElement;
			const el = scope.current;
			// Once only: coming back home shows the hero as it was left.
			if (hasPlayed(el) || !root.classList.contains("js-anim")) return;
			const firstVisit = !root.classList.contains("intro-skip");
			let tl;
			let split;
			let settle;
			let live = true;
			document.fonts.ready.then(() => {
				if (!live || !el.isConnected) return;
				tl = gsap.timeline({ paused: true });
				const title = el.querySelector("[data-hero-title]");
				const heading = title?.querySelector("h1");
				if (heading) {
					gsap.set(title, { autoAlpha: 1 });
					split = splitLines(heading);
					tl.to(split.lines, { ...lineRise.to, onComplete: split.restore }, firstVisit ? 0.3 : 0.1);
				} else if (title) tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE }, 0.3);
				const cta = el.querySelector("[data-hero-cta]");
				if (cta) tl.fromTo(cta, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE }, "-=0.85");
				tl.progress(0).pause(); // render the start states now, under the curtain
				return ready();
			}).then(() => {
				if (!live || !tl) return;
				requestAnimationFrame(() => {
					if (!live) return;
					const media = el.querySelector("[data-hero-media]");
					if (firstVisit && media) {
						settle = media.animate([{ transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 2400, easing: CSS_EXPO_OUT, fill: "forwards" });
						settle.finished.then(() => {
							settle.commitStyles(); // stays at 1× once the CSS start state is gone (intro-skip)
							settle.cancel();
						}, () => {});
					}
					markPlayed(el);
					tl.play();
				});
			});
			return () => {
				live = false;
				// Leaving mid-entrance: finish it, so coming back shows the hero as it ends.
				if (hasPlayed(el)) tl?.progress(1);
				tl?.kill();
				settle?.cancel();
				split?.restore();
			};
		},
		{ scope },
	);

	function revealVideo() {
		gsap.to(videoRef.current, { autoAlpha: 1, duration: 0.8, ease: "power2.out", overwrite: true });
	}

	function openShowreel() {
		videoRef.current?.pause();
		lenis?.stop();
		dialogRef.current.showModal();
		showreelRef.current.currentTime = 0;
		showreelRef.current.play();
	}

	function handleClose() {
		showreelRef.current.pause();
		if (playing) videoRef.current?.play().catch(() => {});
		lenis?.start();
	}

	// "Play showreel" and Pause / Play sit on a dark photo: keyboard focus thickens the underline instead of
	// drawing a box, hit areas reach 44px on touch, and a press dims them at once (touch has no hover).
	const control =
		"hit cursor-pointer text-white underline underline-offset-2 transition-opacity duration-200 hover:opacity-50 focus-visible:outline-none focus-visible:decoration-2 active:opacity-50 active:duration-100";

	return (
		<section
			ref={scope}
			data-slice-type={sliceType}
			data-slice-variation={variation}
			// Full screen at every width: the video is the first impression (project heroes are half the screen on
			// phones). Compact: the title stops clear of the fixed CTA button at the foot of the screen (MobileCta).
			className="relative flex h-svh min-h-[320px] items-end overflow-hidden bg-black px-m pb-[calc(84px+env(safe-area-inset-bottom))] desk:pb-m"
		>
			{/* Drifts down and darkens as the hero scrolls away (Parallax), so the page comes up over it. */}
			<Parallax className="absolute inset-x-0 top-0 h-[110%]" shade={0.5}>
				<div data-hero-media className="absolute inset-0">
					{backdrop}
					{videoSrc && (
						<video
							ref={videoRef}
							muted
							loop
							playsInline
							preload="auto"
							onCanPlay={revealVideo}
							className="invisible absolute inset-0 size-full object-cover opacity-0"
						>
							{loopSources.map(({ src, media }) => (
								<source key={src} src={src} media={media} type="video/mp4" />
							))}
						</video>
					)}
					{/* Slight dark overlay on the video, same 25% shade as the project heroes. */}
					<div className="absolute inset-0 bg-black/25" />
				</div>
				<div data-parallax-shade className="absolute inset-0 bg-black opacity-0" />
			</Parallax>
			{/* Shade under the title, so the lime reads over a busy frame. */}
			<div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/50 to-transparent" />

			<div className="grid-site relative z-10 w-full">
				<div className="col-span-5 desk:col-span-6">
				<div data-hero-line data-hero-title data-lcp>
					{title}
				</div>
				{videoSrc && (
					// The wrapper takes the entrance animation; the button keeps its own CSS hover transition.
					<div data-hero-line data-hero-cta className="mt-1 flex gap-[24px]">
						<button type="button" onClick={openShowreel} className={control}>
							Play showreel
						</button>
						{hasLoop && (
							<button type="button" onClick={() => setChoice(!playing)} className={control}>
								{playing ? "Pause" : "Play"}
								<span className="sr-only"> background video</span>
							</button>
						)}
					</div>
				)}
				</div>
			</div>

			{videoSrc && (
				// Fades in as the video grows from 0.96, and fades out (globals.css → .showreel-dialog).
				<dialog
					ref={dialogRef}
					aria-label="Showreel"
					onClose={handleClose}
					onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
					className="showreel-dialog m-0 size-full max-h-none max-w-none overscroll-contain bg-scrim p-0 backdrop-blur-sm backdrop:bg-transparent"
				>
					<div className="pointer-events-none flex size-full items-center justify-center">
						<video
							ref={showreelRef}
							src={videoSrc}
							controls
							playsInline
							preload="none"
							className="pointer-events-auto h-[80lvh] w-[80%] rounded-ui object-contain desk:h-[90%] desk:w-[90%]"
						/>
					</div>
					<button
						type="button"
						aria-label="Close showreel"
						onClick={() => dialogRef.current.close()}
						className="hit absolute! top-m right-m size-[32px] cursor-pointer rounded-ui bg-white text-black focus-visible:outline-white transition-[scale,opacity] duration-150 ease-out hover:opacity-80 active:scale-[0.97] desk:size-[40px]"
					>
						<svg viewBox="0 0 55 55" fill="none" className="size-full" aria-hidden="true">
							<path d="M37 17L17.6897 37M36.3103 37L17 17" stroke="currentColor" strokeWidth="2" />
						</svg>
					</button>
				</dialog>
			)}
		</section>
	);
}
