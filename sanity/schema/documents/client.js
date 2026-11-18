import { defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";

export const client = defineType({
	name: "client",
	title: "Client",
	type: "document",
	icon: CaseIcon,
	fields: [
		defineField({
			name: "name",
			title: "Name",
			type: "string",
			description: "The company name as it is shown on project pages, for example \"Vaisesika Consulting Pvt. Ltd.\".",
			validation: (rule) => rule.required().error("Add the client's name."),
		}),
		defineField({
			name: "logo",
			title: "Logo",
			type: "imageWithAlt",
			description: "The logo for the Collaborators row. A transparent background looks best. Clients without a logo can still be named on projects.",
		}),
		defineField({
			name: "largeLogo",
			title: "Show the logo larger",
			type: "boolean",
			description: "Turn on for a logo that looks too small next to the others.",
			initialValue: false,
			hidden: ({ document }) => !document?.logo?.asset,
		}),
		defineField({
			name: "website",
			title: "Website (optional)",
			type: "url",
			description: "The client's own website, starting with https://",
			validation: (rule) => rule.uri({ scheme: ["http", "https"] }),
		}),
	],
	orderings: [{ title: "Name", name: "name", by: [{ field: "name", direction: "asc" }] }],
	preview: {
		select: { title: "name", media: "logo", website: "website" },
		prepare: ({ title, media, website }) => ({ title: title || "New client", subtitle: website?.replace(/^https?:\/\/(www\.)?/, ""), media: media?.asset ? media : CaseIcon }),
	},
});
