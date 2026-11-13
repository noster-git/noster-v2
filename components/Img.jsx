import { PrismicNextImage } from "@prismicio/next";

/**
 * Every CMS photo on the site: PrismicNextImage with the image CDN set to send the smallest format the
 * browser takes (AVIF/WebP) and compress it (about 4× lighter than the original JPEG). Same props as
 * PrismicNextImage.
 */
export default function Img({ imgixParams, ...props }) {
	return <PrismicNextImage imgixParams={{ auto: ["format", "compress"], ...imgixParams }} {...props} />;
}
