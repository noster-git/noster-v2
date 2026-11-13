import Img from "@/components/Img";
import Parallax from "./Parallax";
import TitleRise from "./TitleRise";

/**
 * Project page hero: centred white title over a darkened, edge-to-edge photo, full screen on desk and half
 * the screen on phones (--hero-h),
 * and drifts with scroll. Title in the title tier, within the page margins.
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
		data-nav-hero // the top CTA is white over this (NavCta)
		className="relative isolate flex h-(--hero-h) items-center justify-center overflow-hidden px-m text-white"
	>
		<div className="absolute inset-0 -z-10">
			<Parallax className="relative h-[110%] w-full">
				{/* Prismic alt text if set, otherwise the project name. */}
				<Img
					field={{ ...slice.primary.image, alt: slice.primary.image.alt || `${slice.primary.title?.replace(/\s+/g, " ")} office interior` }}
					fill
					preload
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/25" />
			</Parallax>
		</div>
		<TitleRise className="w-full text-center text-title whitespace-pre-line text-balance desk:w-[70%]">{slice.primary.title}</TitleRise>
	</section>
);

export default ProjectHero;
