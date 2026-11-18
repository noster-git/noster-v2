import Image from "next/image";

/**
 * Every CMS photo on the site: next/image through the site's own image optimizer, which fetches the photo
 * from the image CDN (a source capped at 3840px, lib/sanity/image.js sourceUrl) and sends each srcset
 * width as AVIF or WebP at quality 75. Takes next/image's props, with `image` (an image field from the
 * queries, whose source address and size were added on the server) in place of `src`; the alt text comes
 * from the image, else `fallbackAlt` ("" for a decorative photo). Renders nothing when the field has
 * no photo.
 *
 * @param {Omit<import("next/image").ImageProps, "src" | "alt"> & {
 *   image: import("@/lib/sanity/image").SanityImage | null | undefined,
 *   alt?: string,
 *   fallbackAlt?: string,
 * }} props
 */
export default function Img({ image, alt, fallbackAlt, fill, ...props }) {
	if (!image?.src) return null;

	return (
		<Image
			src={image.src}
			alt={alt ?? (image.alt || fallbackAlt)}
			fill={fill}
			width={fill ? undefined : image.width}
			height={fill ? undefined : image.height}
			{...props}
		/>
	);
}
