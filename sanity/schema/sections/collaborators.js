import { defineArrayMember, defineField, defineType } from "sanity";

export const collaborators = defineType({
	name: "collaborators",
	title: "Collaborators",
	type: "object",
	description: "A row of logos of the people and companies the studio works with.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "text",
			rows: 2,
			description: "The section heading, for example \"Our Collaborators\".",
		}),
		defineField({
			name: "logos",
			title: "Logos",
			type: "array",
			description: "Drag to change the order the logos appear in.",
			of: [
				defineArrayMember({
					type: "object",
					name: "logoItem",
					fields: [
						defineField({
							name: "logo",
							title: "Logo",
							type: "imageWithAlt",
							description: "The logo image. A transparent background looks best.",
						}),
						defineField({
							name: "large",
							title: "Show larger",
							type: "boolean",
							description: "Turn on for logos that look too small next to the others.",
							initialValue: false,
						}),
					],
					preview: {
						select: { title: "logo.alt", media: "logo" },
						prepare: ({ title, media }) => ({ title: title || "Logo", media }),
					},
				}),
			],
		}),
	],
	preview: {
		select: { title: "title", logos: "logos" },
		prepare: ({ title, logos }) => ({
			title: title || "Collaborators",
			subtitle: `Collaborators, ${logos?.length || 0} logos`,
			media: logos?.[0]?.logo,
		}),
	},
});
