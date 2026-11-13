"use client";

import { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { EASE, lineRise } from "@/lib/motion";
import { ready } from "@/lib/intro";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

gsap.registerPlugin(useGSAP, SplitText);

/**
 * Interactive part of the Hero: entrance animation, poster → video fade-in, and the showreel dialog.
 * Fills the first screen; the title sits at the bottom on the page grid (6 of 10 columns on desk).
 */
export default function HeroClient({ sliceType, variation, title, backdrop, videoSrc }) {
	const scope = useRef(null);
	const videoRef = useRef(null);
	const dialogRef = useRef(null);
	const showreelRef = useRef(null);
	const lenis = useLenis();

	// Entrance, after the page-load intro (components/Intro.jsx). The start states are already held by CSS
	// from the first frame (.js-anim, globals.css), so nothing flashes:
	//   the photo settles from 1.12× (first visit, as the curtain lifts), the title rises line by line out of
	//   its own masks, then "Play showreel" rises in.
	useGSAP(
		() => {
			// The video may already be playable by the time this runs.
			if (videoRef.current && videoRef.current.readyState >= 3) revealVideo();

			const root = document.documentElement;
			if (!root.classList.contains("js-anim")) return;
			const firstVisit = !root.classList.contains("intro-skip");
			const el = scope.current;
			let tl;
			let split;
			Promise.all([ready(), document.fonts.ready]).then(() => {
				if (!el.isConnected) return;
				tl = gsap.timeline();
				if (firstVisit) tl.to(el.querySelector("[data-hero-media]"), { scale: 1, duration: 2.4, ease: EASE }, 0);
				const title = el.querySelector("[data-hero-title]");
				const heading = title?.querySelector("h1");
				if (heading) {
					split = SplitText.create(heading, { type: "lines", mask: "lines" });
					gsap.set(title, { autoAlpha: 1 });
					tl.fromTo(split.lines, lineRise.from, lineRise.to, firstVisit ? 0.3 : 0.1);
				} else if (title) tl.fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE }, 0.3);
				const cta = el.querySelector("[data-hero-cta]");
				if (cta) tl.fromTo(cta, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, ease: EASE }, "-=0.85");
			});
			return () => {
				tl?.kill();
				split?.revert();
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
		videoRef.current?.play();
		lenis?.start();
	}

	return (
		<section
			ref={scope}
			data-slice-type={sliceType}
			data-slice-variation={variation}
			data-nav-hero // the top CTA is white over this (NavCta)
			className="relative flex h-svh min-h-[480px] items-end overflow-hidden bg-black px-g pb-8 desk:pb-2"
		>
			<div data-hero-media className="absolute inset-0">
				{backdrop}
				{videoSrc && (
					<video
						ref={videoRef}
						src={videoSrc}
						autoPlay
						muted
						loop
						playsInline
						preload="auto"
						onCanPlay={revealVideo}
						className="invisible absolute inset-0 size-full object-cover opacity-0"
					/>
				)}
				{/* Slight dark overlay on the video, same 25% shade as the project heroes. */}
				<div className="absolute inset-0 bg-black/25" />
			</div>

			<div className="grid-site relative z-10 w-full">
				<div className="col-span-5 desk:col-span-6">
				<div data-hero-line data-hero-title>
					{title}
				</div>
				{videoSrc && (
					// The wrapper takes the entrance animation; the button keeps its own CSS hover transition.
					<div data-hero-line data-hero-cta className="mt-1">
						<button
							type="button"
							onClick={openShowreel}
							className="cursor-pointer text-white underline underline-offset-2 transition-opacity duration-200 hover:opacity-50"
						>
							Play showreel
						</button>
					</div>
				)}
				</div>
			</div>

			{videoSrc && (
				<dialog
					ref={dialogRef}
					aria-label="Showreel"
					onClose={handleClose}
					onClick={(e) => e.target === e.currentTarget && dialogRef.current.close()}
					className="m-0 size-full max-h-none max-w-none bg-black/80 p-0 backdrop-blur-[8px] backdrop:bg-transparent"
				>
					<div className="pointer-events-none flex size-full items-center justify-center">
						<video
							ref={showreelRef}
							src={videoSrc}
							controls
							playsInline
							preload="none"
							className="pointer-events-auto h-[80lvh] w-[80%] rounded-media object-contain desk:h-[90%] desk:w-[90%]"
						/>
					</div>
					<button
						type="button"
						aria-label="Close showreel"
						onClick={() => dialogRef.current.close()}
						className="absolute top-g right-g size-[32px] cursor-pointer transition-[scale,opacity] duration-500 ease-quart hover:scale-95 hover:opacity-90 desk:size-[40px]"
					>
						<svg viewBox="0 0 55 55" fill="none" className="size-full" aria-hidden="true">
							<rect width="55" height="55" rx="8" fill="#F5F5F5" />
							<path d="M37 17L17.6897 37M36.3103 37L17 17" stroke="#14120E" strokeWidth="2" />
						</svg>
					</button>
				</dialog>
			)}
		</section>
	);
}
