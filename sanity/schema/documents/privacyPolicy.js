import { defineField, defineType } from "sanity";

export const privacyPolicy = defineType({
	name: "privacyPolicy",
	title: "Privacy policy",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "The heading at the top of the page, for example \"Privacy Policy\".",
		}),
		defineField({
			name: "content",
			title: "Content",
			type: "blockContent",
			description: "The policy text. Use Section title for main headings, Subtitle and Topic for smaller ones, Lead line for a bold opening line, and the list buttons for bullets.",
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			description: "How the privacy policy looks in Google results and in shared links.",
		}),
	],
	preview: { prepare: () => ({ title: "Privacy policy" }) },
});
