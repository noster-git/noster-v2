import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons/Home";

export const office = defineType({
	name: "office",
	title: "Office",
	type: "document",
	icon: HomeIcon,
	fields: [
		defineField({
			name: "city",
			title: "City",
			type: "reference",
			to: [{ type: "city" }],
			description: "The city the office is in. Its name heads the office in the footer.",
			options: { disableNew: false },
			validation: (rule) => rule.required().error("Choose the city."),
		}),
		defineField({
			name: "address",
			title: "Address",
			type: "text",
			rows: 3,
			description: "The street address with its PIN code. Press Enter to start a new line.",
			validation: (rule) => rule.required().error("Add the address."),
		}),
		defineField({
			name: "phone",
			title: "Phone",
			type: "string",
			description: "The office phone number as it should appear, with the country code, for example +91 94964 343 03.",
			validation: (rule) => rule.regex(/^\+?[\d\s()-]{6,}$/, { name: "phone number" }).error("Use digits only, with the country code."),
		}),
		defineField({
			name: "mapUrl",
			title: "Map link (optional)",
			type: "url",
			description: "The office on Google Maps, for the \"View directions\" link. Copy the address from the map's Share button.",
			validation: (rule) => rule.uri({ scheme: ["https"] }),
		}),
	],
	preview: {
		select: { title: "city.name", subtitle: "address" },
		prepare: ({ title, subtitle }) => ({ title: title || "New office", subtitle: subtitle?.replace(/\s+/g, " ") }),
	},
});
