import { cacheLife, cacheTag } from "next/cache";
import { cacheTagPrismicPages } from "@prismicio/next";
import { createClient } from "@/prismicio";

/**
 * Every project's hero photo and name, by page path ("/works/uid" → { hero, name }), for the project cards
 * (components/WorksGrid.jsx): a card preloads it on hover, so the photo that grows into the hero on
 * click is the hero's own image (components/ProjectTransition.jsx).
 *
 * @param {string} [ref]
 * The name (the hero title) also labels the "View Next Project" link (slices/NextProject).
 *
 * @returns {Promise<Record<string, { hero: import("@prismicio/client").ImageField | null, name: string }>>}
 */
export async function getProjectMedia(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const projects = await createClient()
		.getAllByType("project", { ref })
		.catch(() => []);
	cacheTagPrismicPages(projects);
	const media = {};
	for (const p of projects) {
		const heroSlice = p.data.slices.find((s) => s.slice_type === "project_hero")?.primary;
		const hero = heroSlice?.image;
		const name = heroSlice?.title?.replace(/\s+/g, " ").trim() || "";
		media[p.url || `/works/${p.uid}`] = { hero: hero?.url ? hero : null, name };
	}
	return media;
}
