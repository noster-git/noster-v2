import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Page({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();

	return <SliceZone slices={page.data.slices} components={components} />;
}

export async function generateMetadata({ params }) {
	const { uid } = await params;
	const page = (await getPage(uid, await getPreviewRef())) ?? notFound();
	const { meta_title, meta_description, meta_image } = page.data;

	return {
		title: meta_title || undefined,
		description: meta_description || undefined,
		openGraph: {
			images: [{ url: asImageSrc(meta_image) ?? "/noster-meta.png" }],
		},
	};
}

export async function generateStaticParams() {
	const pages = await createClient().getAllByType("project");
	// Cache Components needs at least one sample; before any project exists this one just 404s.
	return pages.length ? pages.map((page) => ({ uid: page.uid })) : [{ uid: "sample" }];
}

/**
 * @param {string} uid
 * @param {string} [ref]
 */
async function getPage(uid, ref) {
	"use cache";
	cacheLife("max");
	// Errors thrown inside "use cache" abort prerendering, so a missing page comes back as null → 404.
	const page = await createClient()
		.getByUID("project", uid, { ref })
		.catch(() => null);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
