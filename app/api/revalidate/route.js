import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { revalidatePrismicPages } from "@prismicio/next";

/**
 * Prismic webhook: on a publish, drops the cached copies of the changed documents and of everything else
 * read from Prismic (every Prismic "use cache" scope carries the "prismic" tag), so the next visit
 * renders fresh content. Only requests carrying the webhook secret are accepted; with no secret set,
 * every request is refused.
 */
/** Compares in constant time, so response timing reveals nothing about the secret. */
function sameSecret(given, secret) {
	const a = Buffer.from(String(given ?? ""));
	const b = Buffer.from(secret);
	return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request) {
	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
	}

	const secret = process.env.PRISMIC_WEBHOOK_SECRET;
	if (!secret || !sameSecret(body?.secret, secret)) {
		return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
	}

	if (body.type === "api-update") {
		revalidatePrismicPages(body.documents);
		// Navigation, footer and lists read documents other than the ones published: refresh them all now.
		revalidateTag("prismic", { expire: 0 });
	}

	return NextResponse.json({ revalidated: true, now: Date.now() });
}
