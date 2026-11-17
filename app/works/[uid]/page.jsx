import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import JsonLd from "@/components/JsonLd";
import { project } from "@/lib/schema";
import { SITE_NAME, OPEN_GRAPH, excerpt, shareImage } from "@/lib/site";

// All projects are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;
// A link to no project (a typo, an old or made-up slug) waits for its full render instead of streaming
// the page shell first, so notFound() still sets a real 404 status rather than a 200 with a not-found page.
export const ensureStatic = "navigation";

export default async function Page({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();
	const { name, description } = describe(page);

	return (
		<>
			<JsonLd data={project(page, { name, description })} />
			{/* name → slices use it for photo alt text when an image has none in Prismic */}
			<SliceZone slices={page.data.slices} components={components} context={{ projectName: name }} />
		</>
	);
}

export async function generateMetadata({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();
	const { name, description } = describe(page);
	const title = page.data.meta_title || `${name} | Works | ${SITE_NAME}`;
	const path = page.url || `/works/${page.uid}`;
	const hero = page.data.slices.find((s) => s.slice_type === "project_hero")?.primary.image;
	const image = shareImage([page.data.meta_image, hero], `${name} office interior`);

	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: { ...OPEN_GRAPH, type: "article", url: path, title, description, images: [image] },
	};
}

/**
 * Project name and meta description, with fallbacks so no project page goes out blank:
 * name from the hero title (or the UID), description from the brief text.
 */
function describe(page) {
	const slices = page.data.slices;
	const heroTitle = slices.find((s) => s.slice_type === "project_hero")?.primary.title;
	const brief = slices.find((s) => s.slice_type === "project_brief")?.primary.description;
	const name =
		heroTitle?.replace(/\s+/g, " ").trim() ||
		page.data.meta_title?.split("|")[0].trim() ||
		page.uid.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	return { name, description: page.data.meta_description || excerpt(asText(brief)) || undefined };
}

export async function generateStaticParams() {
	const pages = await createClient().getAllByType("project");
	// Cache Components needs at least one sample; before any project exists this one just 404s.
	return pages.length ? pages.map((page) => ({ uid: page.uid })) : [{ uid: "sample" }];
}

/**
 * @param {string} uid
 * @param {string} [ref]
 */
async function getPage(uid, ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	// Errors thrown inside "use cache" abort prerendering, so a missing page comes back as null → 404.
	const page = await createClient()
		.getByUID("project", uid, { ref })
		.catch(() => null);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
