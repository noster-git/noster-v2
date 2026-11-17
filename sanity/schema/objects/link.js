import { defineField, defineType } from "sanity";

/** An internal link needs a page, an external link needs a web address. Returns true or a plain-words message. */
export const checkLinkTarget = (value) => {
	if (!value) return true;
	if (value.kind === "external") return value.url ? true : "Add the web address this link opens.";
	return value.reference ? true : "Choose the page this link opens.";
};

/**
 * A web address the site can open: a full address (https://, mailto:, tel:), a page path on this site
 * starting with "/" ("/works"), or a place on the page starting with "#" ("#contact"). True or a message.
 *
 * @param {string | undefined} url
 */
export const checkAddress = (url) => {
	if (!url) return true;
	if (/[\u0000-\u001f\u007f]/.test(url)) return "Remove the tabs and line breaks from the address.";
	if (/\s/.test(url.trim())) return "Remove the spaces from the address.";
	if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return true;
	if (/^#[^#]+$/.test(url)) return true;
	if (/^\/(?![/\\])/.test(url)) return true;
	return "Start with https:// for a website, mailto: for an email, tel: for a phone number, / for a page on this site, or # for a place on the page.";
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
			description: "Choose a page on this site, or type an address: another website, an email, a phone number, or a place on the page.",
			options: {
				list: [
					{ title: "A page on this site", value: "internal" },
					{ title: "An address I type", value: "external" },
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
			title: "Address",
			type: "url",
			description:
				"Another website: the full address, starting with https://. An email: mailto: then the address. A phone number: tel: then the number. A page on this site: its path, such as /works. A place on the page: # and its name, such as #contact (the contact details at the foot of every page).",
			validation: (rule) => [
				rule.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
				rule.custom(checkAddress),
			],
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
		prepare: ({ kind, url, ref }) => ({ title: kind === "external" ? url || "An address" : ref || "A page on this site" }),
	},
});
