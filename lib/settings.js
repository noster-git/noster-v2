import { fetchOrNull } from "@/lib/sanity/live";
import { SETTINGS } from "@/lib/sanity/queries";

/**
 * @typedef {{
 *   _id: string,
 *   _type: string,
 *   name?: string | null,
 *   email?: string | null,
 *   phones?: Array<{ _key: string, number?: string | null }> | null,
 *   socials?: Array<{ _key: string, label?: string | null, url?: string | null }> | null,
 *   offices?: Array<{ _key: string, _id?: string, _type?: string, address?: string | null, phone?: string | null, mapUrl?: string | null, city?: { name?: string | null, state?: string | null } | null }> | null,
 *   seo?: { title?: string | null, description?: string | null, image?: import("@/lib/sanity/image").SanityImage | null } | null,
 *   organizationDescription?: string | null,
 * }} Settings The Site settings document, as SETTINGS reads it.
 */

/**
 * Site settings: the studio's name, contact details, offices, socials and default search fields. Null when
 * there are none or the CMS can't be read; read once per request however many places ask.
 *
 * @param {import("@/lib/sanity/live").FetchOptions} options
 * @returns {Promise<Settings | null>}
 */
export function getSettings(options) {
	return fetchOrNull({ query: SETTINGS, ...options }).catch(() => null);
}
