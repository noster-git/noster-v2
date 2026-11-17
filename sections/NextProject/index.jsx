import { stegaClean } from "next-sanity";
import LineCta from "@/components/LineCta";
import { getProjectMedia } from "@/lib/projects";
import { fetchOptions } from "@/lib/sanity/live";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * "View Next Project" line link at the end of a project page, spaced like Home's sections, with a
 * small 5:3 crop of the next project's hero photo before the label. In the studio's live preview the link
 * opens the field that picks the next project.
 *
 * @param {{ section: { href?: string | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const NextProject = async ({ section, edit }) => {
	const href = stegaClean(section.href);
	if (!href) return null;
	const media = await getProjectMedia(await fetchOptions());
	const next = media[href];

	return (
		<div {...editProps(edit())}>
			{/* The accessible name starts with the visible words and adds which project comes next. */}
			<LineCta href={href} image={next?.hero} label={next?.name ? `View Next Project: ${next.name}` : undefined} className="pt-6 pb-6" edit={edit("project")}>
				View Next Project
			</LineCta>
		</div>
	);
};

export default NextProject;
