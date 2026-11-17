import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

// Leaving draft mode changes state, so it happens on a POST from this site only: a link, image or form on
// another site can't switch it off. Opening the address shows a one-button page that sends that POST.
const PAGE = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Leave preview</title>
<body style="font: 16px/1.4 system-ui, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center">
<form method="post">
<button type="submit" style="font: inherit; padding: 10px 16px; cursor: pointer">Leave preview and open the site</button>
</form>
</body>
</html>`;

/** The page with the button that leaves draft mode. */
export function GET() {
	return new Response(PAGE, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

/**
 * Whether the request was sent from a page on this site: the browser's Sec-Fetch-Site says so, or, from a
 * browser that doesn't send it, the Origin is this site's own.
 *
 * @param {Request} request
 */
export function fromThisSite(request) {
	const site = request.headers.get("sec-fetch-site");
	if (site) return site === "same-origin";
	const origin = request.headers.get("origin");
	return origin === new URL(request.url).origin;
}

/** Leaves draft mode: back to the published site, on the home page. Refused when sent from another site. */
export async function POST(request) {
	if (!fromThisSite(request)) return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
	(await draftMode()).disable();
	return NextResponse.redirect(new URL("/", request.url), 303);
}
