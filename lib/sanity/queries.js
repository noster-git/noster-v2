// GROQ queries for every page, in the shapes the components read. Links come back as
// { kind, href, openInNewTab } with an internal page already resolved to its path; images with their
// asset reference (its ID carries the size), the hotspot and crop set in the studio, and the alt text.

const PATH = `select(
	_type == "home" => "/",
	_type == "works" => "/works",
	_type == "privacyPolicy" => "/privacy_policy",
	_type == "project" => "/works/" + slug.current
)`;

/** The path of the page `ref` points at. */
const pathOf = (ref) => `${ref}->{ "path": ${PATH} }.path`;

const LINK = `{
	kind,
	openInNewTab,
	"href": select(kind == "external" => url, ${pathOf("reference")})
}`;

const IMAGE = `{ alt, hotspot, crop, asset }`;

const SEO = `{ title, description, image ${IMAGE} }`;

// Home's and project pages' sections. Each keeps its _type and _key; images and links are expanded.
const SECTIONS = `{
	...,
	_type == "hero" => {
		"video": video{ asset->{ _id, url, mimeType } },
		image ${IMAGE}
	},
	_type == "collaborators" => {
		logos[]{ _key, large, logo ${IMAGE} }
	},
	_type == "featuredWorks" => {
		projects[]{ _key, name, description, image ${IMAGE}, "href": ${pathOf("project")} }
	},
	_type == "projectHero" => {
		image ${IMAGE}
	},
	_type == "projectImages" => {
		photos[]{ _key, ...${IMAGE} }
	},
	_type == "nextProject" => {
		"href": ${pathOf("project")}
	}
}`;

export const HOME = `*[_id == "home"][0]{
	_id, _type, _updatedAt,
	sections[]${SECTIONS},
	seo ${SEO}
}`;

/** The Works page's heading and SEO, and the projects listed on Home's Featured Works. */
export const WORKS = `{
	"page": *[_id == "works"][0]{ _id, _type, _updatedAt, title, seo ${SEO} },
	"projects": *[_id == "home"][0].sections[_type == "featuredWorks"][0].projects[]{
		_key, name, description, image ${IMAGE}, "href": ${pathOf("project")}
	}
}`;

export const PRIVACY = `*[_id == "privacyPolicy"][0]{
	_id, _type, _updatedAt,
	title,
	content,
	seo ${SEO}
}`;

export const NAVIGATION = `*[_id == "navigation"][0]{
	_id, _type, _updatedAt,
	links[]{ _key, label, link ${LINK} },
	ctaLabel,
	ctaLink ${LINK},
	mobileCtaLabel
}`;

/** The footer, and the "Let's Build Together" contact it shows, edited in Home's Contact section. */
export const FOOTER = `*[_id == "footer"][0]{
	_id, _type, _updatedAt,
	offices[]{ _key, city, address, phone, directionsLink ${LINK} },
	socialsTitle,
	socials[]{ _key, label, link ${LINK} },
	"contact": *[_id == "home"][0].sections[_type == "contact"][0]
}`;

export const PROJECT_BY_SLUG = `*[_type == "project" && slug.current == $slug][0]{
	_id, _type, _updatedAt,
	"slug": slug.current,
	sections[]${SECTIONS},
	seo ${SEO}
}`;

export const PROJECT_SLUGS = `*[_type == "project" && defined(slug.current)].slug.current`;

/** Every project's page path, name (its hero title) and hero photo. */
export const PROJECT_MEDIA = `*[_type == "project" && defined(slug.current)]{
	"href": ${PATH},
	"name": sections[_type == "projectHero"][0].title,
	"hero": sections[_type == "projectHero"][0].image ${IMAGE}
}`;

/** Each page's path and last edit, for the sitemap. */
export const SITEMAP = `*[_type in ["home", "works", "project", "privacyPolicy"]]{
	_type,
	"path": ${PATH},
	_updatedAt
}`;

/** Every project's path, hero title, brief and search fields, for the plain-text site guide (/llms.txt). */
export const PROJECT_SUMMARIES = `*[_type == "project" && defined(slug.current)] | order(_updatedAt desc){
	"slug": slug.current,
	"href": ${PATH},
	"name": sections[_type == "projectHero"][0].title,
	"brief": sections[_type == "projectBrief"][0]{ description, details[]{ label, value } },
	seo { title, description }
}`;
