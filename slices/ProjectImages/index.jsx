import { isFilled } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";

/**
 * Project photos laid out in 60/40 rows with the hover motion (see "Project page photos" in globals.css).
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
				<div
					key={i}
					data-portrait={image.dimensions.height > image.dimensions.width || undefined}
					className="project-image overflow-hidden"
				>
					{/* 98% like live: landscapes keep a thin gap under the photo */}
					<div className="project-image-photo h-[98%] w-full overflow-hidden">
						<PrismicNextImage
							field={{ ...image, alt: image.alt || `${context?.projectName ?? "Project"} office interior, photo ${i + 1}` }}
							sizes="(max-width: 680px) 100vw, 80vw"
							className="size-full object-cover"
						/>
					</div>
				</div>
			))}
	</div>
);

export default ProjectImages;
