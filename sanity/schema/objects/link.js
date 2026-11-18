import { defineField, defineType } from "sanity";
import { LinkIcon } from "@sanity/icons/Link";

/** The pages a link can open, one of each kind. */
export const PAGE_TYPES = ["home", "works", "privacyPolicy", "page"];

// Tabs, line breaks and other control characters: browsers drop some of them while reading an address.
const CONTROL = /[\u0000-\u001f\u007f]/;

/**
 * What is missing or wrong in a link, as the field to fix and a plain-words message, or null when it is
 * complete. Each kind needs its own field: a page, a project, a web address, a place on the page, a phone
 * number or an email address.
 *
 * @param {{ kind?: string, page?: { _ref?: string }, project?: { _ref?: string }, url?: string, anchor?: string, phone?: string, email?: string } | null | undefined} link
 * @returns {{ field: string, message: string } | null}
 */
export function linkProblem(link) {
	if (!link) return null;
	const problem = (field, message) => ({ field, message });
	switch (link.kind) {
		case "page":
			return link.page?._ref ? null : problem("page", "Choose the page this link opens.");
		case "project":
			return link.project?._ref ? null : problem("project", "Choose the project this link opens.");
		case "url": {
			const url = link.url?.trim();
			if (!url) return problem("url", "Add the web address this link opens.");
			if (CONTROL.test(link.url)) return problem("url", "Remove the tabs and line breaks from the address.");
			if (/\s/.test(url)) return problem("url", "Remove the spaces from the address.");
			return /^https?:\/\/[^/\\]/i.test(url) ? null : problem("url", "Start the address with https://");
		}
		case "anchor": {
			const anchor = link.anchor?.trim();
			if (!anchor) return problem("anchor", "Add the name of the place on the page, such as contact.");
			return /^#?[a-z][\w-]*$/i.test(anchor) ? null : problem("anchor", "Use letters, numbers and dashes only, such as contact.");
		}
		case "phone": {
			const phone = link.phone?.trim();
			if (!phone) return problem("phone", "Add the phone number to call.");
			return /^\+?[\d\s()-]{6,}$/.test(phone) && !CONTROL.test(link.phone) ? null : problem("phone", "Use digits only, with the country code, such as +91 88484 343 03.");
		}
		case "email": {
			const email = link.email?.trim();
			if (!email) return problem("email", "Add the email address to write to.");
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : problem("email", "This doesn't look like an email address.");
		}
		default:
			return problem("kind", "Choose where the link goes.");
	}
}

/** A field's validation: the link's problem when it is about this field. */
const checkField = (field) => (_value, context) => {
	const found = linkProblem(context.parent);
	return found?.field === field ? found.message : true;
};

const KINDS = [
	{ title: "A page", value: "page" },
	{ title: "A project", value: "project" },
	{ title: "A website", value: "url" },
	{ title: "A place on the page", value: "anchor" },
	{ title: "A phone number", value: "phone" },
	{ title: "An email address", value: "email" },
];

/**
 * Preview selections for a link at `path` (a field holding a link), for describeLink.
 *
 * @param {string} path
 */
export const LINK_PREVIEW = (path) => {
	const at = (field) => (path ? `${path}.${field}` : field);
	return {
		kind: at("kind"),
		page: at("page.title"),
		pageType: at("page._type"),
		project: at("project.name"),
		url: at("url"),
		anchor: at("anchor"),
		phone: at("phone"),
		email: at("email"),
	};
};

const PAGE_TITLES = { home: "Home", works: "Works", privacyPolicy: "Privacy policy" };

/**
 * A link's target in a few words, for previews: the page or project title, or the address.
 *
 * @param {{ kind?: string, page?: string, pageType?: string, project?: string, url?: string, anchor?: string, phone?: string, email?: string }} link
 */
export function describeLink({ kind, page, pageType, project, url, anchor, phone, email } = {}) {
	if (kind === "page") return page || PAGE_TITLES[pageType] ? `Page: ${page || PAGE_TITLES[pageType]}` : "A page";
	if (kind === "project") return project ? `Project: ${project}` : "A project";
	if (kind === "anchor") return anchor ? `#${anchor.replace(/^#/, "")}` : "A place on the page";
	if (kind === "phone") return phone || "A phone number";
	if (kind === "email") return email || "An email address";
	return url || "A website";
}

export const link = defineType({
	name: "link",
	title: "Link",
	type: "object",
	icon: LinkIcon,
	options: { collapsible: false },
	fields: [
		defineField({
			name: "kind",
			title: "Where does it go?",
			type: "string",
			description: "Choose what the link opens. Only the box for that choice is shown below.",
			options: { list: KINDS, layout: "radio", direction: "horizontal" },
			initialValue: "page",
			validation: (rule) => rule.custom(checkField("kind")),
		}),
		defineField({
			name: "page",
			title: "Page",
			type: "reference",
			to: PAGE_TYPES.map((type) => ({ type })),
			description: "The page on this site the link opens.",
			options: { disableNew: true },
			hidden: ({ parent }) => parent?.kind !== "page",
			validation: (rule) => rule.custom(checkField("page")),
		}),
		defineField({
			name: "project",
			title: "Project",
			type: "reference",
			to: [{ type: "project" }],
			description: "The project page the link opens.",
			options: { disableNew: true },
			hidden: ({ parent }) => parent?.kind !== "project",
			validation: (rule) => rule.custom(checkField("project")),
		}),
		defineField({
			name: "url",
			title: "Web address",
			type: "url",
			description: "The full address of another website, starting with https://",
			hidden: ({ parent }) => parent?.kind !== "url",
			validation: (rule) => [rule.uri({ scheme: ["http", "https"] }), rule.custom(checkField("url"))],
		}),
		defineField({
			name: "anchor",
			title: "Place on the page",
			type: "string",
			description: "The name of a place on the page the link scrolls to. contact is the contact details at the foot of every page.",
			hidden: ({ parent }) => parent?.kind !== "anchor",
			validation: (rule) => rule.custom(checkField("anchor")),
		}),
		defineField({
			name: "phone",
			title: "Phone number",
			type: "string",
			description: "The number to call, with the country code, for example +91 88484 343 03.",
			hidden: ({ parent }) => parent?.kind !== "phone",
			validation: (rule) => rule.custom(checkField("phone")),
		}),
		defineField({
			name: "email",
			title: "Email address",
			type: "string",
			description: "The address a new email is written to, for example info@noster.in.",
			hidden: ({ parent }) => parent?.kind !== "email",
			validation: (rule) => rule.custom(checkField("email")),
		}),
		defineField({
			name: "openInNewTab",
			title: "Open in a new tab",
			type: "boolean",
			description: "Turn on to keep this site open in the visitor's browser while the other website opens beside it.",
			initialValue: false,
			hidden: ({ parent }) => parent?.kind !== "url",
		}),
	],
	preview: {
		select: LINK_PREVIEW(""),
		prepare: (link) => ({ title: describeLink(link) }),
	},
});
