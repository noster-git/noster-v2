// Public address of the site: canonical links, sitemap, structured data. Override per environment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.noster.in").replace(/\/$/, "");
export const SITE_NAME = "Noster Associates";
export const DEFAULT_TITLE = "Noster Associates | Elevating Workspaces";

// The page colour, also used for the browser UI around the page (theme colour, manifest background).
export const PAPER = "#ffffff";

export const DEFAULT_DESCRIPTION =
	"Noster Associates is a workspace interior design and build studio in Trivandrum, Kochi and Hyderabad — designing, constructing and furnishing offices for technology companies.";

/**
 * Open Graph fields every page shares. A page's openGraph replaces the layout's whole object rather than
 * merging into it, so each page spreads this in before its own fields.
 */
export const OPEN_GRAPH = { siteName: SITE_NAME, locale: "en_IN", type: "website" };

/** Absolute URL for a site path. */
export const absolute = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** First `max` characters of plain text, cut at a word, for meta descriptions. */
export function excerpt(text, max = 155) {
	const clean = (text || "").replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}
