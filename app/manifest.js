import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/site";

// "browser" display: the site opens as a normal website and is not offered for install as an app.
export default function manifest() {
	return {
		name: SITE_NAME,
		short_name: "Noster",
		description: DEFAULT_DESCRIPTION,
		start_url: "/",
		display: "browser",
		theme_color: "#ffffff",
		background_color: "#ffffff",
		icons: [
			{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
			{ src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
		],
	};
}
