import Link from "next/link";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { FOOTER } from "@/lib/sanity/queries";
import { linkHref } from "@/lib/content";
import { editor, item, scope } from "@/lib/sanity/edit";
import CmsLink from "./CmsLink";
import Ordered from "./Ordered";
import RollText from "./RollText";
import Arrow from "./Arrow";
import FooterSubscribe from "./FooterSubscribe";
import FooterMotion from "./FooterMotion";
import { NEWSLETTER, SITE_NAME } from "@/lib/site";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * The Footer document, with the "Let's Build Together" contact edited in the Contact section on the home
 * page (the home page doesn't render that section: it is rendered here, on every page). Null when there is
 * no footer or the CMS can't be read: pages then go without a footer.
 *
 * @param {import("@/lib/sanity/live").FetchOptions} options
 */
export function getFooter(options) {
	return fetchOrNull({ query: FOOTER, ...options }).catch(() => null);
}

/**
 * The contact block's title, intro and links (mailto: and tel:), each with its key. Values are read without
 * the click-to-edit markers, so the links' addresses stay clean.
 *
 * @param {{ title?: string | null, intro?: string | null, contacts?: Array<{ _key: string, value?: string | null }> | null } | null | undefined} contact
 */
function toContact(contact) {
	if (!contact) return null;
	return {
		title: contact.title,
		intro: contact.intro,
		contacts: (contact.contacts ?? [])
			.map((c) => ({ key: c._key, value: stegaClean(c.value)?.trim() }))
			.filter((c) => c.value)
			.map(({ key, value }) => ({ key, value, href: value.includes("@") ? `mailto:${value}` : `tel:${value.replace(/\s+/g, "")}` })),
	};
}

/** A 1px rule that draws in left → right with the footer's entrance (FooterMotion). */
function Rule() {
	return <div data-rule aria-hidden="true" className="h-px bg-current" />;
}

// A footer link: underline-free, rolls on hover, "↳" in front like every link list on the site.
// At least 24px tall with a mouse and 44px on touch, so the stacked links stay easy to hit without overlapping.
const LINK = "motion-host inline-flex min-h-[24px] pointer-coarse:min-h-[44px] items-center gap-icon before:content-['↳'] transition-opacity duration-200 hover:opacity-60";

/**
 * Site footer. Lime with black type: the NOSTER wordmark across the full width, then two sides under a rule:
 * - left (cols 1–6): "Let's Build Together", with the business-inquiries line and email / phones at its foot;
 * - right (cols 8–10; 7–10 below 1181px): socials, newsletter sign-up (when NEWSLETTER is on), offices,
 *   then rights and copyright.
 * Both sides stretch to the same height, so the left's contacts line up with the credits.
 * Fixed, compact gaps: the footer is as tall as its content, which fits one screen on desk; nothing
 * stretches to fill the window, so tall windows get no gaps. Compact layouts stack the two sides.
 * Entrance animation: components/FooterMotion.jsx.
 * In the studio's live preview each contact, social link and office opens its entry and can be dragged to
 * a new place; an office's phone and directions link open their own fields.
 */
/**
 * The current year for the copyright line. The clock can only be read inside a cached scope when pages
 * are prerendered; refreshed daily, so the line moves on by itself on 1 January.
 */
async function currentYear() {
	"use cache";
	cacheLife("days");
	return new Date().getFullYear();
}

export default async function Footer() {
	const options = await fetchOptions();
	const [footer, year] = await Promise.all([getFooter(options), currentYear()]);
	if (!footer) return null;
	const { offices, socialsTitle, socials } = footer;
	const contact = toContact(footer.contact);
	const edit = editor(footer, options.stega);
	// The contact block is edited in Home's Contact section.
	const contactSection = scope(editor({ _id: "home", _type: "home" }, options.stega), ["sections", item(footer.contact?._key)]);
	const contacts = scope(contactSection, "contacts");
	const socialList = scope(edit, "socials");
	const officeList = scope(edit, "offices");

	return (
		<FooterMotion className="relative flex flex-col bg-lime p-m text-black">
			{/* Wordmark in its own mask so it can rise into place */}
			<div className="overflow-hidden">
				<Image data-footer-mark src="/noster-logo.svg" alt="Noster Associates" width={3252} height={574} unoptimized className="h-auto w-full" />
			</div>

			<div className="mt-6 flex flex-col gap-6 desk:mt-3 desk:grid-site desk:gap-y-0">
				{/* Let's Build Together */}
				{contact && (
					<div
						className="flex flex-col justify-between gap-4 desk:col-span-6"
						// Live preview: opens Home's Contact section. Not dragged: it always shows here, in the footer.
						{...(contactSection.doc && { ...editProps(contactSection()), "data-sanity-drag-disable": "true" })}
					>
						{/* Top: the rule, the intro as a small eyebrow, then the title */}
						<div>
							<Rule />
							{contact.intro && (
								<p data-fade className="pt-rule">
									{contact.intro}
								</p>
							)}
							{/* Display size, shrinking with the window on desk so the usual title fits one line across the 6
							    columns; a longer one wraps rather than running into the right column */}
							<h2 data-split className="mt-1 text-display text-balance py-[0.08em] desk:text-[min(var(--t-display),7.2vw)]">
								{contact.title}
							</h2>
						</div>
						{/* Foot: one ruled row per contact across the full width; labels in the first two of six
						    columns, values left-aligned from the third, so both sit on the grid */}
						<ul data-fade className="border-b border-current" {...editProps(contacts())}>
							<Ordered
								edit={contacts}
								items={contact.contacts.map((c) => ({
									key: c.key,
									node: (
										<li key={c.key} className="border-t border-current">
											<a
												href={c.href}
												{...editProps(contacts(item(c.key)))}
												className="grid grid-cols-6 items-baseline gap-x-g py-[0.35em] pointer-coarse:min-h-[44px] pointer-coarse:content-center transition-opacity duration-200 hover:opacity-60"
											>
												<span className="col-span-2">{c.href.startsWith("mailto:") ? "Email" : "Phone"}</span>
												<span className="col-span-4 min-w-0 text-lead [overflow-wrap:anywhere]">{c.value}</span>
											</a>
										</li>
									),
								}))}
							/>
						</ul>
					</div>
				)}

				{/* Right column: fixed gaps; the credits sit at its foot, level with the last contact row. Four
				    columns on tablets and small laptops so the addresses don't wrap into short lines, three from 1181px. */}
				<div className="flex flex-col gap-3 desk:col-span-4 desk:col-start-7 desk:pl-m board:col-span-3 board:col-start-8 board:pl-0">
					{/* Socials */}
					<div>
						<Rule />
						<div data-fade className="pt-rule">
							{socialsTitle && <p>{socialsTitle}</p>}
							<ul {...editProps(socialList())}>
								<Ordered
									edit={socialList}
									items={(socials ?? [])
										.filter((s) => linkHref(s.link))
										.map((s) => ({
											key: s._key,
											node: (
												<li key={s._key}>
													<CmsLink link={s.link} {...editProps(socialList(item(s._key)))} className={LINK}>
														<RollText>{s.label}</RollText>
													</CmsLink>
												</li>
											),
										}))}
								/>
							</ul>
						</div>
					</div>

					{NEWSLETTER && (
						<div data-fade>
							<FooterSubscribe />
						</div>
					)}

					{/* Offices */}
					<div>
						<Rule />
						<div data-fade className="grid grid-cols-2 gap-x-g gap-y-2 pt-rule" {...editProps(officeList())}>
							<Ordered
								edit={officeList}
								items={(offices ?? []).map((office) => {
									const at = scope(officeList, item(office._key));
									const city = stegaClean(office.city);
									const phone = stegaClean(office.phone);
									return {
										key: office._key,
										node: (
											<div key={office._key} {...editProps(at())}>
												<p>{city}</p>
												<p className="whitespace-pre-line">{stegaClean(office.address)}</p>
												{linkHref(office.directionsLink) && (
													<CmsLink
														link={office.directionsLink}
														aria-label={`View directions to the ${city} office`}
														{...editProps(at("directionsLink"))}
														className={LINK}
													>
														<RollText>View directions</RollText>
														<Arrow />
													</CmsLink>
												)}
												{phone && (
													<p>
														<a href={`tel:${phone.replace(/\s+/g, "")}`} {...editProps(at("phone"))} className={LINK}>
															<RollText>{phone}</RollText>
														</a>{" "}
														(Sales)
													</p>
												)}
											</div>
										),
									};
								})}
							/>
						</div>
					</div>

					{/* Credits, at the foot of the column */}
					<div data-fade className="flex items-end justify-between gap-g desk:mt-auto desk:pt-2">
						<div>
							<p>All rights reserved</p>
							<Link href="/privacy_policy" className={LINK}>
								<RollText>Privacy Policy</RollText>
							</Link>
						</div>
						<p className="inline-flex min-h-[24px] items-center text-right pointer-coarse:min-h-[44px]">
							© {year} {SITE_NAME}
						</p>
					</div>
				</div>
			</div>
		</FooterMotion>
	);
}
