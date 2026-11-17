import { stegaClean } from "next-sanity";
import { cachedFetch } from "@/lib/sanity/live";
import { PROJECT_ORDER } from "@/lib/sanity/queries";
import { hasImage } from "@/lib/sanity/image";
import { NO_EDIT, editor, item, scope } from "@/lib/sanity/edit";

/**
 * @typedef {{
 *   _key?: string | null,
 *   _id?: string,
 *   _type?: string,
 *   name?: string | null,
 *   href?: string | null,
 *   image?: import("@/lib/sanity/image").SanityImage | null,
 *   hero?: import("@/lib/sanity/image").SanityImage | null,
 * }} ProjectCard A project as a card shows it (lib/sanity/queries.js → CARD): `image` is the card photo, else
 * the main photo; `hero` the main photo.
 *
 * @typedef {{ href: string, name: string, image: import("@/lib/sanity/image").SanityImage, hero: import("@/lib/sanity/image").SanityImage | null, edit?: { item?: string, name?: string } }} Work
 * A card ready for the grid and the list (components/WorksGrid.jsx).
 */

/**
 * Every project in the Works page order (the order set on the Works page, then any project not in it, newest
 * first). When the content can't be read, there are none: cards and links simply go without.
 *
 * @param {import("@/lib/sanity/live").FetchOptions} options
 * @returns {Promise<ProjectCard[]>}
 */
export async function getProjects(options) {
	return cachedFetch({ query: PROJECT_ORDER, ...options })
		.then(({ data }) => data ?? [])
		.catch(() => []);
}

/**
 * Projects as cards, in the order given. Projects without a name, a photo or a page are skipped; names are
 * plain text (no click-to-edit markers). In the studio's live preview each card opens its place in the list
 * it comes from (`list`, the array, by the card's key) and its name the project's name; `stega` turns that on.
 *
 * @param {Array<ProjectCard | null | undefined>} projects
 * @param {{ list?: import("@/lib/sanity/edit").Edit, stega?: boolean }} [options]
 * @returns {Work[]}
 */
export function toWorks(projects, { list = NO_EDIT, stega = false } = {}) {
	return (projects ?? [])
		.filter((p) => p && stegaClean(p.name)?.trim() && hasImage(p.image) && stegaClean(p.href))
		.map((p) => {
			const href = stegaClean(p.href);
			// The photo's alt text without markers too: the photo opens the whole entry, not just its alt text.
			const work = { href, name: stegaClean(p.name).trim(), image: stegaClean(p.image), hero: hasImage(p.hero) ? stegaClean(p.hero) : null };
			if (!list.doc && !stega) return work;
			return { ...work, edit: { item: p._key ? scope(list, item(p._key))() : undefined, name: editor(p, stega)("name") } };
		});
}

/**
 * The project after `id` in the Works order, back to the first after the last; null when there is no other.
 *
 * @param {ProjectCard[]} order
 * @param {string} id
 */
export function nextInOrder(order, id) {
	const ids = order.map((p) => stegaClean(p._id));
	const at = ids.indexOf(stegaClean(id));
	if (order.length < 2) return null;
	return order[(at + 1) % order.length] ?? null;
}
