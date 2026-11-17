import { redirectToPreviewURL } from "@prismicio/next";

import { createClient, repositoryName } from "../../../prismicio";

export async function GET(request) {
	// Prismic opens a preview with a token; without one there is no preview to start.
	const token = request.nextUrl.searchParams.get("token");
	if (!token) return new Response("Missing preview token", { status: 401 });

	// Only a live preview of this repository turns on draft mode (which skips the cache for that browser).
	if (!(await isPreviewToken(token))) return new Response("Invalid preview token", { status: 401 });

	const client = createClient();

	return await redirectToPreviewURL({ client, request });
}

/**
 * A preview token is a URL on this repository's own host (…prismic.io/previews/…) that Prismic's API
 * accepts as a ref. Asked directly: the Prismic client quietly falls back to published content when a ref
 * is invalid, so it can't tell.
 */
async function isPreviewToken(token) {
	try {
		const url = new URL(token);
		if (url.protocol !== "https:" || url.hostname !== `${repositoryName}.prismic.io` || !url.pathname.startsWith("/previews/")) return false;
		const api = new URL(`https://${repositoryName}.cdn.prismic.io/api/v2/documents/search`);
		api.searchParams.set("ref", token);
		api.searchParams.set("pageSize", "1");
		const res = await fetch(api, { cache: "no-store" });
		return res.ok;
	} catch {
		return false;
	}
}
