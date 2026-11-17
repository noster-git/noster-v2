import { asLink, asText, isFilled } from "@prismicio/client";
import WorksGrid from "@/components/WorksGrid";
import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";

// How many of the newest projects Home shows; /works shows them all.
const HOME_LIMIT = 15;

/**
 * Projects newest-first: editors add at the bottom, so the list is reversed. Items without an image or a
 * project page are skipped.
 * media (lib/projects.js): each project's hero photo, which its card preloads on hover.
 */
export function toWorks(projects, media = {}) {
	return projects
		.filter((p) => isFilled.image(p.image) && asLink(p.link))
		.reverse()
		.map((p) => {
			const href = asLink(p.link);
			return { href, name: p.name ?? "", image: p.image, hero: media[href]?.hero ?? null };
		});
}

/**
 * "Featured Works" at display size with its section index, the project grid and "View all projects" link.
 *
 * @typedef {import("@prismicio/client").Content.FeaturedWorksSlice} FeaturedWorksSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FeaturedWorksSlice>} FeaturedWorksProps
 * @type {import("react").FC<FeaturedWorksProps>}
 */
const FeaturedWorks = ({ slice, context }) => {
	const works = toWorks(slice.primary.projects, context?.media).slice(0, HOME_LIMIT);

	return (
		<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			<Reveal as="div" className="px-m pt-10 pb-3">
				<SectionLabel as="div" top>
					<h2 data-reveal="lines" className="min-w-0 text-display">
						{asText(slice.primary.title)}
					</h2>
				</SectionLabel>
			</Reveal>
			<WorksGrid works={works} />
			<LineCta href="/works">{slice.primary.button_text || "View all projects"}</LineCta>
		</div>
	);
};

export default FeaturedWorks;
