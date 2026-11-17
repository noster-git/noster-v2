import { stegaClean } from "next-sanity";
import { hasImage } from "@/lib/sanity/image";
import { NO_EDIT, item, scope } from "@/lib/sanity/edit";
import WorksGrid from "@/components/WorksGrid";
import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import { editProps } from "@/lib/sanity/edit-props";

// How many of the newest projects Home shows; /works shows them all.
const HOME_LIMIT = 15;

/**
 * Projects newest-first: editors add at the bottom, so the list is reversed. Items without a name, an
 * image or a project page are skipped. Names are plain text (no click-to-edit markers); in the studio's
 * live preview `edit` (the Featured Works projects list) gives each card what it opens: `edit.item`, the
 * project's entry (photo and page), and `edit.name`.
 * media (lib/projects.js): each project's hero photo, which its card preloads on hover.
 *
 * @param {Array<{ _key?: string, name?: string | null, image?: import("@/lib/sanity/image").SanityImage | null, href?: string | null }> | null | undefined} projects
 * @param {Awaited<ReturnType<typeof import("@/lib/projects").getProjectMedia>>} [media]
 * @param {import("@/lib/sanity/edit").Edit} [edit]
 */
export function toWorks(projects, media = {}, edit = NO_EDIT) {
	return (projects ?? [])
		.filter((p) => stegaClean(p.name)?.trim() && hasImage(p.image) && stegaClean(p.href))
		.reverse()
		.map((p) => {
			const href = stegaClean(p.href);
			const entry = scope(edit, item(p._key));
			// The photo's alt text without markers too: the photo opens the whole entry, not just its alt text.
			const work = { href, name: stegaClean(p.name).trim(), image: stegaClean(p.image), hero: media[href]?.hero ?? null };
			return entry.doc ? { ...work, edit: { item: entry(), name: entry("name") } } : work;
		});
}

/**
 * "Featured Works" at display size with its section index, the project grid and "View all projects" link.
 *
 * @param {{ section: { _key: string, title?: string | null, buttonText?: string | null, projects?: Parameters<typeof toWorks>[0] }, context?: { media?: Parameters<typeof toWorks>[1] }, edit: import("@/lib/sanity/edit").Edit }} props
 */
const FeaturedWorks = ({ section, context, edit }) => {
	const works = toWorks(section.projects, context?.media, scope(edit, "projects")).slice(0, HOME_LIMIT);

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
			<LineCta href="/works" editLabel={edit("buttonText")}>
				{section.buttonText || "View all projects"}
			</LineCta>
		</div>
	);
};

export default FeaturedWorks;
