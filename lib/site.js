import { stegaClean } from "next-sanity";
import { hasImage, imageUrl } from "./sanity/image.js";

// Public address of the site: canonical links, sitemap, structured data. Override per environment.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.noster.in").replace(/\/$/, "");
export const SITE_NAME = "Noster Associates";
export const DEFAULT_TITLE = "Office Interior Design & Build in Kerala | Noster Associates";

// The footer's newsletter sign-up. Off until a mailing-list provider is connected (lib/subscribe.js):
// while off, the form isn't shown and the server action refuses every request.
export const NEWSLETTER = false;

// The page colour, also used for the browser UI around the page (theme colour, manifest background).
export const PAPER = "#ffffff";

export const DEFAULT_DESCRIPTION =
	"Office interior design and build studio in Trivandrum, Kochi and Hyderabad. We design, construct and furnish workspaces for technology companies.";

/**
 * Open Graph fields every page shares. A page's openGraph replaces the layout's whole object rather than
 * merging into it, so each page spreads this in before its own fields.
 */
export const OPEN_GRAPH = { siteName: SITE_NAME, locale: "en_IN", type: "website" };

/**
 * The Open Graph image for a page: the first image with a photo, cropped to 1200 × 630 (the 1.91:1 that
 * link previews use) around its hotspot and sent as an 80% JPEG, light enough for WhatsApp's ~300KB preview
 * limit; otherwise the site's default card. Each entry is an image field or null.
 *
 * @param {Array<import("./sanity/image.js").SanityImage | null | undefined>} images
 * @param {string} [alt]
 */
export function shareImage(images, alt = SITE_NAME) {
	const image = images.find((img) => hasImage(img));
	if (!image) return { url: "/noster-meta.png", width: 1200, height: 628, alt: SITE_NAME };
	const url = imageUrl(image, { w: 1200, h: 630, fm: "jpg", q: 80 });
	return { url, width: 1200, height: 630, alt: image.alt || alt };
}

/** Absolute URL for a site path. */
export const absolute = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** First `max` characters of plain text, cut at a word, for meta descriptions. */
export function excerpt(text, max = 155) {
	const clean = (text || "").replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	return `${clean.slice(0, clean.lastIndexOf(" ", max - 1))}…`;
}

/**
 * A page's metadata: its title, description, canonical address and Open Graph card. Each comes from the
 * page's own search fields (`seo`), else the page's own fallback given here (`title`, `description`, `images`,
 * such as a project's name and photo), else the defaults in Settings, else the site's.
 * Values are read without click-to-edit markers.
 *
 * @param {{
 *   path: string,
 *   seo?: { title?: string | null, description?: string | null, image?: import("./sanity/image.js").SanityImage | null } | null,
 *   settings?: { seo?: { title?: string | null, description?: string | null, image?: import("./sanity/image.js").SanityImage | null } | null } | null,
 *   title?: string,
 *   description?: string,
 *   images?: Array<import("./sanity/image.js").SanityImage | null | undefined>,
 *   alt?: string,
 *   type?: "website" | "article",
 * }} page
 */
export function pageMetadata({ path, seo, settings, title, description, images = [], alt, type }) {
	const own = stegaClean(seo);
	const site = stegaClean(settings?.seo);
	const pageTitle = own?.title || title || site?.title || DEFAULT_TITLE;
	const pageDescription = own?.description || description || site?.description || DEFAULT_DESCRIPTION;
	return {
		title: pageTitle,
		description: pageDescription,
		alternates: { canonical: path },
		openGraph: {
			...OPEN_GRAPH,
			...(type && { type }),
			url: path,
			title: pageTitle,
			description: pageDescription,
			images: [shareImage([own?.image, ...stegaClean(images), site?.image], alt)],
		},
	};
}
