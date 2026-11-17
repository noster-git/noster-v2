import { SINGLETON_TYPES } from "./schema/index.js";

const SINGLETON_TITLES = {
	home: "Home page",
	works: "Works page",
	privacyPolicy: "Privacy policy",
	navigation: "Navigation",
	footer: "Footer",
};

/** Desk: the one-off pages first, each opening its single document, then the list of projects. */
export const structure = (S) =>
	S.list()
		.title("Content")
		.items([
			...SINGLETON_TYPES.map((type) =>
				S.listItem().title(SINGLETON_TITLES[type]).id(type).child(S.document().schemaType(type).documentId(type).title(SINGLETON_TITLES[type])),
			),
			S.divider(),
			S.documentTypeListItem("project").title("Projects"),
		]);
