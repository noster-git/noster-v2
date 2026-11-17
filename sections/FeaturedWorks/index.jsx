import { stegaClean } from "next-sanity";
import { hasImage } from "@/lib/sanity/image";
import WorksGrid from "@/components/WorksGrid";
import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";

// How many of the newest projects Home shows; /works shows them all.
const HOME_LIMIT = 15;

/**
 * Projects newest-first: editors add at the bottom, so the list is reversed. Items without a name, an
 * image or a project page are skipped.
 * media (lib/projects.js): each project's hero photo, which its card preloads on hover.
 *
 * @param {Array<{ name?: string | null, image?: import("@/lib/sanity/image").SanityImage | null, href?: string | null }> | null | undefined} projects
 * @param {Awaited<ReturnType<typeof import("@/lib/projects").getProjectMedia>>} [media]
 */
export function toWorks(projects, media = {}) {
	return (projects ?? [])
		.filter((p) => p.name?.trim() && hasImage(p.image) && stegaClean(p.href))
		.reverse()
		.map((p) => {
			const href = stegaClean(p.href);
			return { href, name: p.name.trim(), image: p.image, hero: media[href]?.hero ?? null };
		});
}

/**
 * "Featured Works" at display size with its section index, the project grid and "View all projects" link.
 *
 * @param {{ section: { title?: string | null, buttonText?: string | null, projects?: Parameters<typeof toWorks>[0] }, context?: { media?: Parameters<typeof toWorks>[1] } }} props
 */
const FeaturedWorks = ({ section, context }) => {
	const works = toWorks(section.projects, context?.media).slice(0, HOME_LIMIT);

	return (
		<div>
			<Reveal as="div" className="px-m pt-10 pb-3">
				<SectionLabel as="div" top>
					<h2 data-reveal="lines" className="min-w-0 text-display">
						{section.title}
					</h2>
				</SectionLabel>
			</Reveal>
			<WorksGrid works={works} />
			<LineCta href="/works">{section.buttonText || "View all projects"}</LineCta>
		</div>
	);
};

export default FeaturedWorks;
