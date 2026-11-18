import { stegaClean } from "next-sanity";
import { excerpt } from "./site.js";
import { locationText, projectFacts } from "./project-facts.js";

/**
 * @typedef {{
 *   kind?: "page" | "project" | "url" | "anchor" | "phone" | "email" | null,
 *   path?: string | null,
 *   url?: string | null,
 *   anchor?: string | null,
 *   phone?: string | null,
 *   email?: string | null,
 *   openInNewTab?: boolean | null,
 * }} Link
 * A link as the queries return it (lib/sanity/queries.js): its kind and target, a chosen page or project
 * already resolved to its path ("/", "/works", "/works/<slug>", "/<page>").
 */

// The addresses a link from the CMS may go to: a web page (http, https), an email address (mailto:), a phone
// number (tel:), a page on this site ("/works", but not "//host" or "/\host", which browsers read as another
// site) or a place on the page ("#contact"). Anything else (javascript:, data: and the like) is not a link.
const ALLOWED_HREF = /^(?:https?:\/\/|mailto:|tel:|\/(?![/\\])|#)/i;
// Control characters (tabs, line breaks and the like) anywhere in it: browsers drop some of them while reading
// an address, so "/<tab>/host" would open another site. Plain spaces stay allowed (phone numbers).
const CONTROL = /[\u0000-\u001f\u007f]/;

/**
 * The address, trimmed, when it is one a link may go to (ALLOWED_HREF, no control characters), else null.
 *
 * @param {string | null | undefined} href
 * @returns {string | null}
 */
export function safeHref(href) {
	const value = stegaClean(href)?.trim();
	return value && !CONTROL.test(value) && ALLOWED_HREF.test(value) ? value : null;
}

/**
 * A phone number as a tel: address: digits and a leading +, spaces and punctuation dropped.
 *
 * @param {string | null | undefined} phone
 */
export function telHref(phone) {
	const digits = stegaClean(phone)?.replace(/[^\d+]/g, "");
	return digits ? `tel:${digits}` : null;
}

/**
 * Where a link goes, or null for an empty or half-filled link (its page, project or address not filled in)
 * or one whose address isn't allowed (safeHref): those render as plain text.
 *
 * @param {Link | null | undefined} link
 * @returns {string | null}
 */
export function linkHref(link) {
	switch (stegaClean(link?.kind)) {
		case "page":
		case "project":
			return safeHref(link.path);
		case "url":
			return /^https?:\/\//i.test(stegaClean(link.url)?.trim() ?? "") ? safeHref(link.url) : null;
		case "anchor": {
			const anchor = stegaClean(link.anchor)?.trim().replace(/^#/, "");
			return anchor ? safeHref(`#${anchor}`) : null;
		}
		case "phone":
			return safeHref(telHref(link.phone));
		case "email": {
			const email = stegaClean(link.email)?.trim();
			return email && /^[^\s@]+@[^\s@]+$/.test(email) ? safeHref(`mailto:${email}`) : null;
		}
		default:
			return null;
	}
}

/**
 * Whether a link opens in a new tab: only a link to another website can.
 *
 * @param {Link | null | undefined} link
 */
export const opensNewTab = (link) => stegaClean(link?.kind) === "url" && Boolean(link.openInNewTab);

/**
 * Rich text as plain text: each block's text, one block per line. A plain string comes back as it is.
 *
 * @param {Array<{ _type: string, children?: Array<{ text?: string }> }> | string | null | undefined} blocks
 */
export function plainText(blocks) {
	if (typeof blocks === "string") return blocks;
	return (blocks ?? [])
		.filter((block) => block._type === "block")
		.map((block) => (block.children ?? []).map((child) => child.text ?? "").join(""))
		.join("\n");
}

/**
 * A project's name, its place for the hero ("Infopark, Kochi": the area and city, without the state), its
 * facts and its meta description, read without the click-to-edit markers draft mode adds. The name falls
 * back to the search title, then to the web address ending; the description to the project's text.
 *
 * @param {{ slug: string, name?: string | null, summary?: Array<any> | null, seo?: { title?: string | null, description?: string | null } | null } & import("./project-facts.js").ProjectDetails} project
 */
export function describeProject(project) {
	const clean = stegaClean(project);
	const seo = clean.seo;
	const name =
		clean.name?.replace(/\s+/g, " ").trim() ||
		seo?.title?.split("|")[0].trim() ||
		clean.slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	return {
		name,
		location: locationText(clean, { oneLine: true, withState: false }) || undefined,
		facts: projectFacts(clean),
		description: seo?.description || excerpt(plainText(clean.summary)) || undefined,
	};
}

/**
 * Rich text with each line break typed inside a paragraph (Shift+Enter) in a span of its own, which
 * renders as <br />. Spans without one are passed through unchanged.
 *
 * @template {Array<any> | null | undefined} T
 * @param {T} blocks
 * @returns {T}
 */
export function lineBreaks(blocks) {
	if (!blocks) return blocks;
	return /** @type {T} */ (
		blocks.map((block) => {
			if (block._type !== "block" || !block.children?.some((c) => c.text?.includes("\n"))) return block;
			const children = block.children.flatMap((span) => {
				if (!span.text?.includes("\n")) return [span];
				return span.text.split("\n").flatMap((text, i) => [
					...(i ? [{ ...span, _key: `${span._key}-br${i}`, text: "\n" }] : []),
					...(text ? [{ ...span, _key: i ? `${span._key}-${i}` : span._key, text }] : []),
				]);
			});
			return { ...block, children };
		})
	);
}
