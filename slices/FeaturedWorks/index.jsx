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
 * ":Featured Works" title, project grid and "View all projects" link.
 *
 * @typedef {import("@prismicio/client").Content.FeaturedWorksSlice} FeaturedWorksSlice
 * @typedef {import("@prismicio/react").SliceComponentProps<FeaturedWorksSlice>} FeaturedWorksProps
 * @type {import("react").FC<FeaturedWorksProps>}
 */
const FeaturedWorks = ({ slice }) => {
	const works = toWorks(slice.primary.projects).slice(0, HOME_LIMIT);

	return (
		<div data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
			<Reveal as="div" className="relative px-[2vw] text-[3vw] md:top-[4vw] md:text-[1vw]">
				<h2 data-reveal className="flex items-center text-[3em] leading-[normal] font-normal tracking-[-0.08vw] md:text-[5em]">
					:{asText(slice.primary.title)}
				</h2>
			</Reveal>
			<WorksGrid works={works} />
			<LineCta href="/works">{(slice.primary.button_text || "View all projects") + " ->"}</LineCta>
		</div>
	);
};

export default FeaturedWorks;
