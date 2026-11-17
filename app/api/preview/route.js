import { redirectToPreviewURL } from "@prismicio/next";

import { createClient } from "../../../prismicio";

export async function GET(request) {
	// Prismic opens a preview with a token; without one there is no preview to start.
	if (!request.nextUrl.searchParams.get("token")) {
		return new Response("Missing preview token", { status: 401 });
	}

	const client = createClient();

	return await redirectToPreviewURL({ client, request });
}
