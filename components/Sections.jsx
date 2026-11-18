import { stegaClean } from "next-sanity";
import { components } from "@/sections";
import { NO_EDIT, item, scope } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";
import Ordered from "./Ordered";

/**
 * A page's sections in order, each rendered by the component for its type (sections/index.js). A section
 * of a type the site has no component for is skipped; with none, nothing is rendered. `context` is passed to every section, and `edit`
 * (the page document's click-to-edit) scoped to it: a section puts `edit()` on its root element, so in the
 * studio's live preview it can be clicked open and dragged to a new place on the page.
 *
 * @param {{ sections: Array<{ _type: string, _key: string }> | null | undefined, context?: Record<string, unknown>, edit?: import("@/lib/sanity/edit").Edit }} props
 */
export default function Sections({ sections, context, edit = NO_EDIT }) {
	const list = scope(edit, "sections");
	const items = (sections ?? []).flatMap((section) => {
		const Section = components[stegaClean(section._type)];
		if (!Section) return [];
		const key = stegaClean(section._key);
		return [{ key, node: <Section key={key} section={section} context={context} edit={scope(list, item(key))} /> }];
	});
	if (!items.length) return null;
	const ordered = <Ordered edit={list} items={items} />;
	// Live preview: the list's own element, holding the array, so its sections are one group to drag within.
	return list.doc ? <div {...editProps(list())}>{ordered}</div> : ordered;
}
