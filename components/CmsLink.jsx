import Link from "next/link";
import { isInternal, linkHref } from "@/lib/content";

/**
 * A link from the CMS: next/link for a page on this site, a plain <a> for anything else (another website,
 * an email address, a phone number), which sends no referrer. A link set to open in a new tab gets
 * target="_blank". An empty or half-filled link renders its children only.
 *
 * @param {Omit<import("react").ComponentProps<"a">, "href"> & { link: import("@/lib/content").Link | null | undefined }} props
 */
export default function CmsLink({ link, children, ...rest }) {
	const href = linkHref(link);
	if (!href) return children ?? null;
	const target = link.openInNewTab ? "_blank" : undefined;

	if (isInternal(link)) {
		return (
			<Link href={href} target={target} {...rest}>
				{children}
			</Link>
		);
	}
	return (
		<a href={href} target={target} rel="noreferrer" {...rest}>
			{children}
		</a>
	);
}
