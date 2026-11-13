import { PrismicNextImage } from "@prismicio/next";
import Parallax from "./Parallax";
import TitleRise from "./TitleRise";

/**
 * Project page hero: centred white title over a darkened, edge-to-edge photo that fills the screen
 * and drifts with scroll. Title in the title tier, within the page margins.
 *
 * Opened from a project card, the card's photo grows into this one (components/ProjectTransition.jsx,
 * which finds it by data-project-hero) and the title rises in after (data-project-title, globals.css).
 *
 * @typedef {import("@prismicio/client").Content.ProjectHeroSlice} ProjectHeroSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectHeroSlice>} ProjectHeroProps
 * @type {import("react").FC<ProjectHeroProps>}
 */
const ProjectHero = ({ slice }) => (
	<section
		data-slice-type={slice.slice_type}
		data-slice-variation={slice.variation}
		data-project-hero
		data-nav-hero // the top CTA is white over this (NavCta)
		className="relative isolate flex h-svh items-center justify-center overflow-hidden px-g text-white"
	>
		<div className="absolute inset-0 -z-10">
			<Parallax className="relative h-[110%] w-full">
				{/* Prismic alt text if set, otherwise the project name. */}
				<PrismicNextImage
					field={{ ...slice.primary.image, alt: slice.primary.image.alt || `${slice.primary.title?.replace(/\s+/g, " ")} office interior` }}
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				{/* 25% shade. Its own element so it can darken as the photo grows in from a card (globals.css). */}
				<div data-hero-shade className="absolute inset-0 bg-black/25" />
			</Parallax>
		</div>
		<TitleRise className="w-full text-center text-title whitespace-pre-line text-balance desk:w-[70%]">{slice.primary.title}</TitleRise>
	</section>
);

export default ProjectHero;
