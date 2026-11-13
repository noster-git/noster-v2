import { cacheLife } from "next/cache";
import { cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";

/**
 * Every project's hero photo, by page path ("/works/uid" → { hero }), for the project cards
 * (components/WorksGrid.jsx): a card preloads it on hover, so the photo that grows into the hero on
 * click is the hero's own image (components/ProjectTransition.jsx).
 *
 * @param {string} [ref]
 * @returns {Promise<Record<string, { hero: import("@prismicio/client").ImageField | null }>>}
 */
export async function getProjectMedia(ref) {
	"use cache";
	cacheLife("max");
	const projects = await createClient()
		.getAllByType("project", { ref })
		.catch(() => []);
	cacheTagPrismicPages(projects);
	const media = {};
	for (const p of projects) {
		const hero = p.data.slices.find((s) => s.slice_type === "project_hero")?.primary.image;
		media[p.url || `/works/${p.uid}`] = { hero: hero?.url ? hero : null };
	}
	return media;
}
