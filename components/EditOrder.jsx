"use client";

import { useOptimistic } from "next-sanity/hooks";

/**
 * The value at `path` in a document (field names and array items by key), or undefined.
 *
 * @param {any} doc
 * @param {import("@/lib/sanity/edit").Segment[]} path
 */
function at(doc, path) {
	return path.reduce((value, step) => {
		if (value == null) return undefined;
		if (typeof step === "string") return value[step];
		return Array.isArray(value) ? value.find((entry) => entry?._key === step._key) : undefined;
	}, doc);
}

/**
 * A list of items from one array field, in the studio's live preview only: when an item is dragged to a new
 * place (or moved with the item's menu), the list takes the new order at once, before the page is
 * re-rendered with it. Items added there appear with that re-render. `items`: each item's rendered
 * element, by its key; `order`: the keys in the order they were rendered.
 *
 * @param {{ id: string, path: import("@/lib/sanity/edit").Segment[], order: string[], items: Record<string, import("react").ReactNode> }} props
 */
export default function EditOrder({ id, path, order, items }) {
	const keys = useOptimistic(order, (state, action) => {
		if (action.id !== id) return state;
		const list = at(action.document, path);
		return Array.isArray(list) ? list.map((entry) => entry?._key).filter((key) => key in items) : state;
	});
	return keys.map((key) => items[key]);
}
