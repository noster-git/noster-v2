import EditOrder from "./EditOrder";

/**
 * Items from one array field, rendered in order. In the studio's live preview (`edit` on, scoped to the
 * array) they can be dragged into a new order on the page, and show it at once (EditOrder); for visitors
 * they are simply the items.
 *
 * @param {{ edit: import("@/lib/sanity/edit").Edit, items: Array<{ key: string, node: import("react").ReactNode }> }} props
 */
export default function Ordered({ edit, items }) {
	if (!edit.doc) return items.map((entry) => entry.node);
	return (
		<EditOrder
			id={edit.doc.id}
			path={edit.path ?? []}
			order={items.map((entry) => entry.key)}
			items={Object.fromEntries(items.map((entry) => [entry.key, entry.node]))}
		/>
	);
}
