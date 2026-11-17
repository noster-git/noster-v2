import { defineArrayMember, defineField, defineType } from "sanity";

export const home = defineType({
	name: "home",
	title: "Home page",
	type: "document",
	fields: [
		defineField({
			name: "sections",
			title: "Sections",
			type: "array",
			description: "The home page is built from these blocks, top to bottom. Drag to reorder, or add a new one.",
			of: ["hero", "ourApproach", "collaborators", "featuredWorks", "contact"].map((type) => defineArrayMember({ type })),
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			description: "How the home page looks in Google results and in shared links.",
		}),
	],
	preview: { prepare: () => ({ title: "Home page" }) },
});
