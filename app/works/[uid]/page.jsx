import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { asText } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import JsonLd from "@/components/JsonLd";
import { project } from "@/lib/schema";
import { OPEN_GRAPH, excerpt, shareImage } from "@/lib/site";

// All projects are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;
// A link to no project (a typo, an old or made-up slug) waits for its full render instead of streaming
// the page shell first, so notFound() still sets a real 404 status rather than a 200 with a not-found page.
export const ensureStatic = "navigation";

export default async function Page({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();
	const { name, description, location } = describe(page);

	return (
		<>
			<JsonLd data={project(page, { name, description })} />
			{/* name → slices use it for photo alt text when an image has none in Prismic; location → the hero's h1 */}
			<SliceZone slices={page.data.slices} components={components} context={{ projectName: name, location }} />
		</>
	);
}

export async function generateMetadata({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();
	const { name, description } = describe(page);
	const title = page.data.meta_title || `${name} Office Interiors | Noster`;
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
 * Project name, location and meta description, with fallbacks so no project page goes out blank:
 * name from the hero title (or the UID), description from the brief text, location from the brief's
 * Location detail on one line without the state ("Technopark, Trivandrum, Kerala" → "Technopark, Trivandrum").
 */
function describe(page) {
	const slices = page.data.slices;
	const heroTitle = slices.find((s) => s.slice_type === "project_hero")?.primary.title;
	const brief = slices.find((s) => s.slice_type === "project_brief")?.primary;
	const name =
		heroTitle?.replace(/\s+/g, " ").trim() ||
		page.data.meta_title?.split("|")[0].trim() ||
		page.uid.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	const location = brief?.details
		?.find((d) => d.label?.trim().toLowerCase() === "location")
		?.value?.replace(/\s+/g, " ")
		.replace(/,?\s*(Kerala|Telangana|India)\s*$/i, "")
		.trim();
	return { name, location, description: page.data.meta_description || excerpt(asText(brief?.description)) || undefined };
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
