import { DocumentsIcon } from "@sanity/icons/Documents";
import { BookIcon } from "@sanity/icons/Book";

/** A one-off document, opened straight from the menu (with its schema's icon). */
const single = (S, type, title) => S.listItem().title(title).id(type).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title));

/** A list of one type's documents. */
const list = (S, type, title) => S.documentTypeListItem(type).title(title);

/**
 * The studio's menu, what's on the site first:
 * - Pages: the fixed pages, then the pages built from sections;
 * - Projects;
 * - Navigation and Footer: on every page;
 * - Library: the records projects and pages point at;
 * - Settings: the company's name and contact details and the default search fields, used across the site.
 */
export const structure = (S) =>
	S.list()
		.title("Content")
		.items([
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
			single(S, "navigation", "Navigation"),
			single(S, "footer", "Footer"),
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
			S.divider(),
			single(S, "siteSettings", "Settings"),
		]);
