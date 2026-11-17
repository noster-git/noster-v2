import { ComposeIcon } from "@sanity/icons/Compose";
import { TagsIcon } from "@sanity/icons/Tags";
import { SearchIcon } from "@sanity/icons/Search";

// The tabs documents are split into: what the page shows, the facts about it, and how it looks in search
// results and shared links.
export const CONTENT = { name: "content", title: "Content", icon: ComposeIcon, default: true };
export const DETAILS = { name: "details", title: "Details", icon: TagsIcon };
export const SEO = { name: "seo", title: "Search & sharing", icon: SearchIcon };
