import Img from "@/components/Img";
import Ordered from "@/components/Ordered";
import { hasImage } from "@/lib/sanity/image";
import { item, scope } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * Photos in a masonry (CSS columns): two columns on desk, one on compact. Each photo keeps its own
 * shape, so nothing is cropped and no row leaves a gap. 6px gaps, page-margin sides and a page margin clear
 * of the stone brief above; every photo has the 4px corner radius.
 * A project page shows its own photos with it (context.projectName names the photos that have no alt text);
 * any page can add it as a section.
 * In the studio's live preview each photo opens its entry, and can be dragged to a new place. The section
 * and its photo list are then two elements (the section in the page margins, the list in its columns), so
 * each opens as itself.
 *
 * @param {{ section: { photos?: Array<import("@/lib/sanity/image").SanityImage & { _key: string }> | null }, context?: { projectName?: string }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const Photos = ({ section, context, edit }) => {
	const photos = scope(edit, "photos");
	const list = (
		<Ordered
			edit={photos}
			items={(section.photos ?? [])
				.filter((photo) => hasImage(photo))
				.map((photo, i) => ({
					key: photo._key,
					node: (
						<Img
							key={photo._key}
							image={photo}
							fallbackAlt={context?.projectName ? `${context.projectName} office interior, photo ${i + 1}` : ""}
							sizes="(max-width: 767px) 100vw, 50vw"
							{...editProps(photos(item(photo._key)))}
							className="mb-g block h-auto w-full break-inside-avoid rounded-ui"
						/>
					),
				}))}
		/>
	);
	if (!edit.doc) return <div className="columns-1 gap-g px-m pt-m desk:columns-2">{list}</div>;
	return (
		<div className="px-m pt-m" {...editProps(edit())}>
			<div className="columns-1 gap-g desk:columns-2" {...editProps(photos())}>
				{list}
			</div>
		</div>
	);
};

export default Photos;
