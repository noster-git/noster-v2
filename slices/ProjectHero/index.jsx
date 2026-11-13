import { PrismicNextImage } from "@prismicio/next";
import Parallax from "./Parallax";

/**
 * Project page hero: centred white title over a darkened, edge-to-edge photo that fills the screen
 * and drifts with scroll. (Live had 2vw side margins and padding-based height; changed on request.)
 * Title size as live: 3vw font on phones, 1vw from tablet up.
 *
 * @typedef {import("@prismicio/client").Content.ProjectHeroSlice} ProjectHeroSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectHeroSlice>} ProjectHeroProps
 * @type {import("react").FC<ProjectHeroProps>}
 */
const ProjectHero = ({ slice }) => (
	<section
		data-slice-type={slice.slice_type}
		data-slice-variation={slice.variation}
		className="relative isolate flex h-svh items-center justify-center overflow-hidden px-[3vw] text-[3vw] text-white md:px-[2vw] md:text-[1vw]"
	>
		<div className="absolute inset-0 -z-10">
			<Parallax className="relative h-[110%] w-full after:absolute after:inset-0 after:bg-black/25">
				{/* Prismic alt text if set, otherwise the project name. */}
				<PrismicNextImage
					field={{ ...slice.primary.image, alt: slice.primary.image.alt || `${slice.primary.title?.replace(/\s+/g, " ")} office interior` }}
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
			</Parallax>
		</div>
		<h1 className="w-[82%] text-center whitespace-pre-line text-[3em] font-normal md:text-[5em]">{slice.primary.title}</h1>
	</section>
);

export default ProjectHero;
