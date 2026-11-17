import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { SliceZone } from "@prismicio/react";
import { cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { getFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organization } from "@/lib/schema";
import { getProjectMedia } from "@/lib/projects";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, OPEN_GRAPH, shareImage } from "@/lib/site";

export default async function Page() {
	const ref = await getPreviewRef();
	const [page, footer, media] = await Promise.all([getPage(ref).catch(() => notFound()), getFooter(ref), getProjectMedia(ref)]);
	const contact = page.data.slices.find((s) => s.slice_type === "contact");
	const values = (contact?.primary.contacts ?? []).map((c) => c.value?.trim()).filter(Boolean);
	const email = values.find((v) => v.includes("@"));
	const phones = values.filter((v) => !v.includes("@"));

	return (
		<>
			<JsonLd data={organization(footer, { description: page.data.meta_description, email, phones })} />
			{/* The Contact slice ("Let's Build Together") is shown in the site footer instead (components/Footer.jsx) */}
			<SliceZone slices={page.data.slices.filter((s) => s.slice_type !== "contact")} components={components} context={{ media }} />
		</>
	);
}

export async function generateMetadata() {
	const page = await getPage(await getPreviewRef()).catch(() => notFound());
	const title = page.data.meta_title || DEFAULT_TITLE;
	const description = page.data.meta_description || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		alternates: { canonical: "/" },
		openGraph: {
			...OPEN_GRAPH,
			url: "/",
			title,
			description,
			images: [shareImage([page.data.meta_image])],
		},
	};
}

/**
 * @param {string} [ref]
 */
async function getPage(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const client = createClient();
	const page = await client.getSingle("home", { ref });
	cacheTagPrismicPages([page]);
	return page;
}
