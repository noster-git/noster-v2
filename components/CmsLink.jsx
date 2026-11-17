import Link from "next/link";
import { linkHref } from "@/lib/content";

/**
 * A link from the CMS: next/link for a page on this site (a chosen page, or a path such as "/works"), a
 * plain <a> for a place on the page ("#contact": Lenis glides to it, SmoothScroll) and for anything else
 * (another website, an email address, a phone number), which sends no referrer. A link set to open in a
 * new tab gets target="_blank". An empty or half-filled link, or one whose address isn't allowed (a script,
 * data; lib/content.js → safeHref), renders its children only, as plain text.
 *
 * @param {Omit<import("react").ComponentProps<"a">, "href"> & { link: import("@/lib/content").Link | null | undefined }} props
 */
export default function CmsLink({ link, children, ...rest }) {
	const href = linkHref(link);
	if (!href) return children ?? null;
	const target = link.openInNewTab ? "_blank" : undefined;

	if (/^\/(?![/\\])/.test(href)) {
		return (
			<Link href={href} target={target} {...rest}>
				{children}
			</Link>
		);
	}
	return (
		<a href={href} target={target} rel={href.startsWith("#") ? undefined : "noreferrer"} {...rest}>
			{children}
		</a>
	);
}
