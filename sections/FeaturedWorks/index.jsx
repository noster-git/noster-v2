import { scope } from "@/lib/sanity/edit";
import { toWorks } from "@/lib/projects";
import WorksGrid from "@/components/WorksGrid";
import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * The section's projects as cards, in the order picked, each with its project's main photo. In the studio's
 * live preview a card opens its place in the list, its name the project.
 *
 * @param {Array<{ _key: string, project?: import("@/lib/projects").ProjectCard | null }> | null | undefined} cards
 * @param {import("@/lib/sanity/edit").Edit} list the section's projects list
 */
export function featuredWorks(cards, list) {
	const projects = (cards ?? []).map((card) => card.project && { ...card.project, _key: card._key });
	return toWorks(projects, { list, stega: Boolean(list.doc) });
}

/**
 * "Featured Works" at display size with its section index, the project grid and its button ("View all
 * projects", to the Works page).
 *
 * @param {{ section: { title?: string | null, projects?: Parameters<typeof featuredWorks>[0], cta?: { label?: string | null, link?: import("@/lib/content").Link | null } | null }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const FeaturedWorks = ({ section, edit }) => {
	const works = featuredWorks(section.projects, scope(edit, "projects"));

	return (
		<div {...editProps(edit())}>
			<Reveal as="div" className="px-m pt-10 pb-3">
				<SectionLabel as="div" top>
					<h2 data-reveal="lines" className="min-w-0 text-display">
						{section.title}
					</h2>
				</SectionLabel>
			</Reveal>
			<WorksGrid works={works} />
			{section.cta?.label && (
				<LineCta link={section.cta.link} edit={edit(["cta", "link"])} editLabel={edit(["cta", "label"])}>
					{section.cta.label}
				</LineCta>
			)}
		</div>
	);
};

export default FeaturedWorks;
