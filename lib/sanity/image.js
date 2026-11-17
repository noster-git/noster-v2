import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../../sanity/env.js";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * @typedef {{ x: number, y: number, width: number, height: number }} Hotspot
 * @typedef {{ top: number, bottom: number, left: number, right: number }} Crop
 * @typedef {{
 *   alt?: string | null,
 *   hotspot?: Hotspot | null,
 *   crop?: Crop | null,
 *   asset?: { _id?: string, _ref?: string, metadata?: { dimensions?: { width: number, height: number } } } | null,
 *   src?: string,
 *   width?: number,
 *   height?: number,
 * }} SanityImage An image field as the queries return it (lib/sanity/queries.js), with its address and
 * size added by withImageUrls.
 */

/**
 * Whether an image field has a photo in it.
 *
 * @param {SanityImage | null | undefined} img
 */
export function hasImage(img) {
	return Boolean(img?.asset?._id || img?.asset?._ref);
}

/**
 * The photo's address on the image CDN, in the smallest format the browser takes, or in `fm` when set. With
 * a width and a height, it is cropped to that shape around the hotspot set in the studio.
 *
 * @param {SanityImage} img
 * @param {{ w?: number, h?: number, q?: number, fm?: "jpg" | "png" | "webp" }} [size]
 */
export function imageUrl(img, { w, h, q, fm } = {}) {
	let url = fm ? builder.image(img).format(fm) : builder.image(img).auto("format");
	if (w) url = url.width(Math.round(w));
	if (h) url = url.height(Math.round(h));
	if (w && h) url = url.fit("crop");
	if (q) url = url.quality(q);
	return url.url();
}

/**
 * The photo's size in pixels, less any crop set in the studio.
 *
 * @param {SanityImage} img
 * @returns {{ width: number, height: number } | null}
 */
export function imageSize(img) {
	const id = img?.asset?._id || img?.asset?._ref || "";
	const [, w, h] = /-(\d+)x(\d+)-\w+$/.exec(id) ?? [];
	const dimensions = img?.asset?.metadata?.dimensions ?? (w ? { width: Number(w), height: Number(h) } : null);
	if (!dimensions) return null;
	const crop = img.crop ?? { top: 0, bottom: 0, left: 0, right: 0 };
	return {
		width: Math.round(dimensions.width * (1 - crop.left - crop.right)),
		height: Math.round(dimensions.height * (1 - crop.top - crop.bottom)),
	};
}

// Widest source the site's image optimizer is given: its largest srcset width. Originals can be 9500px.
const SOURCE_MAX = 3840;

/**
 * The photo as the site's image optimizer (next/image) fetches it from the image CDN: at most 3840px wide,
 * any crop set in the studio applied, in high quality, as the optimizer makes the files browsers get. An
 * SVG comes as a PNG, under a ".png" file name (the CDN ignores it): next/image leaves any address ending in
 * ".svg" unoptimized, which browsers would then fetch from the CDN directly.
 *
 * @param {SanityImage} img
 */
export function sourceUrl(img) {
	const id = img?.asset?._id || img?.asset?._ref || "";
	const size = imageSize(img);
	let url = builder.image(img).fit("max").quality(90);
	if (!size || size.width > SOURCE_MAX) url = url.width(SOURCE_MAX);
	if (!/-svg$/.test(id)) return url.url();
	const png = new URL(url.format("png").url());
	png.pathname += "/logo.png";
	return png.href;
}

/**
 * A query result with every image in it given its source address for the image optimizer (`src`,
 * sourceUrl) and its size (`width`, `height`). Everything else is passed through as it is.
 *
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function withImageUrls(value) {
	if (Array.isArray(value)) return /** @type {T} */ (value.map(withImageUrls));
	if (!value || typeof value !== "object") return value;
	const entries = Object.entries(value).map(([key, v]) => [key, withImageUrls(v)]);
	const out = Object.fromEntries(entries);
	if (!/^image-/.test(out.asset?._id || out.asset?._ref || "")) return /** @type {T} */ (out);
	const size = imageSize(out);
	return /** @type {T} */ ({ ...out, src: sourceUrl(out), width: size?.width, height: size?.height });
}
