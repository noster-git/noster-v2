import { defineArrayMember, defineField, defineType } from "sanity";
import { MenuIcon } from "@sanity/icons/Menu";
import { LINK_PREVIEW, describeLink } from "../objects/link.js";

export const navigation = defineType({
	name: "navigation",
	title: "Navigation",
	type: "document",
	icon: MenuIcon,
	fields: [
		defineField({
			name: "links",
			title: "Links",
			type: "array",
			description: "The links in the menu at the top of every page. Drag to change the order.",
			of: [
				defineArrayMember({
					type: "object",
					name: "navLink",
					title: "Menu link",
					fields: [
						defineField({
							name: "label",
							title: "Label",
							type: "string",
							description: "The words shown in the menu.",
							validation: (rule) => rule.required().error("Add the words shown in the menu."),
						}),
						defineField({
							name: "link",
							title: "Link",
							type: "link",
							description: "Where the menu item leads.",
							validation: (rule) => rule.required().error("Choose where the menu item leads."),
						}),
					],
					preview: {
						select: { title: "label", ...LINK_PREVIEW("link") },
						prepare: ({ title, ...target }) => ({ title: title || "Menu link", subtitle: describeLink(target) }),
					},
				}),
			],
		}),
		defineField({
			name: "cta",
			title: "Button",
			type: "cta",
			description: "The highlighted button: top right of every page on wide screens, at the foot of the screen on phones.",
		}),
		defineField({
			name: "mobileLabel",
			title: "Button words on phones (optional)",
			type: "string",
			description: "A shorter version of the button words for small screens, for example \"Talk to us\". Leave empty to use the same words.",
		}),
	],
	preview: { prepare: () => ({ title: "Navigation" }) },
});
