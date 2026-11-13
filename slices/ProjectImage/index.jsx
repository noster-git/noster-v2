import { PrismicNextImage } from "@prismicio/next";

/**
 * One project photo. Consecutive Project Image slices are wrapped in `.project-images` by the
 * project page, which lays them out in 60/40 rows with the hover motion (see globals.css).
 *
 * @typedef {import("@prismicio/client").Content.ProjectImageSlice} ProjectImageSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<ProjectImageSlice>} ProjectImageProps
 * @type {import("react").FC<ProjectImageProps>}
 */
const ProjectImage = ({ slice }) => {
	const { image } = slice.primary;
	const portrait = image.dimensions ? image.dimensions.height > image.dimensions.width : false;

	return (
		<section
			data-slice-type={slice.slice_type}
			data-slice-variation={slice.variation}
			data-portrait={portrait || undefined}
			className="project-image overflow-hidden"
		>
			{/* 98% like live: landscapes keep a thin gap under the photo */}
			<div className="project-image-photo h-[98%] w-full overflow-hidden">
				<PrismicNextImage
					field={image}
					alt=""
					sizes="(max-width: 680px) 100vw, 80vw"
					className="size-full object-cover"
				/>
			</div>
		</section>
	);
};

export default ProjectImage;
