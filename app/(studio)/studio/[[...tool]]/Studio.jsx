"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

// The studio's config pulls in the whole studio runtime, which only runs in the browser: this client
// component keeps it out of the server bundle.
export default function Studio() {
	return <NextStudio config={config} />;
}
