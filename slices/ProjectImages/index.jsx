import { isFilled } from "@prismicio/client";
import Img from "@/components/Img";

/**
 * Project photos in a masonry (CSS columns): two columns on desk, one on compact. Each photo keeps its own
 * shape, so nothing is cropped and no row leaves a gap. 6px gaps, page-margin sides and a page margin clear
 * of the stone brief above; every photo has the 4px corner radius.
 *
 * @typedef {import("@prismicio/client").Content.ProjectImagesSlice} ProjectImagesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectImagesSlice>} ProjectImagesProps
 * @type {import("react").FC<ProjectImagesProps>}
 */
const ProjectImages = ({ slice, context }) => (
	<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="columns-1 gap-g px-m pt-m desk:columns-2">
		{slice.primary.photos
			.filter((p) => isFilled.image(p.image))
			.map(({ image }, i) => (
				<Img
					key={i}
					field={{ ...image, alt: image.alt || `${context?.projectName ?? "Project"} office interior, photo ${i + 1}` }}
					sizes="(max-width: 767px) 100vw, 50vw"
					className="mb-g block h-auto w-full break-inside-avoid rounded-ui"
				/>
			))}
	</div>
);

export default ProjectImages;
