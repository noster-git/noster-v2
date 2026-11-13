import { absolute } from "@/lib/site";

export default function robots() {
	return {
		rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/slice-simulator"] },
		sitemap: absolute("/sitemap.xml"),
	};
}
