import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc, asText, isFilled } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient, queryOrNull } from "@/prismicio";
import { components } from "@/slices";
import JsonLd from "@/components/JsonLd";
import { project } from "@/lib/schema";
import { excerpt } from "@/lib/site";

// All projects are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;

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
	const title = page.data.meta_title || `${name} | Works | Noster`;
	const path = page.url || `/works/${page.uid}`;
	const hero = page.data.slices.find((s) => s.slice_type === "project_hero")?.primary.image;
	const image = asImageSrc(page.data.meta_image) ?? (isFilled.image(hero) ? asImageSrc(hero, { w: 1200 }) : "/noster-meta.png");

	return {
		title,
		description,
		alternates: { canonical: path },
		openGraph: { type: "article", url: path, title, description, images: [{ url: image }] },
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
	// A missing project comes back as null → 404 (see queryOrNull for stale preview refs and real errors).
	const page = await queryOrNull((r) => createClient().getByUID("project", uid, { ref: r }), ref);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
