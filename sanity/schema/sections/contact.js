import { defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";

export const contact = defineType({
	name: "contact",
	title: "Contact",
	type: "object",
	icon: EnvelopeIcon,
	description: "An invitation to get in touch, with the email address and phone numbers from Site settings.",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "text",
			rows: 2,
			description: "The section heading, for example \"Let's Build Together\".",
		}),
		defineField({
			name: "intro",
			title: "Intro text",
			type: "string",
			description: "A line above the contact details, for example \"For new business inquiries contact us:\". The email and phone numbers themselves are edited in Site settings.",
		}),
	],
	preview: {
		select: { title: "title" },
		prepare: ({ title }) => ({ title: title?.replace(/\s+/g, " ") || "Contact", subtitle: "Contact" }),
	},
});
