import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { cachedFetch, fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { PROJECT_BY_SLUG, PROJECT_SLUGS } from "@/lib/sanity/queries";
import ProjectHero from "@/sections/ProjectHero";
import ProjectBrief from "@/sections/ProjectBrief";
import Photos from "@/sections/Photos";
import NextProject from "@/sections/NextProject";
import Sections from "@/components/Sections";
import JsonLd from "@/components/JsonLd";
import { project } from "@/lib/schema";
import { describeProject } from "@/lib/content";
import { getProjects, nextInOrder } from "@/lib/projects";
import { getSettings } from "@/lib/settings";
import { editor } from "@/lib/sanity/edit";
import { pageMetadata } from "@/lib/site";

// All projects are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;
// A link to no project (a typo, an old or made-up slug) waits for its full render instead of streaming
// the page shell first, so notFound() still sets a real 404 status rather than a 200 with a not-found page.
export const ensureStatic = "navigation";

/** The project at this slug, or a 404 when there is none or the CMS can't be read. */
async function getPage(slug, options) {
	return (await fetchOrNull({ query: PROJECT_BY_SLUG, params: { slug }, ...options }).catch(() => null)) ?? notFound();
}

/**
 * A project page: its hero, "The project" (its text and facts), its photos, any extra sections, and the
 * button to the next project (the one picked on the project, else the next in the Works order).
 */
export default async function Page({ params }) {
	const { slug } = await params;
	const options = await fetchOptions();
	const [page, order] = await Promise.all([getPage(slug, options), getProjects(options)]);
	const { name, description, location, facts } = describeProject(page);
	const edit = editor(page, options.stega);
	const next = stegaClean(page.next?.href) ? page.next : nextInOrder(order, page._id);
	const works = editor({ _id: "works", _type: "works" }, options.stega);

	return (
		<>
			<JsonLd data={project(page, { name, description })} />
			<ProjectHero project={page} location={location} edit={edit} />
			<ProjectBrief summary={page.summary} facts={facts} edit={edit} />
			{/* name: the alt text of photos that have none */}
			<Photos section={{ photos: page.photos }} context={{ projectName: name }} edit={edit} />
			<Sections sections={page.sections} context={{ projectName: name }} edit={edit} />
			<NextProject next={next} label={page.nextLabel || "View Next Project"} edit={edit("nextProject")} editLabel={works("nextProjectLabel")} />
		</>
	);
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const options = await fetchOptions();
	const [page, settings] = await Promise.all([getPage(slug, options), getSettings(options)]);
	const { name, description } = describeProject(page);
	return pageMetadata({
		path: `/works/${stegaClean(page.slug)}`,
		seo: page.seo,
		settings,
		title: `${name} Office Interiors | Noster`,
		description,
		images: [page.heroImage],
		alt: `${name} office interior`,
		type: "article",
	});
}

export async function generateStaticParams() {
	// Published projects only: the build has no request, so no draft mode.
	const { data: slugs } = await cachedFetch({ query: PROJECT_SLUGS, perspective: "published", stega: false });
	// Cache Components needs at least one sample; before any project exists this one just 404s.
	return slugs?.length ? slugs.map((slug) => ({ slug })) : [{ slug: "sample" }];
}
