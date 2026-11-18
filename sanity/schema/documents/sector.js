import { defineField, defineType } from "sanity";
import { TagIcon } from "@sanity/icons/Tag";

export const sector = defineType({
	name: "sector",
	title: "Sector",
	type: "document",
	icon: TagIcon,
	fields: [
		defineField({
			name: "title",
			title: "Name",
			type: "string",
			description: "The client's line of business, for example \"Technology\" or \"IT Services\".",
			validation: (rule) => rule.required().error("Add the sector's name."),
		}),
		defineField({
			name: "slug",
			title: "Short name",
			type: "slug",
			description: "The name in lower case for web addresses, for example \"it-services\". Click Generate to make it from the name.",
			options: { source: "title", maxLength: 64 },
			validation: (rule) => rule.required().error("Click Generate to make the short name."),
		}),
	],
	orderings: [{ title: "Name", name: "title", by: [{ field: "title", direction: "asc" }] }],
	preview: { select: { title: "title" } },
});
