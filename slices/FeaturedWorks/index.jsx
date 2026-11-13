import { asLink, asText, isFilled } from "@prismicio/client";
import WorksGrid from "@/components/WorksGrid";
import LineCta from "@/components/LineCta";
import Reveal from "@/components/Reveal";

// How many of the newest projects Home shows; /works shows them all.
const HOME_LIMIT = 15;

/** Projects newest-first: editors add at the bottom, so the list is reversed. Items without an image are skipped; no project link yet → /works. */
export function toWorks(projects) {
	return projects
		.filter((p) => isFilled.image(p.image))
		.reverse()
		.map((p) => ({ href: asLink(p.link) ?? "/works", name: p.name ?? "", description: p.description ?? "", image: p.image }));
}

/**
 * ":Featured Works" title, the project grid and "View all projects" link.
 *
 * @typedef {import("@prismicio/client").Content.FeaturedWorksSlice} FeaturedWorksSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FeaturedWorksSlice>} FeaturedWorksProps
 * @type {import("react").FC<FeaturedWorksProps>}
 */
const FeaturedWorks = ({ slice }) => {
	const works = toWorks(slice.primary.projects).slice(0, HOME_LIMIT);

	return (
		<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			<Reveal as="div" className="grid-site px-g pt-8 pb-4">
				<h2 data-reveal className="col-span-5 text-title desk:col-span-7">
					:{asText(slice.primary.title)}
				</h2>
			</Reveal>
			<WorksGrid works={works} />
			<LineCta href="/works">{slice.primary.button_text || "View all projects"}</LineCta>
		</div>
	);
};

export default FeaturedWorks;
