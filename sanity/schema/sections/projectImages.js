import { defineArrayMember, defineField, defineType } from "sanity";

export const projectImages = defineType({
	name: "projectImages",
	title: "Project Images",
	type: "object",
	description: "The main photos of the project, shown one after another on its page.",
	fields: [
		defineField({
			name: "photos",
			title: "Photos",
			type: "array",
			description: "Add photos and drag them to change the order they appear in.",
			of: [defineArrayMember({ type: "imageWithAlt" })],
		}),
	],
	preview: {
		select: { photos: "photos" },
		prepare: ({ photos }) => ({
			title: "Project Images",
			subtitle: `${photos?.length || 0} photos`,
			media: photos?.[0],
		}),
	},
});
