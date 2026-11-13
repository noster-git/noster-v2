import { asLink, asText } from "@prismicio/client";
import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, absolute, excerpt } from "@/lib/site";

// schema.org structured data. Pages reference the studio by @id instead of repeating it.
export const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const REGION = { trivandrum: "Kerala", thiruvananthapuram: "Kerala", kochi: "Kerala", hyderabad: "Telangana" };

/** The studio, with offices, phones and socials from the Footer document. */
export function organization(footer, { description, email } = {}) {
	const offices = footer?.data.offices ?? [];
	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": ["Organization", "ProfessionalService"],
				"@id": ORG_ID,
				name: SITE_NAME,
				url: absolute("/"),
				logo: absolute("/android-chrome-512x512.png"),
				image: absolute("/noster-meta.png"),
				description: description || DEFAULT_DESCRIPTION,
				...(email && { email }),
				telephone: [...new Set(offices.map((o) => o.phone).filter(Boolean))],
				address: offices.map((o) => ({
					"@type": "PostalAddress",
					streetAddress: o.address,
					addressLocality: o.city,
					...(REGION[o.city?.toLowerCase()] && { addressRegion: REGION[o.city.toLowerCase()] }),
					...(o.address?.match(/\b\d{6}\b/) && { postalCode: o.address.match(/\b\d{6}\b/)[0] }),
					addressCountry: "IN",
				})),
				areaServed: "India",
				knowsAbout: ["Office interior design", "Workspace design", "Interior construction", "Furniture design", "Biophilic design"],
				sameAs: (footer?.data.socials ?? []).map((s) => asLink(s.link)).filter(Boolean),
			},
			{ "@type": "WebSite", "@id": WEBSITE_ID, url: absolute("/"), name: SITE_NAME, publisher: { "@id": ORG_ID } },
		],
	};
}

/** Our Works: the list of projects. */
export function worksList(works) {
	return {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "Our Works",
		url: absolute("/works"),
		isPartOf: { "@id": WEBSITE_ID },
		mainEntity: {
			"@type": "ItemList",
			itemListElement: works.map((w, i) => ({ "@type": "ListItem", position: i + 1, url: absolute(w.href), name: w.name })),
		},
	};
}

/** A project page: the work itself plus a Home › Works › Project breadcrumb. */
export function project(page, { name, description }) {
	const slices = page.data.slices;
	const brief = slices.find((s) => s.slice_type === "project_brief");
	const detail = (label) => brief?.primary.details.find((d) => d.label?.toLowerCase() === label)?.value?.replace(/\s+/g, " ").trim();
	const images = slices
		.flatMap((s) =>
			s.slice_type === "project_hero" ? [s.primary.image] : s.slice_type === "project_images" ? s.primary.photos.map((p) => p.image) : [],
		)
		.map((i) => i?.url)
		.filter(Boolean)
		.slice(0, 10);
	const url = absolute(page.url || `/works/${page.uid}`);
	const year = detail("status")?.match(/\b(19|20)\d{2}\b/)?.[0];

	return {
		"@context": "https://schema.org",
		"@graph": [
			{
				"@type": "CreativeWork",
				"@id": `${url}#project`,
				name,
				description: description || excerpt(asText(brief?.primary.description), 300),
				url,
				image: images,
				creator: { "@id": ORG_ID },
				...(detail("client") && { sourceOrganization: { "@type": "Organization", name: detail("client") } }),
				...(detail("location") && { locationCreated: { "@type": "Place", name: detail("location") } }),
				...(year && { dateCreated: year }),
				...(detail("sector") && { about: detail("sector") }),
				...(detail("scope") && { keywords: detail("scope") }),
				...(detail("scale") && { size: detail("scale") }),
			},
			{
				"@type": "BreadcrumbList",
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
					{ "@type": "ListItem", position: 2, name: "Works", item: absolute("/works") },
					{ "@type": "ListItem", position: 3, name, item: url },
				],
			},
		],
	};
}
