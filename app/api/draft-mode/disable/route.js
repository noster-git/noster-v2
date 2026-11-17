import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

// Leaving draft mode changes state, so it happens on a POST only: a link or image on another site can't
// switch it off. Opening the address shows a one-button page that sends that POST.
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

/** Leaves draft mode: back to the published site, on the home page. */
export async function POST(request) {
	(await draftMode()).disable();
	return NextResponse.redirect(new URL("/", request.url), 303);
}
