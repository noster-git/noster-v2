// Public address of the site: canonical links, sitemap, structured data. Override per environment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.noster.in").replace(/\/$/, "");
export const SITE_NAME = "Noster Associates";
export const DEFAULT_DESCRIPTION =
	"Noster Associates is a workspace interior design and build studio in Trivandrum, Kochi and Hyderabad — designing, constructing and furnishing offices for technology companies.";

/** Absolute URL for a site path. */
export const absolute = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** First `max` characters of plain text, cut at a word, for meta descriptions. */
export function excerpt(text, max = 155) {
	const clean = (text || "").replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}
