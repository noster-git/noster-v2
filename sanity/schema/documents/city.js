import { defineField, defineType } from "sanity";
import { PinIcon } from "@sanity/icons/Pin";

export const city = defineType({
	name: "city",
	title: "City",
	type: "document",
	icon: PinIcon,
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			description: "The city as it is written on the site, for example \"Trivandrum\".",
			validation: (rule) => rule.required().error("Add the city's name."),
		}),
		defineField({
			name: "state",
			title: "State",
			type: "string",
			description: "The state the city is in, for example \"Kerala\". Shown after the city on project pages.",
		}),
	],
	orderings: [{ title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] }],
	preview: { select: { title: "name", subtitle: "state" } },
});
