import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
	api: {
		projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
		dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
	},
	// The studio is hosted on the site (/studio) and registered with Sanity, so it shows in the Sanity
	// dashboard. `npx sanity deploy --external --url <site>/studio` refreshes its schema there after changes.
	deployment: {
		appId: "sg0x0kpl17ep77eywedx2gy1",
	},
});
