import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Page() {
	const page = await getPage(await getPreviewRef()).catch(() => notFound());

	return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata() {
	const page = await getPage(await getPreviewRef()).catch(() => notFound());
	const { meta_title, meta_description, meta_image } = page.data;

	return {
		title: meta_title || undefined,
		description: meta_description || undefined,
		openGraph: {
			images: [{ url: asImageSrc(meta_image) ?? "/noster-meta.png" }],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getPage(ref) {
	"use cache";
	cacheLife("max");
	const client = createClient();
	const page = await client.getSingle("home", { ref });
	cacheTagPrismicPages([page]);
	return page;
}
