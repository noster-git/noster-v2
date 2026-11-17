import { defineArrayMember, defineField, defineType } from "sanity";

export const navigation = defineType({
	name: "navigation",
	title: "Navigation",
	type: "document",
	fields: [
		defineField({
			name: "links",
			title: "Links",
			type: "array",
			description: "The links in the menu at the top of every page. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "navLink",
					fields: [
						defineField({ name: "label", title: "Label", type: "string", description: "The words shown in the menu." }),
						defineField({ name: "link", title: "Link", type: "link", description: "Where the menu item leads." }),
					],
					preview: { select: { title: "label" } },
				}),
			],
		}),
		defineField({
			name: "ctaLabel",
			title: "Button label",
			type: "string",
			description: "The words on the highlighted button in the menu, for example \"Contact us\".",
		}),
		defineField({
			name: "ctaLink",
			title: "Button link",
			type: "link",
			description: "Where the highlighted button leads.",
		}),
		defineField({
			name: "mobileCtaLabel",
			title: "Button label on phones",
			type: "string",
			description: "A shorter version of the button words, used on small screens.",
		}),
	],
	preview: { prepare: () => ({ title: "Navigation" }) },
});
