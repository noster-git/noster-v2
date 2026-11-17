// Where each document shows on the site, for the studio's live preview: the pages listed on a document,
// and the document a page opens for editing.

const HOME = { title: "Home", href: "/" };
const WORKS = { title: "Works", href: "/works" };
const PRIVACY = { title: "Privacy policy", href: "/privacy_policy" };

/** Site settings, the menu, the footer and the offices in it are on every page: these are the main ones. */
const EVERY_PAGE = [HOME, WORKS, PRIVACY];

/** One line, without extra spaces. */
const oneLine = (text) => text?.replace(/\s+/g, " ").trim();

/**
 * A project's page, titled with its name (as on the site), or its web address ending when it has none, then
 * the Works page that lists it.
 *
 * @param {{ slug?: string, name?: string } | null} doc
 */
export function projectLocations(doc) {
	if (!doc?.slug) return null;
	return { locations: [{ title: oneLine(doc.name) || doc.slug, href: `/works/${doc.slug}` }, WORKS] };
}

/**
 * A page built from sections, at its web address.
 *
 * @param {{ slug?: string, title?: string } | null} doc
 */
export function pageLocations(doc) {
	if (!doc?.slug) return null;
	return { locations: [{ title: oneLine(doc.title) || doc.slug, href: `/${doc.slug}` }] };
}

/** Records only named on project pages: which projects use one is shown in its References. */
const ON_PROJECTS = { message: "Shown on the pages of the projects that use it.", tone: "positive" };

/** @type {NonNullable<import("sanity/presentation").PresentationPluginOptions["resolve"]>} */
export const resolve = {
	locations: {
		siteSettings: { locations: EVERY_PAGE },
		navigation: { locations: EVERY_PAGE },
		footer: { locations: EVERY_PAGE },
		office: { locations: EVERY_PAGE },
		city: { locations: EVERY_PAGE },
		home: { locations: [HOME] },
		works: { locations: [WORKS] },
		privacyPolicy: { locations: [PRIVACY] },
		page: { select: { slug: "slug.current", title: "title" }, resolve: pageLocations },
		project: { select: { slug: "slug.current", name: "name" }, resolve: projectLocations },
		client: { locations: [HOME, WORKS] },
		sector: ON_PROJECTS,
		service: ON_PROJECTS,
	},
	mainDocuments: [
		{ route: "/", type: "home" },
		{ route: "/works", type: "works" },
		{ route: "/privacy_policy", type: "privacyPolicy" },
		{ route: "/works/:slug", filter: `_type == "project" && slug.current == $slug`, params: ({ params }) => ({ slug: params.slug }) },
		{ route: "/:slug", filter: `_type == "page" && slug.current == $slug`, params: ({ params }) => ({ slug: params.slug }) },
	],
};
