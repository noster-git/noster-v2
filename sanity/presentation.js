// Where each document shows on the site, for the studio's live preview: the pages listed on a document,
// and the document a page opens for editing.
import { map } from "rxjs";

const HOME = { title: "Home", href: "/" };
const WORKS = { title: "Works", href: "/works" };
const PRIVACY = { title: "Privacy policy", href: "/privacy_policy" };

/** Settings, the menu, the footer and the offices in it are on every page: these are the main ones. */
const EVERY_PAGE = [HOME, WORKS, PRIVACY];

/** Documents shown in the same places whatever is in them. */
const FIXED = {
	siteSettings: EVERY_PAGE,
	navigation: EVERY_PAGE,
	footer: EVERY_PAGE,
	office: EVERY_PAGE,
	home: [HOME],
	works: [WORKS],
	privacyPolicy: [PRIVACY],
};

/** One line, without extra spaces. */
const oneLine = (text) => text?.replace(/\s+/g, " ").trim();

/** A project's page, titled with its name (as on the site), or its web address ending when it has none. */
const projectPage = (p) => ({ title: oneLine(p.name) || p.slug, href: `/works/${p.slug}` });

/** The pages of projects using a record (`projects`, those that reference it and have an address). */
const projectPages = (projects) => (projects ?? []).filter((p) => p?.slug).map(projectPage);

const PROJECTS_USING = `*[_type == "project" && references($id) && defined(slug.current)] | order(name asc){ name, "slug": slug.current }`;

/**
 * What each document's live data is read with, and how it becomes its locations. Projects show on their own
 * page, on Home (Featured Works) and on the Works page; pages at their address; clients on Home
 * (Collaborators) and the pages of their projects; cities on every page (the offices) and their projects'
 * pages; sectors and services on their projects' pages.
 */
const LIVE = {
	project: {
		query: `*[_id == $id][0]{ name, "slug": slug.current }`,
		locate: (p) => (p?.slug ? [projectPage(p), HOME, WORKS] : null),
	},
	page: {
		query: `*[_id == $id][0]{ title, "slug": slug.current }`,
		locate: (p) => (p?.slug ? [{ title: oneLine(p.title) || p.slug, href: `/${p.slug}` }] : null),
	},
	client: { query: PROJECTS_USING, locate: (projects) => [HOME, ...projectPages(projects)] },
	city: { query: PROJECTS_USING, locate: (projects) => [...EVERY_PAGE, ...projectPages(projects)] },
	sector: { query: PROJECTS_USING, locate: projectPages },
	service: { query: PROJECTS_USING, locate: projectPages },
};

/** The document types whose locations are listed. */
export const LOCATED_TYPES = [...Object.keys(FIXED), ...Object.keys(LIVE)];

/**
 * The places a document shows, as a location state: a list of pages, or a note when it shows nowhere yet.
 *
 * @param {Array<{ title: string, href: string }> | null} locations
 */
export function toState(locations) {
	if (!locations) return null;
	return locations.length ? { locations } : { message: "Not shown on the site yet: no published page uses it.", tone: "caution" };
}

/**
 * Where a document shows, for the Presentation tool: fixed for the one-off documents, read live for the
 * rest (a project or page by its address, a library record by the projects that use it).
 *
 * @type {import("sanity/presentation").DocumentLocationResolver}
 */
export function locations({ id, type, perspectiveStack }, { documentStore }) {
	if (FIXED[type]) return { locations: FIXED[type] };
	const live = LIVE[type];
	if (!live) return null;
	return documentStore.listenQuery(live.query, { id: id.replace(/^drafts\./, "") }, { perspective: perspectiveStack?.length ? perspectiveStack : "drafts" }).pipe(map((data) => toState(live.locate(data))));
}

/** @type {NonNullable<import("sanity/presentation").PresentationPluginOptions["resolve"]>} */
export const resolve = {
	locations,
	mainDocuments: [
		{ route: "/", type: "home" },
		{ route: "/works", type: "works" },
		{ route: "/privacy_policy", type: "privacyPolicy" },
		{ route: "/works/:slug", filter: `_type == "project" && slug.current == $slug`, params: ({ params }) => ({ slug: params.slug }) },
		{ route: "/:slug", filter: `_type == "page" && slug.current == $slug`, params: ({ params }) => ({ slug: params.slug }) },
	],
};
