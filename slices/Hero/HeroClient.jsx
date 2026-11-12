"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";

gsap.registerPlugin(useGSAP);

/**
 * Interactive part of the Hero: entrance animation, poster → video fade-in, and the showreel dialog.
 * Sizes are in vw so the hero scales with the viewport like the live site
 * (section font-size: 3vw phone, 1.6vw tablet, 1vw laptop/desktop; everything inside is in em).
 */
export default function HeroClient({ sliceType, variation, title, backdrop, videoSrc }) {
	const scope = useRef(null);
	const videoRef = useRef(null);
	const dialogRef = useRef(null);
	const showreelRef = useRef(null);
	const lenis = useLenis();

	useGSAP(
		() => {
			gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
				gsap.from("[data-hero-reveal]", {
					autoAlpha: 0,
					y: 40,
					duration: 1.2,
					ease: "expo.out",
					stagger: 0.12,
					delay: 0.2,
				});
			});

			// The video may already be playable by the time this runs.
			if (videoRef.current && videoRef.current.readyState >= 3) revealVideo();
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
			className="relative flex h-[60em] items-end overflow-hidden bg-black px-[3vw] pt-[38vw] pb-[12vw] text-[3vw] md:h-[50em] md:px-[2vw] md:pt-[14vw] md:pb-[4vw] md:text-[1.6vw] lg:py-[6vw] lg:text-[1vw]"
		>
			<div className="absolute inset-0 mt-[5em] md:mt-0">
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
				<div className="absolute inset-0 bg-black/10" />
			</div>

			<div className="relative z-10 w-full md:w-[60%] md:text-[0.8em] lg:text-[1em]">
				<div data-hero-reveal>{title}</div>
				{videoSrc && (
					<button
						type="button"
						data-hero-reveal
						onClick={openShowreel}
						className="mt-[1em] cursor-pointer bg-black p-[1em] text-white transition-[scale,opacity] duration-300 ease-quart hover:scale-[0.96] hover:opacity-90"
					>
						View Showreel
					</button>
				)}
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
							className="pointer-events-auto h-[80lvh] w-[80%] object-contain md:h-[90%] md:w-[90%]"
						/>
					</div>
					<button
						type="button"
						aria-label="Close showreel"
						onClick={() => dialogRef.current.close()}
						className="absolute top-[1em] right-[1em] size-[1.6em] cursor-pointer text-[1.4em] transition-[scale,opacity] duration-500 ease-quart hover:scale-95 hover:opacity-90 md:size-[2em]"
					>
						<svg viewBox="0 0 55 55" fill="none" className="size-full" aria-hidden="true">
							<rect width="55" height="55" fill="#F5F5F5" />
							<path d="M37 17L17.6897 37M36.3103 37L17 17" stroke="#14120E" strokeWidth="2" />
						</svg>
					</button>
				</dialog>
			)}
		</section>
	);
}
