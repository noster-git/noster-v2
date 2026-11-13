import { PrismicNextImage } from "@prismicio/next";
import Parallax from "./Parallax";

/**
 * Project page hero: centred white title over a darkened photo that drifts with scroll.
 * Live values: section 1vw font (3vw phone), padding 20vw/2vw (26vw ≤1450px, 74vw 3vw 50vw phone).
 *
 * @typedef {import("@prismicio/client").Content.ProjectHeroSlice} ProjectHeroSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectHeroSlice>} ProjectHeroProps
 * @type {import("react").FC<ProjectHeroProps>}
 */
const ProjectHero = ({ slice }) => (
	<section
		data-slice-type={slice.slice_type}
		data-slice-variation={slice.variation}
		className="relative isolate overflow-hidden px-[3vw] pt-[74vw] pb-[50vw] text-[3vw] text-white md:px-[2vw] md:py-[26vw] md:text-[1vw] min-[1451px]:py-[20vw]"
	>
		<div className="absolute inset-0 -z-10 px-[2vw]">
			<Parallax className="relative h-[110%] w-full after:absolute after:inset-0 after:bg-black/25">
				<PrismicNextImage field={slice.primary.image} fill priority sizes="100vw" className="object-cover" />
			</Parallax>
		</div>
		<div className="flex items-center justify-center">
			<h1 className="w-[82%] text-center text-[3em] font-normal md:text-[5em]">{slice.primary.title}</h1>
		</div>
	</section>
);

export default ProjectHero;
