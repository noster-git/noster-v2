import Link from "next/link";
import Image from "next/image";
import { cacheLife, cacheTag } from "next/cache";
import { asText, isFilled } from "@prismicio/client";
import { PrismicNextLink, cacheTagPrismicPages, getPreviewRef } from "@prismicio/next";
import { createClient } from "@/prismicio";
import RollText from "./RollText";
import Arrow from "./Arrow";
import FooterSubscribe from "./FooterSubscribe";
import FooterMotion from "./FooterMotion";
import { NEWSLETTER } from "@/lib/site";

/**
 * @param {string} [ref]
 */
export async function getFooter(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const footer = await createClient()
		.getSingle("footer", { ref })
		.catch(() => null);
	if (footer) cacheTagPrismicPages([footer]);
	return footer;
}

/**
 * "Let's Build Together" content, still edited in the Contact slice on the home page in Prismic.
 * The home page skips that slice (app/page.jsx): it is rendered here, on every page.
 *
 * @param {string} [ref]
 */
async function getContact(ref) {
	"use cache";
	cacheLife("max");
	cacheTag("prismic");
	const home = await createClient()
		.getSingle("home", { ref })
		.catch(() => null);
	if (!home) return null;
	cacheTagPrismicPages([home]);
	const slice = home.data.slices.find((s) => s.slice_type === "contact");
	if (!slice) return null;
	return {
		title: asText(slice.primary.title),
		intro: slice.primary.intro,
		contacts: (slice.primary.contacts ?? [])
			.map((c) => c.value?.trim())
			.filter(Boolean)
			.map((value) => ({ value, href: value.includes("@") ? `mailto:${value}` : `tel:${value.replace(/\s+/g, "")}` })),
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
 */
export default async function Footer() {
	const ref = await getPreviewRef();
	const [footer, contact] = await Promise.all([getFooter(ref), getContact(ref)]);
	if (!footer) return null;
	const { rights_text, copyright_text, offices, socials_title, socials } = footer.data;

	return (
		<FooterMotion className="relative flex flex-col bg-lime p-m text-black">
			{/* Wordmark in its own mask so it can rise into place */}
			<div className="overflow-hidden">
				<Image data-footer-mark src="/noster-logo.svg" alt="Noster Associates" width={3252} height={574} unoptimized className="h-auto w-full" />
			</div>

			<div className="mt-6 flex flex-col gap-6 desk:mt-3 desk:grid-site desk:gap-y-0">
				{/* Let's Build Together */}
				{contact && (
					<div className="flex flex-col justify-between gap-4 desk:col-span-6">
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
						<ul data-fade className="border-b border-current">
							{contact.contacts.map((c) => (
								<li key={c.value} className="border-t border-current">
									<a href={c.href} className="grid grid-cols-6 items-baseline gap-x-g py-[0.35em] pointer-coarse:min-h-[44px] pointer-coarse:content-center transition-opacity duration-200 hover:opacity-60">
										<span className="col-span-2">{c.href.startsWith("mailto:") ? "Email" : "Phone"}</span>
										<span className="col-span-4 min-w-0 text-lead [overflow-wrap:anywhere]">{c.value}</span>
									</a>
								</li>
							))}
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
							{socials_title && <p>{socials_title}</p>}
							<ul>
								{socials.map((s, i) =>
									isFilled.link(s.link) ? (
										<li key={i}>
											<PrismicNextLink field={s.link} className={LINK}>
												<RollText>{s.label}</RollText>
											</PrismicNextLink>
										</li>
									) : null,
								)}
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
						<div data-fade className="grid grid-cols-2 gap-x-g gap-y-2 pt-rule">
							{offices.map((office, i) => (
								<div key={i}>
									<p>{office.city}</p>
									<p className="whitespace-pre-line">{office.address}</p>
									{isFilled.link(office.directions_link) && (
										<PrismicNextLink field={office.directions_link} aria-label={`View directions to the ${office.city} office`} className={LINK}>
											<RollText>View directions</RollText>
											<Arrow />
										</PrismicNextLink>
									)}
									{office.phone && (
										<p>
											<a href={`tel:${office.phone.replace(/\s+/g, "")}`} className={LINK}>
												<RollText>{office.phone}</RollText>
											</a>{" "}
											(Sales)
										</p>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Credits, at the foot of the column */}
					<div data-fade className="flex items-end justify-between gap-g desk:mt-auto desk:pt-2">
						<div>
							<p>{rights_text}</p>
							<Link href="/privacy_policy" className={LINK}>
								<RollText>Privacy Policy</RollText>
							</Link>
						</div>
						<p className="inline-flex min-h-[24px] items-center text-right pointer-coarse:min-h-[44px]">{copyright_text}</p>
					</div>
				</div>
			</div>
		</FooterMotion>
	);
}
