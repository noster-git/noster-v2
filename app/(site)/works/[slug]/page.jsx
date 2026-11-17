import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { cachedFetch, fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { PROJECT_BY_SLUG, PROJECT_SLUGS } from "@/lib/sanity/queries";
import Sections from "@/components/Sections";
import JsonLd from "@/components/JsonLd";
import { project } from "@/lib/schema";
import { describeProject } from "@/lib/content";
import { OPEN_GRAPH, shareImage } from "@/lib/site";

// All projects are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;
// A link to no project (a typo, an old or made-up slug) waits for its full render instead of streaming
// the page shell first, so notFound() still sets a real 404 status rather than a 200 with a not-found page.
export const ensureStatic = "navigation";

/** The project at this slug, or a 404 when there is none or the CMS can't be read. */
async function getPage(slug) {
	const options = await fetchOptions();
	return (await fetchOrNull({ query: PROJECT_BY_SLUG, params: { slug }, ...options }).catch(() => null)) ?? notFound();
}

export default async function Page({ params }) {
	const { slug } = await params;
	const page = await getPage(slug);
	const { name, description, location } = describeProject(page);

	return (
		<>
			<JsonLd data={project(page, { name, description })} />
			{/* name → sections use it for photo alt text when a photo has none; location → the hero's h1 */}
			<Sections sections={page.sections} context={{ projectName: name, location }} />
		</>
	);
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const page = await getPage(slug);
	const { name, description } = describeProject(page);
	const seo = stegaClean(page.seo);
	const title = seo?.title || `${name} Office Interiors | Noster`;
	const path = `/works/${stegaClean(page.slug)}`;
	const hero = page.sections?.find((s) => stegaClean(s._type) === "projectHero")?.image;
	const image = shareImage([seo?.image, stegaClean(hero)], `${name} office interior`);

	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: { ...OPEN_GRAPH, type: "article", url: path, title, description, images: [image] },
	};
}

export async function generateStaticParams() {
	// Published projects only: the build has no request, so no draft mode.
	const { data: slugs } = await cachedFetch({ query: PROJECT_SLUGS, perspective: "published", stega: false });
	// Cache Components needs at least one sample; before any project exists this one just 404s.
	return slugs?.length ? slugs.map((slug) => ({ slug })) : [{ slug: "sample" }];
}
