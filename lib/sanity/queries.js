// GROQ queries for every page, in the shapes the components read. Links come back as their kind and target
// (lib/content.js → linkHref makes the address), a chosen page or project already resolved to its path;
// images with their asset reference (its ID carries the size), the hotspot and crop set in the studio, and
// the alt text. Linked records (clients, cities, offices) are read through their references.

/** A page or project's path on the site. */
const PATH = `select(
	_type == "home" => "/",
	_type == "works" => "/works",
	_type == "privacyPolicy" => "/privacy_policy",
	_type == "project" => "/works/" + slug.current,
	_type == "page" => "/" + slug.current
)`;

/** The path of the page `ref` points at. */
const pathOf = (ref) => `${ref}->{ "path": ${PATH} }.path`;

const LINK = `{
	kind,
	openInNewTab,
	"path": select(kind == "page" => ${pathOf("page")}, kind == "project" => ${pathOf("project")}),
	url,
	anchor,
	phone,
	email
}`;

const CTA = `{ label, link ${LINK} }`;

// alt: the description typed on this use of the photo, else the one set on the photo in the Media tab.
const IMAGE = `{ "alt": coalesce(alt, asset->altText), hotspot, crop, asset }`;

const SEO = `{ title, description, image ${IMAGE} }`;

/** A project as its card shows it: name, page and its main photo (the project page's hero). */
const CARD = `{
	_id, _type,
	name,
	"href": ${PATH},
	"image": heroImage ${IMAGE}
}`;

/**
 * Every project in the Works page order: the projects listed there first, then any not listed, newest first.
 * Each keeps the key of its place in the list (null when not listed), where it is reordered.
 */
export const PROJECT_ORDER = `[
	...*[_id == "works"][0].projects[]{ _key, "doc": @-> }[doc._type == "project" && defined(doc.slug.current)]{ _key, ...doc${CARD} },
	...(*[_type == "project" && defined(slug.current) && !(_id in coalesce(*[_id == "works"][0].projects[]._ref, []))] | order(_createdAt desc))${CARD}
]`;

// Sections of pages and projects. Each keeps its _type and _key; images, links and linked records are expanded.
const SECTIONS = `{
	...,
	_type == "hero" => {
		"video": video{ asset->{ _id, url, mimeType } },
		image ${IMAGE}
	},
	_type == "collaborators" => {
		clients[]{ _key, ...(@->{ name, "large": largeLogo, logo ${IMAGE} }) }
	},
	_type == "featuredWorks" => {
		projects[]{ _key, "project": project->${CARD} },
		cta ${CTA}
	},
	_type == "photos" => {
		photos[]{ _key, ...${IMAGE} }
	}
}`;

export const HOME = `*[_id == "home"][0]{
	_id, _type, _updatedAt,
	sections[]${SECTIONS},
	seo ${SEO}
}`;

/** The Works page's heading and search fields; its projects come from PROJECT_ORDER. */
export const WORKS = `*[_id == "works"][0]{ _id, _type, _updatedAt, title, seo ${SEO} }`;

export const PRIVACY = `*[_id == "privacyPolicy"][0]{
	_id, _type, _updatedAt,
	title,
	content,
	seo ${SEO}
}`;

export const PAGE_BY_SLUG = `*[_type == "page" && slug.current == $slug][0]{
	_id, _type, _updatedAt,
	title,
	"slug": slug.current,
	sections[]${SECTIONS},
	seo ${SEO}
}`;

export const PAGE_SLUGS = `*[_type == "page" && defined(slug.current)].slug.current`;

export const NAVIGATION = `*[_id == "navigation"][0]{
	_id, _type, _updatedAt,
	links[]{ _key, label, link ${LINK} },
	cta ${CTA},
	mobileLabel
}`;

/** The studio's name, contact details, offices and socials, and the default search fields. */
export const SETTINGS = `*[_id == "siteSettings"][0]{
	_id, _type, _updatedAt,
	name,
	email,
	phones[]{ _key, number },
	socials[]{ _key, label, url },
	offices[]{ _key, ...(@->{ _id, _type, address, phone, mapUrl, "city": city->{ name, state } }) },
	seo ${SEO},
	organizationDescription
}`;

/** The footer's own words, and the site settings it shows (contacts, offices, socials). */
export const FOOTER = `{
	"footer": *[_id == "footer"][0]{ _id, _type, _updatedAt, contactTitle, contactIntro, socialsTitle },
	"settings": ${SETTINGS}
}`;

export const PROJECT_BY_SLUG = `*[_type == "project" && slug.current == $slug][0]{
	_id, _type, _updatedAt,
	name,
	"slug": slug.current,
	heroImage ${IMAGE},
	summary,
	photos[]{ _key, ...${IMAGE} },
	"clients": clients[]->name,
	"sectors": sectors[]->title,
	area,
	"city": city->{ name, state },
	status,
	completion,
	"services": services[]->title,
	size,
	"next": nextProject->${CARD},
	"nextLabel": *[_id == "works"][0].nextProjectLabel,
	sections[]${SECTIONS},
	seo ${SEO}
}`;

export const PROJECT_SLUGS = `*[_type == "project" && defined(slug.current)].slug.current`;

/** Each page's path and last edit, for the sitemap. */
export const SITEMAP = `*[_type in ["home", "works", "project", "privacyPolicy", "page"] && (!(_type in ["project", "page"]) || defined(slug.current))]{
	_type,
	"path": ${PATH},
	_updatedAt
}`;

/** Every project's path, name, text, facts and search fields, in the Works order, for /llms.txt. */
export const PROJECT_SUMMARIES = `*[_type == "project" && defined(slug.current)]{
	_id,
	"slug": slug.current,
	"href": ${PATH},
	name,
	summary,
	"clients": clients[]->name,
	"sectors": sectors[]->title,
	area,
	"city": city->{ name, state },
	status,
	completion,
	"services": services[]->title,
	size,
	seo { title, description }
}`;

/** Every page built from sections, for /llms.txt. */
export const PAGE_SUMMARIES = `*[_type == "page" && defined(slug.current)] | order(title asc){
	title,
	"href": ${PATH},
	seo { description }
}`;
