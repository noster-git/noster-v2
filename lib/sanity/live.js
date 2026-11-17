import "server-only";
import { cookies, draftMode } from "next/headers";
import { cacheLife } from "next/cache";
import { defineLive, resolvePerspectiveFromCookies } from "next-sanity/live";
import { client } from "./client";
import { dataOrNull } from "./fetch";
import { withImageUrls } from "./image";

// A Viewer token. The dataset is private, so the server reads published content with it too (it is set on
// the server's client, and sent for drafts in draft mode); <SanityLive> gives it to the browser only when
// drafts are included (draft mode), never to visitors.
const token = process.env.SANITY_API_READ_TOKEN;

/**
 * sanityFetch: a query that tags its cache entry with the documents it read, so a publish refreshes it.
 * SanityLive: listens for published changes in the browser and refreshes the pages they touch, with no
 * rebuild. Both need the perspective and stega set on every call.
 */
const server = client.withConfig({ token });

export const { sanityFetch, SanityLive } = defineLive({
	client: server,
	serverToken: token,
	browserToken: token,
	strict: true,
});

/**
 * @typedef {{ perspective: import("next-sanity/live").LivePerspective, stega: boolean }} FetchOptions
 */

/**
 * Published content and no click-to-edit markers for visitors; in draft mode, the perspective the studio
 * picked (drafts by default) with the markers on. Reads the request (draft mode, cookies), so call it
 * outside any "use cache" scope and pass the result in.
 *
 * @returns {Promise<FetchOptions>}
 */
export async function fetchOptions() {
	const { isEnabled } = await draftMode();
	if (!isEnabled) return { perspective: "published", stega: false };
	const perspective = await resolvePerspectiveFromCookies({ cookies: await cookies() });
	return { perspective: perspective ?? "drafts", stega: true };
}

/**
 * The cached content fetch every page reads through. Cached until a publish expires its tags. Images in
 * the result come with their address and size (withImageUrls).
 *
 * @param {{ query: string, params?: Record<string, unknown> } & FetchOptions} options
 * @returns {Promise<{ data: any }>}
 */
export async function cachedFetch({ query, params, perspective, stega }) {
	"use cache";
	const { data } = await sanityFetch({ query, params, perspective, stega });
	return { data: withImageUrls(data) };
}

/**
 * Published content for files no browser keeps open (the sitemap, llms.txt), so no visitor's live connection
 * refreshes them: re-read from the CMS every hour.
 *
 * @param {{ query: string, params?: Record<string, unknown> }} options
 * @returns {Promise<{ data: any }>}
 */
export async function hourlyFetch({ query, params = {} }) {
	"use cache";
	cacheLife("hours");
	const data = await server.fetch(query, params, { perspective: "published", stega: false });
	return { data };
}

/**
 * A page's document through the cached fetch, or null when there is none (lib/sanity/fetch.js).
 *
 * @param {{ query: string, params?: Record<string, unknown> } & FetchOptions} options
 */
export function fetchOrNull(options) {
	return dataOrNull(cachedFetch(options));
}
