import Image from "next/image";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import HeroClient from "./HeroClient";

// Used when the slice is set to Video but no video is picked from the media library.
const FALLBACK_VIDEO = "/video/home/geeky-wolf-hero-video.mp4";
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
			<PrismicNextImage field={image} fill priority sizes="100vw" fallbackAlt="" className="object-cover" />
		);
	} else if (is_video) {
		backdrop = <Image src={FALLBACK_POSTER} alt="" fill priority sizes="100vw" className="object-cover" />;
	}

	const videoSrc = is_video ? (isFilled.linkToMedia(video) ? video.url : FALLBACK_VIDEO) : null;

	return (
		<HeroClient
			sliceType={slice.slice_type}
			variation={slice.variation}
			backdrop={backdrop}
			videoSrc={videoSrc}
			title={
				<PrismicRichText
					field={title}
					components={{
						heading1: ({ children }) => (
							<h1 className="text-[3em] leading-none font-normal tracking-[-0.08vw] text-lime">{children}</h1>
						),
					}}
				/>
			}
		/>
	);
};

export default Hero;
