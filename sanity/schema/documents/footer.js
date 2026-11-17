import { defineArrayMember, defineField, defineType } from "sanity";

export const footer = defineType({
	name: "footer",
	title: "Footer",
	type: "document",
	fields: [
		defineField({
			name: "offices",
			title: "Offices",
			type: "array",
			description: "The offices shown at the bottom of every page. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "office",
					fields: [
						defineField({ name: "city", title: "City", type: "string", description: "The city the office is in." }),
						defineField({ name: "address", title: "Address", type: "text", rows: 3, description: "The street address. Press Enter to start a new line." }),
						defineField({ name: "phone", title: "Phone", type: "string", description: "The office phone number, as it should appear." }),
						defineField({ name: "directionsLink", title: "Directions link (optional)", type: "link", description: "A link to the office on a map. Leave empty if you do not want one." }),
					],
					preview: { select: { title: "city", subtitle: "address" } },
				}),
			],
		}),
		defineField({
			name: "socialsTitle",
			title: "Social links heading",
			type: "string",
			description: "The words above the social links, for example \"Follow us\".",
		}),
		defineField({
			name: "socials",
			title: "Social links",
			type: "array",
			description: "Links to your social media pages. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "social",
					fields: [
						defineField({ name: "label", title: "Label", type: "string", description: "The name shown for the link, for example \"Instagram\"." }),
						defineField({ name: "link", title: "Link", type: "link", description: "The address of the social media page." }),
					],
					preview: { select: { title: "label" } },
				}),
			],
		}),
	],
	preview: { prepare: () => ({ title: "Footer" }) },
});
