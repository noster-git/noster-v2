import { defineArrayMember, defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons/Images";

export const photos = defineType({
	name: "photos",
	title: "Photos",
	type: "object",
	icon: ImagesIcon,
	description: "Photos one after another, in two columns on wide screens, each at its own shape.",
	fields: [
		defineField({
			name: "photos",
			title: "Photos",
			type: "array",
			description: "Add photos and drag them to change the order they appear in.",
			of: [defineArrayMember({ type: "imageWithAlt" })],
			options: { layout: "grid" },
		}),
	],
	preview: {
		select: { photos: "photos", media: "photos.0" },
		prepare: ({ photos, media }) => ({ title: "Photos", subtitle: `${photos?.length || 0} photos`, media }),
	},
});
