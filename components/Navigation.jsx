import Link from "next/link";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { NAVIGATION } from "@/lib/sanity/queries";
import { linkHref } from "@/lib/content";
import { editor, item, scope } from "@/lib/sanity/edit";
import CmsLink from "./CmsLink";
import NosterLogo from "./NosterLogo";
import MobileCta from "./MobileCta";
import Ordered from "./Ordered";
import RollText from "./RollText";
import Arrow from "./Arrow";
import { TAG, BUTTON } from "@/lib/buttons";
import { editProps } from "@/lib/sanity/edit-props";

// Until links are set in the CMS, the nav shows these.
const DEFAULT_LINKS = [
	{ label: "Works", href: "/works" },
	{ label: "Contact", href: "#contact" }, // the footer
];

/**
 * Fixed top bar on the page grid: logo (columns 1–2), links (from column 3), CTA tag (right), and a 2px
 * scroll-progress line along the very top (globals.css → .scroll-progress).
 * Logo, links and the progress line: white with mix-blend-difference, so they invert over whatever is under them.
 * The CTA sits outside the blending: lime with black text, the one solid accent on every page.
 * Compact: logo and a Works link; the CTA moves to a button at the bottom of the screen (MobileCta).
 * The button (a CMS button: words and where it goes) shows its shorter phone words on phones when set.
 * In the studio's live preview each link opens its entry in the menu (words and where it goes) and can be
 * dragged to a new place; the button opens where it leads, its words their own field.
 */
export default async function Navigation() {
	// No navigation document (or no answer from the CMS): the default links and no CTA.
	const options = await fetchOptions();
	const nav = await fetchOrNull({ query: NAVIGATION, ...options }).catch(() => null);
	const { links, cta, mobileLabel } = nav ?? {};
	const edit = editor(nav, options.stega);
	const list = scope(edit, "links");
	const ctaLink = cta?.link;
	const hasCta = linkHref(ctaLink) && cta?.label;
	const phoneLabel = mobileLabel || cta?.label;
	const cmsLinks = (links ?? []).filter((entry) => linkHref(entry.link));
	// Compact: the menu's link to the Works page (the default one until there is one).
	const works = cmsLinks.find((entry) => linkHref(entry.link) === "/works");
	// --hit-h: the bar's items sit about 20px from the top of the screen, so a 44px touch area centred on them
	// would lose its top few pixels off the screen; 52px keeps a full 44px on it (globals.css → hit).
	const linkClass = "motion-host hit flex [--hit-h:52px] focus-visible:outline-white";

	return (
		<>
			<div aria-hidden="true" className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px] bg-white mix-blend-difference" />
			<nav className="grid-site fixed inset-x-0 top-0 z-50 items-center px-m pt-[12px] pb-g text-white mix-blend-difference">
				<div className="col-span-2">
					{/* Focus rings white: the nav is mix-blend-difference, where a black ring vanishes. */}
					<Link href="/" aria-label="Noster home" data-intro className="hit flex [--hit-h:52px] focus-visible:outline-white">
						<NosterLogo className="h-[13px] w-auto desk:h-[15px]" />
					</Link>
				</div>

				{/* Compact: the links row is hidden, so Works stays one tap away at the right of the bar. */}
				<div className="col-span-3 flex justify-end desk:hidden">
					<Link
						href="/works"
						data-intro
						// Live preview: opens the Works entry. Not dragged: the desk menu holds the same entry in its order.
						{...(works && list.doc && { ...editProps(list(item(works._key))), "data-sanity-drag-disable": "true" })}
						className={linkClass}
					>
						<RollText>{works?.label || "Works"}</RollText>
					</Link>
				</div>

				<ul className="hidden gap-[14px] desk:col-span-5 desk:flex" {...editProps(cmsLinks.length ? list() : undefined)}>
					{cmsLinks.length ? (
						<Ordered
							edit={list}
							items={cmsLinks.map((entry) => ({
								key: entry._key,
								node: (
									<li key={entry._key} data-intro>
										<CmsLink link={entry.link} {...editProps(list(item(entry._key)))} className={linkClass}>
											<RollText>{entry.label}</RollText>
										</CmsLink>
									</li>
								),
							}))}
						/>
					) : (
						DEFAULT_LINKS.map((entry) => {
							// In-page anchors are plain links: Lenis glides to them (SmoothScroll: anchors).
							const A = entry.href.startsWith("#") ? "a" : Link;
							return (
								<li key={entry.href} data-intro>
									<A href={entry.href} className={linkClass}>
										<RollText>{entry.label}</RollText>
									</A>
								</li>
							);
						})
					)}
				</ul>
			</nav>

			{/* The CTA sits outside the blended nav, so it keeps its lime; same spot as the nav row. */}
			{hasCta && (
				<div className="fixed top-0 right-0 z-50 hidden px-m pt-[8px] desk:block">
					<CmsLink
						link={ctaLink}
						data-intro
						{...editProps(edit(["cta", "link"]))}
						className={`${TAG} hit flex [--hit-h:52px] transition-[scale] duration-150 ease-out active:scale-[0.97]`}
					>
						<RollText edit={edit(["cta", "label"])}>{cta.label}</RollText>
						<Arrow />
					</CmsLink>
				</div>
			)}

			{hasCta && (
				<MobileCta>
					{/* data-intro="up": at the foot of the screen it rises in, where the header items drop in. A label
					    too long for the screen ends in an ellipsis rather than running off its edges. */}
					<CmsLink
						link={ctaLink}
						data-intro="up"
						{...editProps(edit(["cta", "link"]))}
						className={`${BUTTON} flex max-w-[calc(100vw-24px)] whitespace-nowrap transition-[scale] duration-150 ease-out active:scale-[0.97]`}
					>
						<RollText truncate edit={edit(mobileLabel ? "mobileLabel" : ["cta", "label"])}>
							{phoneLabel}
						</RollText>
						<Arrow />
					</CmsLink>
				</MobileCta>
			)}
		</>
	);
}
