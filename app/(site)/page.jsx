import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { HOME } from "@/lib/sanity/queries";
import Sections from "@/components/Sections";
import { getFooter } from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { organization } from "@/lib/schema";
import { getProjectMedia } from "@/lib/projects";
import { editor } from "@/lib/sanity/edit";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, OPEN_GRAPH, shareImage } from "@/lib/site";

/** The home page document, or a 404 when there is none or the CMS can't be read. */
async function getPage(options) {
	return (await fetchOrNull({ query: HOME, ...options }).catch(() => null)) ?? notFound();
}

export default async function Page() {
	const options = await fetchOptions();
	const [page, footer, media] = await Promise.all([getPage(options), getFooter(options), getProjectMedia(options)]);
	const contact = stegaClean(page.sections?.find((s) => stegaClean(s._type) === "contact"));
	const values = (contact?.contacts ?? []).map((c) => c.value?.trim()).filter(Boolean);
	const email = values.find((v) => v.includes("@"));
	const phones = values.filter((v) => !v.includes("@"));

	return (
		<>
			<JsonLd data={organization(footer, { description: stegaClean(page.seo?.description), email, phones })} />
			{/* The Contact section ("Let's Build Together") is shown in the site footer instead (components/Footer.jsx):
			    it has no component of its own, so Sections skips it here. */}
			<Sections sections={page.sections} context={{ media }} edit={editor(page, options.stega)} />
		</>
	);
}

export async function generateMetadata() {
	const page = await getPage(await fetchOptions());
	const seo = stegaClean(page.seo);
	const title = seo?.title || DEFAULT_TITLE;
	const description = seo?.description || DEFAULT_DESCRIPTION;

	return {
		title,
		description,
		alternates: { canonical: "/" },
		openGraph: {
			...OPEN_GRAPH,
			url: "/",
			title,
			description,
			images: [shareImage([seo?.image])],
		},
	};
}
