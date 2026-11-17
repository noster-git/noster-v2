import { defineField, defineType } from "sanity";
import { DocumentIcon } from "@sanity/icons/Document";
import { PAGE_SECTIONS, sectionsField } from "../sections/index.js";
import { CONTENT, SEO } from "./groups.js";

/** Web address endings the site already uses for its own pages and files. */
export const RESERVED_SLUGS = [
	"works",
	"privacy_policy",
	"style-guide",
	"studio",
	"studio-sections",
	"api",
	"sitemap.xml",
	"robots.txt",
	"llms.txt",
	"manifest.webmanifest",
	"_next",
	"favicon.ico",
];

/**
 * A page's web address ending: lower-case letters, digits and dashes, and not one the site already uses.
 * True or a plain-words message.
 *
 * @param {{ current?: string } | undefined} slug
 */
export function checkPageSlug(slug) {
	const value = slug?.current;
	if (!value) return "Click Generate to make the web address.";
	if (/[/\\]/.test(value)) return "Use words joined by dashes, with no slashes.";
	if (RESERVED_SLUGS.includes(value.toLowerCase())) return `"${value}" is already used by the site. Choose another.`;
	if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return "Use lower-case letters, numbers and dashes only, for example \"about-us\".";
	return true;
}

/** A title as a web address ending: "About Us!" → "about-us". */
export const slugify = (input) =>
	input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 64);

export const page = defineType({
	name: "page",
	title: "Page",
	type: "document",
	icon: DocumentIcon,
	groups: [CONTENT, SEO],
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			group: "content",
			description: "The page's name: its heading when it doesn't open with a Hero, and its title in Google results unless one is set under Search & sharing.",
			validation: (rule) => rule.required().error("Add the page's title."),
		}),
		defineField({
			name: "slug",
			title: "Web address ending",
			type: "slug",
			group: "content",
			description: "Where the page is on the site: \"about\" makes noster.in/about. Click Generate to make it from the title.",
			options: { source: "title", maxLength: 64, slugify },
			validation: (rule) => rule.custom(checkPageSlug),
		}),
		sectionsField({
			of: PAGE_SECTIONS,
			group: "content",
			description: "The page is built from these blocks, top to bottom. Add one, or drag to reorder.",
		}),
		defineField({
			name: "seo",
			title: "Search and sharing",
			type: "seo",
			group: "seo",
			description: "How the page looks in Google results and in shared links.",
		}),
	],
	preview: {
		select: { title: "title", slug: "slug.current", media: "seo.image" },
		prepare: ({ title, slug, media }) => ({ title: title || "New page", subtitle: slug ? `/${slug}` : undefined, media }),
	},
});
