import { cacheLife, cacheTag } from "next/cache";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { toWorks } from "@/slices/FeaturedWorks";
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
 * The heading and SEO come from the "works" page in Prismic.
 */
export default async function Page() {
	const { works, title } = await getData(await getPreviewRef());

	return (
		<>
			<JsonLd data={worksList(works)} />
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
	const { page } = await getData(await getPreviewRef());

	const title = page?.data.meta_title || "Office Interior Projects in Trivandrum & Kochi | Noster";
	const description = page?.data.meta_description || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		alternates: { canonical: "/works" },
		openGraph: {
			...OPEN_GRAPH,
			url: "/works",
			title,
			description,
			images: [shareImage([page?.data.meta_image])],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getData(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const client = createClient();
	// A missing Works page only means the default heading and SEO.
	const [home, page, media] = await Promise.all([
		client.getSingle("home", { ref }),
		client.getSingle("works", { ref }).catch(() => null),
		getProjectMedia(ref), // each project's hero photo, for its card
	]);
	cacheTagPrismicPages(page ? [home, page] : [home]);

	const featured = home.data.slices.find((s) => s.slice_type === "featured_works");
	return {
		page,
		title: page?.data.title || "Our Works",
		works: featured ? toWorks(featured.primary.projects, media) : [],
	};
}
