import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { WORKS } from "@/lib/sanity/queries";
import { toWorks } from "@/sections/FeaturedWorks";
import WorksIndex from "@/components/WorksIndex";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import JsonLd from "@/components/JsonLd";
import { worksList } from "@/lib/schema";
import { DEFAULT_DESCRIPTION, OPEN_GRAPH, shareImage } from "@/lib/site";
import { getProjectMedia } from "@/lib/projects";

/**
 * Our Works: every project from Home's Featured Works list (newest first; Home shows only 15), as a grid or
 * a list (WorksIndex).
 * The heading and SEO come from the Works page document; without one, the defaults below.
 */
export default async function Page() {
	const options = await fetchOptions();
	const [data, media] = await Promise.all([
		fetchOrNull({ query: WORKS, ...options }),
		getProjectMedia(options), // each project's hero photo, for its card
	]);
	const title = data?.page?.title || "Our Works";
	const works = toWorks(data?.projects, media);

	return (
		<>
			<JsonLd data={worksList(stegaClean(works))} />
			<Reveal as="div" className="px-m pt-page pb-2">
				<SectionLabel as="div" top>
					<h1 data-reveal="lines" className="min-w-0 text-display">
						{title}
					</h1>
				</SectionLabel>
			</Reveal>
			<WorksIndex works={works} />
		</>
	);
}

export async function generateMetadata() {
	const data = await fetchOrNull({ query: WORKS, ...(await fetchOptions()) });
	const seo = stegaClean(data?.page?.seo);

	const title = seo?.title || "Office Interior Projects in Trivandrum & Kochi | Noster";
	const description = seo?.description || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		alternates: { canonical: "/works" },
		openGraph: {
			...OPEN_GRAPH,
			url: "/works",
			title,
			description,
			images: [shareImage([seo?.image])],
		},
	};
}
