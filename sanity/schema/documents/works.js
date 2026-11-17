import { defineField, defineType } from "sanity";

export const works = defineType({
	name: "works",
	title: "Works page",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "The heading at the top of the page with all projects, for example \"Our Works\".",
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			description: "How the Works page looks in Google results and in shared links.",
		}),
	],
	preview: { prepare: () => ({ title: "Works page" }) },
});
