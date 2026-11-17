import { stegaClean } from "next-sanity";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";
import { plainText, safeHref } from "@/lib/content";
import { handoverDate, joinNames, locationText, scopeText, sizeText } from "@/lib/project-facts";
import { hasImage, imageUrl } from "@/lib/sanity/image";

// schema.org structured data. Pages reference the studio by @id instead of repeating it.
export const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** The studio by name and @id, added to every page's graph so references to it resolve on every page. */
const ORG_REF = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: absolute("/") };

const digits = (phone) => phone.replace(/[^\d+]/g, "");
/** A phone number in international form (+918848434303), however it is written in the footer. */
const e164 = (phone) => {
	const d = digits(phone);
	return d.startsWith("+") ? d : `+91${d.replace(/^0/, "")}`;
};

/** A floor area in square feet. */
const area = (size) => ({ "@type": "QuantitativeValue", value: size, unitCode: "FTK", unitText: "sq ft" });

/** A page of the site, part of the website node. */
const webPage = (url, name) => ({ "@type": "WebPage", "@id": `${url}#webpage`, url, name, isPartOf: { "@id": WEBSITE_ID } });
const WEBSITE_REF = { "@type": "WebSite", "@id": WEBSITE_ID, url: absolute("/"), name: SITE_NAME, publisher: { "@id": ORG_ID } };
const officeId = (city) => `${SITE_URL}/#office-${city.toLowerCase().replace(/[^a-z]+/g, "-")}`;

/**
 * The studio, and each office as its own local business with one address: the name, contact details,
 * offices and social links from Site settings.
 *
 * @param {import("@/lib/settings").Settings | null | undefined} doc
 */
export function organization(doc) {
	const settings = stegaClean(doc);
	const name = settings?.name || SITE_NAME;
	const email = settings?.email?.trim() || undefined;
	const offices = (settings?.offices ?? []).filter((o) => o?.city?.name);
	// The studio's own numbers first, then each office's, each once, in international form.
	const phones = (settings?.phones ?? []).map((p) => p.number);
	const telephone = [...new Set([...phones, ...offices.map((o) => o.phone)].filter(Boolean).map(e164))];
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": ORG_ID,
				name,
				url: absolute("/"),
				logo: absolute("/android-chrome-512x512.png"),
				image: absolute("/noster-meta.png"),
				description: settings?.organizationDescription || DEFAULT_DESCRIPTION,
				...(email && { email }),
				telephone,
				areaServed: "India",
				knowsAbout: ["Office interior design", "Workspace design", "Interior construction", "Furniture design", "Biophilic design"],
				sameAs: (settings?.socials ?? []).map((s) => safeHref(s.url)).filter(Boolean),
				subOrganization: offices.map((o) => ({ "@id": officeId(o.city.name) })),
			},
			...offices.map((o) => {
				const postalCode = o.address?.match(/\b\d{6}\b/)?.[0];
				const region = o.city.state;
				const map = safeHref(o.mapUrl);
				return {
					"@type": "ProfessionalService",
					"@id": officeId(o.city.name),
					name: `${name}, ${o.city.name}`,
					url: absolute("/"),
					image: absolute("/noster-meta.png"),
					parentOrganization: { "@id": ORG_ID },
					...(o.phone && { telephone: e164(o.phone) }),
					...(email && { email }),
					...(map && { hasMap: map }),
					address: {
						"@type": "PostalAddress",
						streetAddress: o.address,
						addressLocality: o.city.name,
						...(region && { addressRegion: region }),
						...(postalCode && { postalCode }),
						addressCountry: "IN",
					},
				};
			}),
			WEBSITE_REF,
			{ ...webPage(absolute("/"), SITE_NAME), about: { "@id": ORG_ID } },
		],
	};
}

/** Our Works: the list of projects. */
export function worksList(works) {
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				...webPage(absolute("/works"), "Our Works"),
				"@type": "CollectionPage",
				publisher: { "@id": ORG_ID },
				breadcrumb: {
					"@type": "BreadcrumbList",
					itemListElement: [
						{ "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
						{ "@type": "ListItem", position: 2, name: "Works", item: absolute("/works") },
					],
				},
				mainEntity: {
					"@type": "ItemList",
					itemListElement: works.map((w, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(w.href), name: w.name })),
				},
			},
			ORG_REF,
			WEBSITE_REF,
		],
	};
}

/**
 * A plain page: the page, the site and the studio. With `breadcrumb`, a Home › Page trail too (pages built
 * from sections).
 *
 * @param {string} path
 * @param {string} name
 * @param {{ breadcrumb?: boolean, description?: string }} [options]
 */
export function page(path, name, { breadcrumb = false, description } = {}) {
	const url = absolute(path);
	const trail = breadcrumb && {
		breadcrumb: {
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
				{ "@type": "ListItem", position: 2, name, item: url },
			],
		},
	};
	return {
		"@context": "https://schema.org",
		"@graph": [{ ...webPage(url, name), ...(description && { description }), publisher: { "@id": ORG_ID }, ...trail }, ORG_REF, WEBSITE_REF],
	};
}

/**
 * A project page: the work itself (its client, place, handover, sector, scope and size from the project's
 * details) plus a Home › Works › Project breadcrumb.
 *
 * @param {{ slug: string, summary?: Array<any> | null, heroImage?: any, photos?: Array<any> | null } & import("@/lib/project-facts").ProjectDetails} doc
 * @param {{ name: string, description?: string }} names
 */
export function project(doc, { name, description }) {
	const p = stegaClean(doc);
	const images = [p.heroImage, ...(p.photos ?? [])]
		.filter((img) => hasImage(img))
		.map((img) => imageUrl(img))
		.slice(0, 10);
	const url = absolute(`/works/${p.slug}`);
	const client = joinNames(p.clients);
	const location = locationText(p, { oneLine: true });
	const created = handoverDate(p.completion);
	const sector = (p.sectors ?? []).filter(Boolean).join(", ");
	const scope = scopeText(p.services).replace(/\s+/g, " ");

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "CreativeWork",
				"@id": `${url}#project`,
				name,
				description: description || excerpt(plainText(p.summary), 300),
				url,
				image: images,
				creator: { "@id": ORG_ID },
				...(client && { sourceOrganization: { "@type": "Organization", name: client } }),
				...(location && { locationCreated: { "@type": "Place", name: location } }),
				...(created && { dateCreated: created }),
				...(sector && { about: { "@type": "Thing", name: sector } }),
				...(scope && { keywords: scope }),
				...(sizeText(p.size) && { size: area(p.size) }),
				mainEntityOfPage: { "@id": `${url}#webpage` },
			},
			{
				...webPage(url, name),
				breadcrumb: {
					"@type": "BreadcrumbList",
					itemListElement: [
						{ "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
						{ "@type": "ListItem", position: 2, name: "Works", item: absolute("/works") },
						{ "@type": "ListItem", position: 3, name, item: url },
					],
				},
			},
			ORG_REF,
			WEBSITE_REF,
		],
	};
}
