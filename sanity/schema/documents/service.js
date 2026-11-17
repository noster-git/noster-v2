import { defineField, defineType } from "sanity";
import { WrenchIcon } from "@sanity/icons/Wrench";

export const service = defineType({
	name: "service",
	title: "Service",
	type: "document",
	icon: WrenchIcon,
	fields: [
		defineField({
			name: "title",
			title: "Name",
			type: "string",
			description: "A service the studio offers, for example \"Interior Design\" or \"Construction\".",
			validation: (rule) => rule.required().error("Add the service's name."),
		}),
	],
	orderings: [{ title: "Name", name: "title", by: [{ field: "title", direction: "asc" }] }],
	preview: { select: { title: "title" } },
});
