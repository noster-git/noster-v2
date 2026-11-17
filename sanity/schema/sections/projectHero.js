import { defineField, defineType } from "sanity";

export const projectHero = defineType({
	name: "projectHero",
	title: "Project Hero",
	type: "object",
	description: "The opening of a project page: its name and a large photo.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "The project name and place, for example \"Villa Aurora, Goa\".",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "image",
			title: "Photo",
			type: "imageWithAlt",
			description: "The large photo at the top of the project page.",
			validation: (rule) => rule.required(),
		}),
	],
	preview: {
		select: { title: "title", media: "image" },
		prepare: ({ title, media }) => ({ title: title || "Project Hero", subtitle: "Project Hero", media }),
	},
});
