import { stegaClean } from "next-sanity";
import { cachedFetch } from "@/lib/sanity/live";
import { PROJECT_MEDIA } from "@/lib/sanity/queries";
import { hasImage } from "@/lib/sanity/image";

/**
 * Every project's hero photo and name, by page path ("/works/slug" → { hero, name }), for the project cards
 * (components/WorksGrid.jsx): a card preloads it on hover, so the photo that grows into the hero on
 * click is the hero's own image (components/ProjectTransition.jsx).
 * The name (the hero title) also labels the "View Next Project" link (sections/NextProject).
 * When the content can't be read, there are none: cards and the link simply go without.
 *
 * @param {import("@/lib/sanity/live").FetchOptions} options
 * @returns {Promise<Record<string, { hero: import("@/lib/sanity/image").SanityImage | null, name: string }>>}
 */
export async function getProjectMedia(options) {
	const projects = await cachedFetch({ query: PROJECT_MEDIA, ...options })
		.then(({ data }) => data ?? [])
		.catch(() => []);
	const media = {};
	for (const p of projects) {
		const href = stegaClean(p.href);
		if (!href) continue;
		media[href] = { hero: hasImage(p.hero) ? p.hero : null, name: stegaClean(p.name)?.replace(/\s+/g, " ").trim() || "" };
	}
	return media;
}
