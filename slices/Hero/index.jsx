import Image from "next/image";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import Img from "@/components/Img";
import HeroClient from "./HeroClient";

// Used when the slice is set to Video but no video is picked from the media library.
const FALLBACK_VIDEO = "/video/home/geeky-wolf-hero-video.mp4";
// Its muted background loops: the first 25s of the showreel (10 shots, ending on a cut), 720p on phones
// (1.8MB) and 1080p on desk (3.5MB). The full file, with sound, is only fetched when the showreel opens.
const FALLBACK_LOOP = [
	{ src: "/video/home/geeky-wolf-hero-loop-720.mp4", media: "(max-width: 767px)" },
	{ src: "/video/home/geeky-wolf-hero-loop-1080.mp4" },
];
const FALLBACK_POSTER = "/video/home/geeky-wolf-hero-poster.webp";

/**
 * @typedef {import("@prismicio/client").Content.HeroSlice} HeroSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<HeroSlice>} HeroProps
 * @type {import("react").FC<HeroProps>}
 */
const Hero = ({ slice }) => {
	const { title, is_video, video, image } = slice.primary;

	// The image is the hero picture in Picture mode, and the poster shown while the video loads in Video mode.
	let backdrop = null;
	if (isFilled.image(image)) {
		backdrop = (
			<Img field={image} fill preload sizes="100vw" fallbackAlt="" className="object-cover" />
		);
	} else if (is_video) {
		backdrop = <Image src={FALLBACK_POSTER} alt="" fill preload sizes="100vw" className="object-cover" />;
	}

	const picked = isFilled.linkToMedia(video);
	const videoSrc = is_video ? (picked ? video.url : FALLBACK_VIDEO) : null;
	// A picked video is the full showreel, sound and all: it only plays as the background on desk. Phones
	// show the poster and fetch the file only when the showreel is opened.
	const loopSources = is_video ? (picked ? [{ src: video.url, media: "(min-width: 768px)" }] : FALLBACK_LOOP) : null;

	return (
		<HeroClient
			sliceType={slice.slice_type}
			variation={slice.variation}
			backdrop={backdrop}
			videoSrc={videoSrc}
			loopSources={loopSources}
			title={
				<PrismicRichText
					field={title}
					components={{
						heading1: ({ children }) => (
							<h1 className="text-title text-balance text-lime">{children}</h1>
						),
					}}
				/>
			}
		/>
	);
};

export default Hero;
