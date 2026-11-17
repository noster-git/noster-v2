import { defineField, defineType } from "sanity";

export const ourApproach = defineType({
	name: "ourApproach",
	title: "Our Approach",
	type: "object",
	description: "A short statement about how the studio works.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "text",
			rows: 2,
			description: "The section heading, for example \"Our Approach\".",
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
			rows: 5,
			description: "A few sentences about the studio. Press Enter to start a new line.",
		}),
	],
	preview: {
		select: { title: "title" },
		prepare: ({ title }) => ({ title: title || "Our Approach", subtitle: "Our Approach" }),
	},
});
