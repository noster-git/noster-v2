import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { client } from "@/lib/sanity/client";

// The studio's live preview opens the site here with a short-lived secret it has just saved in the dataset. A
// valid secret turns on draft mode (unpublished edits, click-to-edit) and goes on to the page; anything else
// is refused. The dataset is private, so checking the secret needs the read token.
export const { GET } = defineEnableDraftMode({
	client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
