// Where each document shows on the site, for the studio's live preview: the pages listed on a document,
// and the document a page opens for editing.

const HOME = { title: "Home", href: "/" };
const WORKS = { title: "Works", href: "/works" };
const PRIVACY = { title: "Privacy policy", href: "/privacy_policy" };

/** Navigation and footer are on every page: these are the main ones. */
const EVERY_PAGE = [HOME, WORKS, PRIVACY];

/**
 * A project's page, titled with its hero title (as on the site), or its web address ending when it has none.
 *
 * @param {{ slug?: string, sections?: Array<{ _type?: string, title?: string }> } | null} doc
 */
function projectLocations(doc) {
	if (!doc?.slug) return null;
	const title = doc.sections?.find((s) => s?._type === "projectHero")?.title?.replace(/\s+/g, " ").trim() || doc.slug;
	return { locations: [{ title, href: `/works/${doc.slug}` }] };
}

/** @type {NonNullable<import("sanity/presentation").PresentationPluginOptions["resolve"]>} */
export const resolve = {
	locations: {
		// Home's Featured Works also list the projects on the Works page, and its Contact section is in every footer.
		home: { locations: EVERY_PAGE },
		works: { locations: [WORKS] },
		privacyPolicy: { locations: [PRIVACY] },
		navigation: { locations: EVERY_PAGE },
		footer: { locations: EVERY_PAGE },
		project: { select: { slug: "slug.current", sections: "sections" }, resolve: projectLocations },
	},
	mainDocuments: [
		{ route: "/", type: "home" },
		{ route: "/works", type: "works" },
		{ route: "/privacy_policy", type: "privacyPolicy" },
		{ route: "/works/:slug", filter: `_type == "project" && slug.current == $slug`, params: ({ params }) => ({ slug: params.slug }) },
	],
};
