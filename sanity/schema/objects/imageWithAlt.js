import { defineField, defineType } from "sanity";

export const imageWithAlt = defineType({
	name: "imageWithAlt",
	title: "Image",
	type: "image",
	options: { hotspot: true },
	fields: [
		defineField({
			name: "alt",
			title: "Description of the photo",
			type: "string",
			description: "A short sentence describing what the photo shows. It is read aloud to people who can't see it and helps search engines. Leave empty to use the description set on the photo in the Media tab.",
		}),
	],
});
