import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";

/**
 * A hero is a page's opening: placed further down, it fills the screen in the middle of the page. True, or a
 * plain-words warning.
 *
 * @param {{ _key?: string } | undefined} value the hero
 * @param {{ document?: { sections?: Array<{ _key?: string }> } }} context
 */
export function checkHeroPlace(value, context) {
	const at = (context.document?.sections ?? []).findIndex((s) => s?._key === value?._key);
	return at > 0 ? "A Hero is made to open the page. Drag it to the top, or use another section here." : true;
}

export const hero = defineType({
	name: "hero",
	title: "Hero",
	type: "object",
	icon: PlayIcon,
	description: "The big opening of a page: a headline over a photo or a looping video. Use it once, at the top.",
	fields: [
		defineField({
			name: "title",
			title: "Headline",
			type: "text",
			rows: 3,
			description: "The large headline. Press Enter to start a new line where you want it to break.",
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: "isVideo",
			title: "Show a video instead of a photo",
			type: "boolean",
			description: "Turn on to play the video below behind the headline. Turn off to show the photo.",
			initialValue: false,
		}),
		defineField({
			name: "video",
			title: "Video",
			type: "file",
			options: { accept: "video/mp4,video/webm" },
			description: "A short silent loop (MP4 or WebM). If you leave it empty, the site plays its standard loop.",
			hidden: ({ parent }) => !parent?.isVideo,
		}),
		defineField({
			name: "image",
			title: "Photo",
			type: "imageWithAlt",
			description: "The photo shown behind the headline. Also shown while a video loads.",
		}),
	],
	validation: (rule) => rule.custom(checkHeroPlace).warning(),
	preview: {
		select: { title: "title", media: "image" },
		prepare: ({ title, media }) => ({ title: title || "Hero", subtitle: "Hero", media }),
	},
});
