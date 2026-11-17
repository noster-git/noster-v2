import { stegaClean } from "next-sanity";
import { excerpt } from "./site.js";

/**
 * @typedef {{ kind?: "internal" | "external" | null, href?: string | null, openInNewTab?: boolean | null }} Link
 * A link as the queries return it (lib/sanity/queries.js): an internal link's page is already resolved to
 * its path ("/", "/works", "/privacy_policy", "/works/<slug>").
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
 * Where a link goes, or null for an empty or half-filled link (no page or no web address picked) or one
 * whose address isn't allowed (safeHref): those render as plain text.
 *
 * @param {Link | null | undefined} link
 * @returns {string | null}
 */
export function linkHref(link) {
	return safeHref(link?.href);
}

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
 * Project name, location and meta description, with fallbacks so no project page goes out blank:
 * name from the hero title (or the search title, or the slug), description from the search description or
 * the brief text, location from the brief's Location detail on one line without the state
 * ("Technopark, Trivandrum, Kerala" → "Technopark, Trivandrum").
 * The values are compared and trimmed, so they are read without the click-to-edit markers draft mode adds.
 * `locationPath`: where the location is edited (the brief's Location detail), as a field path.
 *
 * @param {{ slug: string, sections?: Array<any> | null, seo?: { title?: string | null, description?: string | null } | null }} project
 * @returns {{ name: string, location: string | undefined, locationPath: Array<string | { _key: string }> | undefined, description: string | undefined }}
 */
export function describeProject(project) {
	const sections = project.sections ?? [];
	const section = (type) => sections.find((s) => stegaClean(s._type) === type);
	const heroTitle = stegaClean(section("projectHero")?.title);
	const brief = section("projectBrief");
	const seo = stegaClean(project.seo);
	const name =
		heroTitle?.replace(/\s+/g, " ").trim() ||
		seo?.title?.split("|")[0].trim() ||
		stegaClean(project.slug).replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	const detail = brief?.details?.find((d) => stegaClean(d.label)?.trim().toLowerCase() === "location");
	const location = stegaClean(detail?.value)
		?.replace(/\s+/g, " ")
		.replace(/,?\s*(Kerala|Telangana|India)\s*$/i, "")
		.trim();
	const locationPath = location ? ["sections", { _key: brief._key }, "details", { _key: detail._key }, "value"] : undefined;
	return { name, location, locationPath, description: seo?.description || excerpt(stegaClean(plainText(brief?.description))) || undefined };
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
