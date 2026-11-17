import { defineArrayMember, defineField, defineType } from "sanity";

export const contact = defineType({
	name: "contact",
	title: "Contact",
	type: "object",
	description: "An invitation to get in touch, with email addresses and phone numbers.",
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
			description: "A line above the contact details, for example \"For new business inquiries contact us:\".",
		}),
		defineField({
			name: "contacts",
			title: "Contacts",
			type: "array",
			description: "Each email address or phone number, one per line.",
			of: [
				defineArrayMember({
					type: "object",
					name: "contactItem",
					fields: [
						defineField({
							name: "value",
							title: "Email or phone",
							type: "string",
							description: "An email address or a phone number, exactly as it should appear.",
						}),
					],
					preview: { select: { title: "value" } },
				}),
			],
		}),
	],
	preview: {
		select: { title: "title" },
		prepare: ({ title }) => ({ title: title || "Contact", subtitle: "Contact" }),
	},
});
