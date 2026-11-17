import { defineField, defineType } from "sanity";
import { BlockElementIcon } from "@sanity/icons/BlockElement";

export const footer = defineType({
	name: "footer",
	title: "Footer",
	type: "document",
	icon: BlockElementIcon,
	fields: [
		defineField({
			name: "contactTitle",
			title: "Contact heading",
			type: "string",
			description: "The large heading over the contact details, for example \"Let's Build Together\". The email, phone numbers, offices and social links are edited in Settings.",
		}),
		defineField({
			name: "contactIntro",
			title: "Contact intro",
			type: "string",
			description: "The line above that heading, for example \"For new business inquiries contact us:\".",
		}),
		defineField({
			name: "socialsTitle",
			title: "Social links heading",
			type: "string",
			description: "The words above the social links, for example \"Follow us\".",
		}),
	],
	preview: { prepare: () => ({ title: "Footer" }) },
});
