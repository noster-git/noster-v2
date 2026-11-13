import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";

export default async function Page({ params }) {
	const { uid } = await params;
	const page = await getPage(uid, await getPreviewRef()).catch(() => notFound());

	return groupImages(page.data.slices).map((group, i) =>
		group.images ? (
			<div key={i} className="project-images">
				<SliceZone slices={group.slices} components={components} />
			</div>
		) : (
			<SliceZone key={i} slices={group.slices} components={components} />
		),
	);
}

/** Runs of consecutive Project Image slices go into one `.project-images` grid so they can pair up. */
function groupImages(slices) {
	const groups = [];
	for (const slice of slices) {
		const images = slice.slice_type === "project_image";
		const last = groups.at(-1);
		if (last && last.images === images) last.slices.push(slice);
		else groups.push({ images, slices: [slice] });
	}
	return groups;
}

export async function generateMetadata({ params }) {
	const { uid } = await params;
	const page = await getPage(uid, await getPreviewRef()).catch(() => notFound());
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
	const page = await createClient().getByUID("project", uid, { ref });
	cacheTagPrismicPages([page]);
	return page;
}
