import { notFound } from "next/navigation";
import { stegaClean } from "next-sanity";
import { cachedFetch, fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { PAGE_BY_SLUG, PAGE_SLUGS } from "@/lib/sanity/queries";
import Sections from "@/components/Sections";
import Reveal from "@/components/Reveal";
import SectionLabel from "@/components/SectionLabel";
import JsonLd from "@/components/JsonLd";
import { page as pageSchema } from "@/lib/schema";
import { getSettings } from "@/lib/settings";
import { editor } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";
import { pageMetadata } from "@/lib/site";

// Published pages are prerendered (generateStaticParams), so the page may block on params.
export const instant = false;
// An address with no page waits for its full render instead of streaming the shell first, so notFound()
// still sets a real 404 status rather than a 200 with a not-found page.
export const ensureStatic = "navigation";

/** The page at this address, or a 404 when there is none or the CMS can't be read. */
async function getPage(slug, options) {
	return (await fetchOrNull({ query: PAGE_BY_SLUG, params: { slug }, ...options }).catch(() => null)) ?? notFound();
}

/**
 * A page built from sections in the studio (Pages › Other pages), at /<its web address ending>. A page that
 * doesn't open with a Hero opens with its title, at display size like the Works page's.
 */
export default async function Page({ params }) {
	const { slug } = await params;
	const options = await fetchOptions();
	const page = await getPage(slug, options);
	const edit = editor(page, options.stega);
	const title = stegaClean(page.title)?.replace(/\s+/g, " ").trim() || slug;
	const opensWithHero = stegaClean(page.sections?.[0]?._type) === "hero";

	return (
		<>
			<JsonLd data={pageSchema(`/${stegaClean(page.slug)}`, title, { breadcrumb: true, description: stegaClean(page.seo?.description) || undefined })} />
			{!opensWithHero && (
				<Reveal as="div" className="px-m pt-page pb-2">
					<SectionLabel as="div" top>
						<h1 data-reveal="lines" {...editProps(edit("title"))} className="min-w-0 text-display">
							{page.title}
						</h1>
					</SectionLabel>
				</Reveal>
			)}
			<Sections sections={page.sections} edit={edit} />
		</>
	);
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	const options = await fetchOptions();
	const [page, settings] = await Promise.all([getPage(slug, options), getSettings(options)]);
	const title = stegaClean(page.title)?.replace(/\s+/g, " ").trim();
	return pageMetadata({ path: `/${stegaClean(page.slug)}`, seo: page.seo, settings, title: title ? `${title} | Noster` : undefined });
}

export async function generateStaticParams() {
	// Published pages only: the build has no request, so no draft mode.
	const { data: slugs } = await cachedFetch({ query: PAGE_SLUGS, perspective: "published", stega: false });
	// Cache Components needs at least one sample; before any page exists this one just 404s.
	return slugs?.length ? slugs.map((slug) => ({ slug })) : [{ slug: "sample" }];
}
