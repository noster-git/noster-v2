import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

/** Leaves draft mode: back to the published site, on the home page. */
export async function GET(request) {
	(await draftMode()).disable();
	return NextResponse.redirect(new URL("/", request.url));
}
