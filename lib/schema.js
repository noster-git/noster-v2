import { stegaClean } from "next-sanity";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";
import { linkHref, plainText } from "@/lib/content";
import { hasImage, imageUrl } from "@/lib/sanity/image";

// schema.org structured data. Pages reference the studio by @id instead of repeating it.
export const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** The studio by name and @id, added to every page's graph so references to it resolve on every page. */
const ORG_REF = { "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, url: absolute("/") };

const REGION = { trivandrum: "Kerala", thiruvananthapuram: "Kerala", kochi: "Kerala", hyderabad: "Telangana" };

const digits = (phone) => phone.replace(/[^\d+]/g, "");
/** A phone number in international form (+918848434303), however it is written in the footer. */
const e164 = (phone) => {
	const d = digits(phone);
	return d.startsWith("+") ? d : `+91${d.replace(/^0/, "")}`;
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
/** "Project delivered in Dec 2023" → "2023-12"; just the year when no month is given. */
function yearMonth(text) {
	const year = text?.match(/\b(19|20)\d{2}\b/)?.[0];
	if (!year) return undefined;
	const month = MONTHS.findIndex((m) => new RegExp(`\\b${m}`, "i").test(text));
	return month === -1 ? year : `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** "29,000 sq.ft" → a floor area in square feet; the text as written when it has no number. */
function area(text) {
	const n = Number(text?.match(/\d[\d,]*/)?.[0].replace(/,/g, ""));
	return n ? { "@type": "QuantitativeValue", value: n, unitCode: "FTK", unitText: "sq ft" } : text;
}

/** A page of the site, part of the website node. */
const webPage = (url, name) => ({ "@type": "WebPage", "@id": `${url}#webpage`, url, name, isPartOf: { "@id": WEBSITE_ID } });
const WEBSITE_REF = { "@type": "WebSite", "@id": WEBSITE_ID, url: absolute("/"), name: SITE_NAME, publisher: { "@id": ORG_ID } };
const officeId = (office) => `${SITE_URL}/#office-${office.city.toLowerCase().replace(/[^a-z]+/g, "-")}`;

/**
 * The studio, and each office as its own local business with one address: phones and socials from the
 * Footer document, the contact email and numbers from the home page's Contact section.
 */
export function organization(doc, { description, email, phones = [] } = {}) {
	const footer = stegaClean(doc);
	const offices = (footer?.offices ?? []).filter((o) => o.city);
	// The studio's own numbers first, then each office's, each once, in international form.
	const telephone = [...new Set([...phones, ...offices.map((o) => o.phone)].filter(Boolean).map(e164))];
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "Organization",
				"@id": ORG_ID,
				name: SITE_NAME,
				url: absolute("/"),
				logo: absolute("/android-chrome-512x512.png"),
				image: absolute("/noster-meta.png"),
				description: description || DEFAULT_DESCRIPTION,
				...(email && { email }),
				telephone,
				areaServed: "India",
				knowsAbout: ["Office interior design", "Workspace design", "Interior construction", "Furniture design", "Biophilic design"],
				sameAs: (footer?.socials ?? []).map((s) => linkHref(s.link)).filter(Boolean),
				subOrganization: offices.map((o) => ({ "@id": officeId(o) })),
			},
			...offices.map((o) => {
				const postalCode = o.address?.match(/\b\d{6}\b/)?.[0];
				const region = REGION[o.city.toLowerCase()];
				return {
					"@type": "ProfessionalService",
					"@id": officeId(o),
					name: `${SITE_NAME}, ${o.city}`,
					url: absolute("/"),
					image: absolute("/noster-meta.png"),
					parentOrganization: { "@id": ORG_ID },
					...(o.phone && { telephone: e164(o.phone) }),
					...(email && { email }),
					...(linkHref(o.directionsLink) && { hasMap: linkHref(o.directionsLink) }),
					address: {
						"@type": "PostalAddress",
						streetAddress: o.address,
						addressLocality: o.city,
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

/** A plain page (privacy policy): the page, the site and the studio. */
export function page(path, name) {
	return {
		"@context": "https://schema.org",
		"@graph": [{ ...webPage(absolute(path), name), publisher: { "@id": ORG_ID } }, ORG_REF, WEBSITE_REF],
	};
}

/** A project page: the work itself plus a Home › Works › Project breadcrumb. */
export function project(doc, { name, description }) {
	const page = stegaClean(doc);
	const sections = page.sections ?? [];
	const brief = sections.find((s) => s._type === "projectBrief");
	const detail = (label) => brief?.details?.find((d) => d.label?.toLowerCase() === label)?.value?.replace(/\s+/g, " ").trim();
	const images = sections
		.flatMap((s) => (s._type === "projectHero" ? [s.image] : s._type === "projectImages" ? (s.photos ?? []) : []))
		.filter((img) => hasImage(img))
		.map((img) => imageUrl(img))
		.slice(0, 10);
	const url = absolute(`/works/${page.slug}`);
	const created = yearMonth(detail("status"));

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "CreativeWork",
				"@id": `${url}#project`,
				name,
				description: description || excerpt(plainText(brief?.description), 300),
				url,
				image: images,
				creator: { "@id": ORG_ID },
				...(detail("client") && { sourceOrganization: { "@type": "Organization", name: detail("client") } }),
				...(detail("location") && { locationCreated: { "@type": "Place", name: detail("location") } }),
				...(created && { dateCreated: created }),
				...(detail("sector") && { about: { "@type": "Thing", name: detail("sector") } }),
				...(detail("scope") && { keywords: detail("scope") }),
				...(detail("scale") && { size: area(detail("scale")) }),
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
