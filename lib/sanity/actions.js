"use server";

import { updateTag } from "next/cache";
import { parseTags } from "next-sanity/live";

// A publish touches a handful of documents; anything beyond this is not a real event and is ignored.
const MAX_TAGS = 50;

/**
 * Runs in a visitor's open page when content it shows is published (SanityLive). Expires the cached content
 * the change touched so the page re-renders with it in the same response: the next read waits for fresh
 * content instead of being served the old copy while it refreshes in the background.
 *
 * @param {unknown} unsafeTags the published documents' cache tags, as the browser sent them
 * @returns {Promise<void>}
 */
export async function expirePublishedContent(unsafeTags) {
	if (Array.isArray(unsafeTags) && unsafeTags.length > MAX_TAGS) return;
	for (const tag of parseTags(unsafeTags).tags) updateTag(tag);
}
