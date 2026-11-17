import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { projectId, dataset } from "./sanity/env.js";
import { schemaTypes, SINGLETON_TYPES } from "./sanity/schema/index.js";
import { structure } from "./sanity/structure.js";
import { resolve } from "./sanity/presentation.js";
import { NosterIcon } from "./sanity/icon.js";

// Actions a one-off document must not offer: it is never deleted or copied.
const BLOCKED_ACTIONS = new Set(["delete", "duplicate", "unpublish"]);

export default defineConfig({
	name: "default",
	title: "Noster",
	icon: NosterIcon,
	basePath: "/studio",
	projectId,
	dataset,
	schema: {
		types: schemaTypes,
		templates: (templates) => templates.filter(({ schemaType }) => !SINGLETON_TYPES.includes(schemaType)),
	},
	plugins: [
		structureTool({ structure }),
		// Live preview: the site in a frame, opened on whichever address the studio is on, in draft mode so it shows
		// unpublished edits; click any text or photo there to edit it.
		presentationTool({ resolve, previewUrl: { previewMode: { enable: "/api/draft-mode/enable" } } }),
	],
	document: {
		newDocumentOptions: (prev, { creationContext }) =>
			creationContext.type === "global" ? prev.filter(({ templateId }) => !SINGLETON_TYPES.includes(templateId)) : prev,
		actions: (prev, { schemaType }) => (SINGLETON_TYPES.includes(schemaType) ? prev.filter(({ action }) => !BLOCKED_ACTIONS.has(action)) : prev),
	},
});
