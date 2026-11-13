import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import { asImageSrc } from "@prismicio/client";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient, queryOrNull } from "@/prismicio";
import { components } from "@/slices";
import { getFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organization } from "@/lib/schema";
import { getProjectMedia } from "@/lib/projects";

export default async function Page() {
	const ref = await getPreviewRef();
	const [page, footer, media] = await Promise.all([getPage(ref).catch(() => notFound()), getFooter(), getProjectMedia(ref)]);
	const contact = page.data.slices.find((s) => s.slice_type === "contact");
	const email = contact?.primary.contacts?.map((c) => c.value).find((v) => v?.includes("@"));

	return (
		<>
			<JsonLd data={organization(footer, { description: page.data.meta_description, email })} />
			{/* The Contact slice ("Let's Build Together") is shown in the site footer instead (components/Footer.jsx) */}
			<SliceZone slices={page.data.slices.filter((s) => s.slice_type !== "contact")} components={components} context={{ media }} />
		</>
	);
}

export async function generateMetadata() {
	const page = (await getPage(await getPreviewRef())) ?? notFound();
	const { meta_title, meta_description, meta_image } = page.data;

	return {
		title: meta_title || undefined,
		description: meta_description || undefined,
		alternates: { canonical: "/" },
		openGraph: {
			url: "/",
			title: meta_title || undefined,
			description: meta_description || undefined,
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
	const page = await queryOrNull((r) => createClient().getSingle("home", { ref: r }), ref);
	if (page) cacheTagPrismicPages([page]);
	return page;
}
