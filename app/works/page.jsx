import { cacheLife } from "next/cache";
import { asImageSrc } from "@prismicio/client";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { toWorks } from "@/slices/FeaturedWorks";
import WorksGrid from "@/components/WorksGrid";
import Reveal from "@/components/Reveal";

/**
 * Our Works: every project from Home's Featured Works list (newest first; Home shows only 15).
 * The heading and SEO come from the "works" page in Prismic.
 */
export default async function Page() {
	const { works, title } = await getData(await getPreviewRef());

	return (
		<>
			<Reveal as="div" className="relative px-[2vw] pt-[12vw] text-[3vw] md:top-[4vw] md:text-[1vw]">
				<h1 data-reveal className="flex items-center text-[3em] leading-[normal] font-normal tracking-[-0.08vw] md:text-[5em]">
					:{title}
				</h1>
			</Reveal>
			<WorksGrid works={works} />
		</>
	);
}

export async function generateMetadata() {
	const { page } = await getData(await getPreviewRef());

	return {
		title: page?.data.meta_title || "Works | Noster",
		description: page?.data.meta_description || undefined,
		openGraph: {
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
	const [home, page] = await Promise.all([client.getSingle("home", { ref }), client.getSingle("works", { ref }).catch(() => null)]);
	cacheTagPrismicPages(page ? [home, page] : [home]);

	const featured = home.data.slices.find((s) => s.slice_type === "featured_works");
	return {
		page,
		title: page?.data.title || "Our Works",
		works: featured ? toWorks(featured.primary.projects) : [],
	};
}
