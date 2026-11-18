import { notFound } from "next/navigation";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { HOME } from "@/lib/sanity/queries";
import Sections from "@/components/Sections";
import JsonLd from "@/components/JsonLd";
import { organization } from "@/lib/schema";
import { getSettings } from "@/lib/settings";
import { editor } from "@/lib/sanity/edit";
import { DEFAULT_TITLE, pageMetadata } from "@/lib/site";

/** The home page document, or a 404 when there is none or the CMS can't be read. */
async function getPage(options) {
	return (await fetchOrNull({ query: HOME, ...options }).catch(() => null)) ?? notFound();
}

export default async function Page() {
	const options = await fetchOptions();
	const [page, settings] = await Promise.all([getPage(options), getSettings(options)]);

	return (
		<>
			<JsonLd data={organization(settings)} />
			<Sections sections={page.sections} edit={editor(page, options.stega)} />
		</>
	);
}

export async function generateMetadata() {
	const options = await fetchOptions();
	const [page, settings] = await Promise.all([getPage(options), getSettings(options)]);
	return pageMetadata({ path: "/", seo: page.seo, settings, title: DEFAULT_TITLE });
}
