import Img from "@/components/Img";
import Parallax from "@/components/Parallax";
import TitleRise from "./TitleRise";

/**
 * Project page hero: the title in white at display size, anchored bottom-left within the page margins like
 * the home hero's, over a darkened, edge-to-edge photo that drifts with scroll. Full screen on desk and half
 * the screen on phones (--hero-h).
 *
 * data-project-hero: the page-load curtain waits for this photo before it lifts (components/Intro.jsx).
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
		className="relative isolate flex h-(--hero-h) items-end overflow-hidden px-m pb-m text-white"
	>
		<div className="absolute inset-0 -z-10">
			<Parallax className="relative h-[110%] w-full">
				{/* Prismic alt text if set, otherwise the project name. */}
				<Img
					field={{ ...slice.primary.image, alt: slice.primary.image.alt || `${slice.primary.title?.replace(/\s+/g, " ")} office interior` }}
					fill
					loading="eager"
					fetchPriority="high"
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/25" />
			</Parallax>
		</div>
		<TitleRise className="w-full text-display whitespace-pre-line text-balance desk:w-[80%]">{slice.primary.title}</TitleRise>
	</section>
);

export default ProjectHero;
