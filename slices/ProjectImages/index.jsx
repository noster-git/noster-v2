import { isFilled } from "@prismicio/client";
import Img from "@/components/Img";

/**
 * Project photos in a masonry, each at its own shape (see "Project page photos" in globals.css).
 *
 * @typedef {import("@prismicio/client").Content.ProjectImagesSlice} ProjectImagesSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectImagesSlice>} ProjectImagesProps
 * @type {import("react").FC<ProjectImagesProps>}
 */
const ProjectImages = ({ slice, context }) => (
	<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation} className="project-images">
		{slice.primary.photos
			.filter((p) => isFilled.image(p.image))
			.map(({ image }, i) => (
				<Img
					key={i}
					field={{ ...image, alt: image.alt || `${context?.projectName ?? "Project"} office interior, photo ${i + 1}` }}
					sizes="(max-width: 767px) 100vw, 50vw"
					className="project-image block h-auto w-full rounded-media"
				/>
			))}
	</div>
);

export default ProjectImages;
