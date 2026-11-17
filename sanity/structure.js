import { CogIcon } from "@sanity/icons/Cog";
import { DocumentsIcon } from "@sanity/icons/Documents";
import { BookIcon } from "@sanity/icons/Book";

/** A one-off document, opened straight from the menu. */
const single = (S, type, title) => S.listItem().title(title).id(type).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title));

/** A list of one type's documents. */
const list = (S, type, title) => S.documentTypeListItem(type).title(title);

/**
 * The studio's menu:
 * - Site: settings, the menu and the footer, on every page;
 * - Pages: the fixed pages, then the pages built from sections;
 * - Projects;
 * - Library: the records projects and pages point at.
 */
export const structure = (S) =>
	S.list()
		.title("Content")
		.items([
			S.listItem()
				.title("Site")
				.id("site")
				.icon(CogIcon)
				.child(
					S.list()
						.title("Site")
						.items([single(S, "siteSettings", "Site settings"), single(S, "navigation", "Navigation"), single(S, "footer", "Footer")]),
				),
			S.listItem()
				.title("Pages")
				.id("pages")
				.icon(DocumentsIcon)
				.child(
					S.list()
						.title("Pages")
						.items([
							single(S, "home", "Home page"),
							single(S, "works", "Works page"),
							single(S, "privacyPolicy", "Privacy policy"),
							S.divider(),
							list(S, "page", "Other pages"),
						]),
				),
			list(S, "project", "Projects"),
			S.divider(),
			S.listItem()
				.title("Library")
				.id("library")
				.icon(BookIcon)
				.child(
					S.list()
						.title("Library")
						.items([
							list(S, "client", "Clients"),
							list(S, "sector", "Sectors"),
							list(S, "service", "Services"),
							list(S, "city", "Cities"),
							list(S, "office", "Offices"),
						]),
				),
		]);
