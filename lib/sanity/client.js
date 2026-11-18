import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * The content client: published content from the API CDN. Click-to-edit markers in draft mode point at the
 * studio on this site.
 */
export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: true,
	perspective: "published",
	stega: { studioUrl: "/studio" },
});
