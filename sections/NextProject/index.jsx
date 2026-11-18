import { stegaClean } from "next-sanity";
import LineCta from "@/components/LineCta";

/**
 * The button at the end of a project page that opens the next project ("View Next Project"), spaced like
 * Home's sections, with a small 5:3 crop of that project's main photo before the words. In the studio's live
 * preview the button opens the project's Next project field, its words the Works page field they are set in.
 *
 * @param {{ next: import("@/lib/projects").ProjectCard | null | undefined, label: string, edit?: string, editLabel?: string }} props
 */
const NextProject = ({ next, label, edit, editLabel }) => {
	const href = stegaClean(next?.href);
	if (!href || !label) return null;
	const name = stegaClean(next.name)?.replace(/\s+/g, " ").trim();

	return (
		<div>
			{/* The accessible name starts with the visible words and adds which project comes next. */}
			<LineCta href={href} image={next.hero} label={name ? `${stegaClean(label)}: ${name}` : undefined} className="pt-6 pb-6" edit={edit} editLabel={editLabel}>
				{label}
			</LineCta>
		</div>
	);
};

export default NextProject;
