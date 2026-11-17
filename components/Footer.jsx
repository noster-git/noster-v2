import Link from "next/link";
import Image from "next/image";
import { cacheLife } from "next/cache";
import { stegaClean } from "next-sanity";
import { fetchOptions, fetchOrNull } from "@/lib/sanity/live";
import { FOOTER } from "@/lib/sanity/queries";
import { safeHref, telHref } from "@/lib/content";
import { editor, item, scope } from "@/lib/sanity/edit";
import ContactRows from "./ContactRows";
import Ordered from "./Ordered";
import RollText from "./RollText";
import Arrow from "./Arrow";
import FooterSubscribe from "./FooterSubscribe";
import FooterMotion from "./FooterMotion";
import { NEWSLETTER, SITE_NAME } from "@/lib/site";
import { editProps } from "@/lib/sanity/edit-props";

/**
 * The Footer document's words and the Site settings it shows: `{ footer, settings }`. Null when there is no
 * footer or the CMS can't be read: pages then go without a footer.
 *
 * @param {import("@/lib/sanity/live").FetchOptions} options
 * @returns {Promise<{ footer: any, settings: import("@/lib/settings").Settings | null } | null>}
 */
export function getFooter(options) {
	return fetchOrNull({ query: FOOTER, ...options })
		.then((data) => (data?.footer ? data : null))
		.catch(() => null);
}

/** A 1px rule that draws in left → right with the footer's entrance (FooterMotion). */
function Rule() {
	return <div data-rule aria-hidden="true" className="h-px bg-current" />;
}

// A footer link: underline-free, rolls on hover, "↳" in front like every link list on the site.
// At least 24px tall with a mouse and 44px on touch, so the stacked links stay easy to hit without overlapping.
const LINK = "motion-host inline-flex min-h-[24px] pointer-coarse:min-h-[44px] items-center gap-icon before:content-['↳'] transition-opacity duration-200 hover:opacity-60";

/**
 * The current year for the copyright line. The clock can only be read inside a cached scope when pages
 * are prerendered; refreshed daily, so the line moves on by itself on 1 January.
 */
async function currentYear() {
	"use cache";
	cacheLife("days");
	return new Date().getFullYear();
}

/**
 * Site footer. Lime with black type: the NOSTER wordmark across the full width, then two sides under a rule:
 * - left (cols 1–6): "Let's Build Together", with the business-inquiries line and email / phones at its foot;
 * - right (cols 8–10; 7–10 below 1181px): socials, newsletter sign-up (when NEWSLETTER is on), offices,
 *   then rights and copyright.
 * Both sides stretch to the same height, so the left's contacts line up with the credits.
 * Fixed, compact gaps: the footer is as tall as its content, which fits one screen on desk; nothing
 * stretches to fill the window, so tall windows get no gaps. Compact layouts stack the two sides.
 * Entrance animation: components/FooterMotion.jsx.
 * The words are the Footer document's; the email, phone numbers, social links and offices come from Site
 * settings, the offices' addresses from their own records (Library › Offices).
 * In the studio's live preview each phone number, social link and office opens its entry and can be dragged
 * to a new place; an office's address, phone and map link open the office.
 */
export default async function Footer() {
	const options = await fetchOptions();
	const [data, year] = await Promise.all([getFooter(options), currentYear()]);
	if (!data) return null;
	const { footer, settings } = data;
	const edit = editor(footer, options.stega);
	const site = editor(settings, options.stega);
	const socialList = scope(site, "socials");
	const officeList = scope(site, "offices");
	const hasContact = footer.contactTitle || footer.contactIntro || settings?.email || settings?.phones?.length;

	return (
		<FooterMotion className="relative flex flex-col bg-lime p-m text-black">
			{/* Wordmark in its own mask so it can rise into place */}
			<div className="overflow-hidden">
				<Image data-footer-mark src="/noster-logo.svg" alt="Noster Associates" width={3252} height={574} unoptimized className="h-auto w-full" />
			</div>

			<div className="mt-6 flex flex-col gap-6 desk:mt-3 desk:grid-site desk:gap-y-0">
				{/* Let's Build Together */}
				{hasContact && (
					<div className="flex flex-col justify-between gap-4 desk:col-span-6">
						{/* Top: the rule, the intro as a small eyebrow, then the title */}
						<div>
							<Rule />
							{footer.contactIntro && (
								<p data-fade className="pt-rule" {...editProps(edit("contactIntro"))}>
									{footer.contactIntro}
								</p>
							)}
							{/* Display size, shrinking with the window on desk so the usual title fits one line across the 6
							    columns; a longer one wraps rather than running into the right column */}
							<h2 data-split className="mt-1 text-display text-balance py-[0.08em] desk:text-[min(var(--t-display),7.2vw)]">
								{footer.contactTitle}
							</h2>
						</div>
						{/* Foot: one ruled row per contact across the full width; labels in the first two of six
						    columns, values left-aligned from the third, so both sit on the grid */}
						<ContactRows data-fade settings={settings} edit={site} />
					</div>
				)}

				{/* Right column: fixed gaps; the credits sit at its foot, level with the last contact row. Four
				    columns on tablets and small laptops so the addresses don't wrap into short lines, three from 1181px. */}
				<div className="flex flex-col gap-3 desk:col-span-4 desk:col-start-7 desk:pl-m board:col-span-3 board:col-start-8 board:pl-0">
					{/* Socials */}
					<div>
						<Rule />
						<div data-fade className="pt-rule">
							{footer.socialsTitle && <p {...editProps(edit("socialsTitle"))}>{footer.socialsTitle}</p>}
							<ul {...editProps(socialList())}>
								<Ordered
									edit={socialList}
									items={(settings?.socials ?? [])
										.filter((s) => /^https?:\/\//i.test(safeHref(s.url) ?? ""))
										.map((s) => ({
											key: s._key,
											node: (
												<li key={s._key}>
													<a href={safeHref(s.url)} target="_blank" rel="noreferrer" {...editProps(socialList(item(s._key)))} className={LINK}>
														<RollText>{s.label}</RollText>
													</a>
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
								items={(settings?.offices ?? [])
									.filter((office) => office?.city?.name)
									.map((office) => {
										const at = editor(office, options.stega);
										const city = stegaClean(office.city.name);
										const phone = stegaClean(office.phone);
										const map = safeHref(office.mapUrl);
										return {
											key: office._key,
											node: (
												<div key={office._key} {...editProps(officeList(item(office._key)))}>
													<p>{city}</p>
													<p className="whitespace-pre-line" {...editProps(at("address"))}>
														{stegaClean(office.address)}
													</p>
													{map && (
														<a
															href={map}
															target="_blank"
															rel="noreferrer"
															aria-label={`View directions to the ${city} office`}
															{...editProps(at("mapUrl"))}
															className={LINK}
														>
															<RollText>View directions</RollText>
															<Arrow />
														</a>
													)}
													{phone && (
														<p>
															<a href={telHref(phone)} {...editProps(at("phone"))} className={LINK}>
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
							© {year} {stegaClean(settings?.name) || SITE_NAME}
						</p>
					</div>
				</div>
			</div>
		</FooterMotion>
	);
}
