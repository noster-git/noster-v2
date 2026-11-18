import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { lineBreaks, safeHref } from "@/lib/content";

/**
 * A link in the text: next/link for a page on this site, a plain <a> (no referrer sent) elsewhere. An empty
 * address, or one a link may not go to (safeHref), leaves the words as plain text.
 */
function TextLink({ value, children }) {
	const href = safeHref(value?.href);
	if (!href) return children;
	if (/^\/(?![/\\])/.test(href)) return <Link href={href}>{children}</Link>;
	return (
		<a href={href} rel={/^https?:/i.test(href) ? "noreferrer" : undefined}>
			{children}
		</a>
	);
}

/**
 * Rich text from the CMS: paragraphs (<p>), headings (<h2>–<h5>), bullet and numbered lists (<ul>, <ol>,
 * <li>), bold, italic and links. A line break inside a paragraph renders as <br />. `components` styles
 * any of these; its marks are added to the link mark.
 *
 * @param {{ value: import("@portabletext/react").PortableTextProps["value"] | null | undefined, components?: import("@portabletext/react").PortableTextComponents }} props
 */
export default function RichText({ value, components }) {
	if (!value?.length) return null;
	return <PortableText value={lineBreaks(value)} components={{ ...components, marks: { link: TextLink, ...components?.marks } }} />;
}
