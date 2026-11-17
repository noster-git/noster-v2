import Img from "@/components/Img";
import { hasImage } from "@/lib/sanity/image";

/**
 * Project photos in a masonry (CSS columns): two columns on desk, one on compact. Each photo keeps its own
 * shape, so nothing is cropped and no row leaves a gap. 6px gaps, page-margin sides and a page margin clear
 * of the stone brief above; every photo has the 4px corner radius.
 *
 * @param {{ section: { photos?: Array<import("@/lib/sanity/image").SanityImage & { _key: string }> | null }, context?: { projectName?: string } }} props
 */
const ProjectImages = ({ section, context }) => (
	<div className="columns-1 gap-g px-m pt-m desk:columns-2">
		{(section.photos ?? [])
			.filter((photo) => hasImage(photo))
			.map((photo, i) => (
				<Img
					key={photo._key}
					image={photo}
					fallbackAlt={`${context?.projectName ?? "Project"} office interior, photo ${i + 1}`}
					sizes="(max-width: 767px) 100vw, 50vw"
					className="mb-g block h-auto w-full break-inside-avoid rounded-ui"
				/>
			))}
	</div>
);

export default ProjectImages;
