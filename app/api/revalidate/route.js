import { NextResponse } from "next/server";
import { revalidatePrismicPages } from "@prismicio/next";

export async function POST(request) {
	const body = await request.json();
	if (body.type === "api-update") revalidatePrismicPages(body.documents);

	return NextResponse.json({ revalidated: true, now: Date.now() });
}