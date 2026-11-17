import { Fragment } from "react";
import Image from "next/image";
import Img from "@/components/Img";
import { hasImage } from "@/lib/sanity/image";
import HeroClient from "./HeroClient";

// Used when the hero is set to show a video but none is uploaded.
const FALLBACK_VIDEO = "/video/home/geeky-wolf-hero-video.mp4";
// Its muted background loops: the first 25s of the showreel (10 shots, ending on a cut), 720p on phones
// (1.8MB) and 1080p on desk (3.5MB). The full file, with sound, is only fetched when the showreel opens.
const FALLBACK_LOOP = [
	{ src: "/video/home/geeky-wolf-hero-loop-720.mp4", media: "(max-width: 767px)" },
	{ src: "/video/home/geeky-wolf-hero-loop-1080.mp4" },
];
const FALLBACK_POSTER = "/video/home/geeky-wolf-hero-poster.webp";

/**
 * Home's first screen: the headline (each line break typed in it kept) over a photo or a looping video.
 *
 * @param {{ section: {
 *   title?: string | null,
 *   isVideo?: boolean | null,
 *   video?: { asset?: { url?: string } | null } | null,
 *   image?: import("@/lib/sanity/image").SanityImage | null,
 * }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const Hero = ({ section, edit }) => {
	const { title, isVideo, video, image } = section;

	// The image is the hero picture in Picture mode, and the poster shown while the video loads in Video mode.
	let backdrop = null;
	if (hasImage(image)) {
		backdrop = <Img image={image} fill preload sizes="100vw" fallbackAlt="" className="object-cover" />;
	} else if (isVideo) {
		backdrop = <Image src={FALLBACK_POSTER} alt="" fill preload sizes="100vw" className="object-cover" />;
	}

	const picked = video?.asset?.url;
	const videoSrc = isVideo ? (picked ?? FALLBACK_VIDEO) : null;
	// An uploaded video is the full showreel, sound and all: it only plays as the background on desk. Phones
	// show the poster and fetch the file only when the showreel is opened.
	const loopSources = isVideo ? (picked ? [{ src: picked, media: "(min-width: 768px)" }] : FALLBACK_LOOP) : null;

	return (
		<HeroClient
			backdrop={backdrop}
			videoSrc={videoSrc}
			loopSources={loopSources}
			// Only in the live preview: visitors' pages get no click-to-edit props at all.
			{...(edit.doc && { edit: edit() })}
			title={
				title?.trim() ? (
					<h1 className="text-title text-balance text-lime">
						{title.split("\n").map((line, i) => (
							<Fragment key={i}>
								{i > 0 && <br />}
								{line}
							</Fragment>
						))}
					</h1>
				) : null
			}
		/>
	);
};

export default Hero;
