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
 * The list in the order the studio's live preview has it: when an item is dragged to a new place (or moved
 * with its menu), the list takes the new order at once, before the page is re-rendered with it. Loaded by
 * EditOrder in the live preview only.
 *
 * @param {import("react").ComponentProps<typeof import("./EditOrder").default>} props
 */
export default function EditOrderLive({ id, path, order, items }) {
	const keys = useOptimistic(order, (state, action) => {
		if (action.id !== id) return state;
		const list = at(action.document, path);
		return Array.isArray(list) ? list.map((entry) => entry?._key).filter((key) => Object.hasOwn(items, key)) : state;
	});
	return keys.map((key) => items[key]);
}
