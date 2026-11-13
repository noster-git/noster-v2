import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/site";

// "browser" display: the old manifest's "standalone" made Chrome offer to install the site as an app.
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
