import { defineField, defineType } from "sanity";

export const seo = defineType({
	name: "seo",
	title: "Search and sharing",
	type: "object",
	description: "How this page looks in Google results and when someone shares its link.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "The headline shown in Google results and in shared links. Keep it under about 60 characters.",
			validation: (rule) => rule.max(60).warning("Google may cut titles longer than 60 characters."),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 3,
			description: "A brief summary of the page shown under the title in Google results. Keep it under about 160 characters.",
			validation: (rule) => rule.max(160).warning("Google may cut descriptions longer than 160 characters."),
		}),
		defineField({
			name: "image",
			title: "Sharing image",
			type: "imageWithAlt",
			description: "The picture shown when the page's link is shared on social media or in messages.",
		}),
	],
});
