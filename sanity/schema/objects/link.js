import { defineField, defineType } from "sanity";

/** An internal link needs a page, an external link needs a web address. Returns true or a plain-words message. */
export const checkLinkTarget = (value) => {
	if (!value) return true;
	if (value.kind === "external") return value.url ? true : "Add the web address this link opens.";
	return value.reference ? true : "Choose the page this link opens.";
};

export const link = defineType({
	name: "link",
	title: "Link",
	type: "object",
	fields: [
		defineField({
			name: "kind",
			title: "Where does it go?",
			type: "string",
			description: "Choose a page on this site, or a web address somewhere else.",
			options: {
				list: [
					{ title: "A page on this site", value: "internal" },
					{ title: "Another website", value: "external" },
				],
				layout: "radio",
			},
			initialValue: "internal",
		}),
		defineField({
			name: "reference",
			title: "Page",
			type: "reference",
			to: [{ type: "project" }, { type: "home" }, { type: "works" }, { type: "privacyPolicy" }],
			description: "The page on this site the link opens.",
			hidden: ({ parent }) => parent?.kind === "external",
		}),
		defineField({
			name: "url",
			title: "Web address",
			type: "url",
			description: "The full address, starting with https:// (or mailto: or tel: for an email or phone number).",
			validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto", "tel"] }),
			hidden: ({ parent }) => parent?.kind !== "external",
		}),
		defineField({
			name: "openInNewTab",
			title: "Open in a new tab",
			type: "boolean",
			description: "Turn on to keep the site open in the visitor's browser while the link opens beside it.",
			initialValue: false,
		}),
	],
	validation: (rule) => rule.custom(checkLinkTarget),
	preview: {
		select: { kind: "kind", url: "url", ref: "reference.title" },
		prepare: ({ kind, url, ref }) => ({ title: kind === "external" ? url || "Another website" : ref || "A page on this site" }),
	},
});
