import { cacheLife } from "next/cache";
import { asImageSrc } from "@prismicio/client";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient, queryOrNull } from "@/prismicio";
import { toWorks } from "@/slices/FeaturedWorks";
import WorksGrid from "@/components/WorksGrid";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import { worksList } from "@/lib/schema";
import { DEFAULT_DESCRIPTION } from "@/lib/site";
import { getProjectMedia } from "@/lib/projects";

/**
 * Our Works: every project from Home's Featured Works list (newest first; Home shows only 15).
 * The heading and SEO come from the "works" page in Prismic.
 */
export default async function Page() {
	const { works, title } = await getData(await getPreviewRef());

	return (
		<>
			<JsonLd data={worksList(works)} />
			<Reveal as="div" className="px-m pt-[84px] pb-4 desk:pt-[120px]">
				<h1 data-reveal="lines" className="text-display">
					:{title}
				</h1>
			</Reveal>
			<WorksGrid works={works} headingLevel={2} />
		</>
	);
}

export async function generateMetadata() {
	const { page } = await getData(await getPreviewRef());

	const title = page?.data.meta_title || "Works | Noster";
	const description = page?.data.meta_description || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		alternates: { canonical: "/works" },
		openGraph: {
			url: "/works",
			title,
			description,
			images: [{ url: asImageSrc(page?.data.meta_image) ?? "/noster-meta.png" }],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getData(ref) {
	"use cache";
	cacheLife("max");
	const client = createClient();
	// A missing Works page only means the default heading and SEO.
	const [home, page, media] = await Promise.all([
		client.getSingle("home", { ref }),
		client.getSingle("works", { ref }).catch(() => null),
		getProjectMedia(ref), // each project's hero photo, for its card
	]);
	cacheTagPrismicPages(page ? [home, page] : [home]);

	const featured = home?.data.slices.find((s) => s.slice_type === "featured_works");
	return {
		page,
		title: page?.data.title || "Our Works",
		works: featured ? toWorks(featured.primary.projects, media) : [],
	};
}
