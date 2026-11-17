"use client";

import { Suspense, lazy } from "react";

// The reordering code (and the studio connection it listens on) is fetched only when a list renders here,
// which is in the studio's live preview: visitors never load it.
const EditOrderLive = lazy(() => import("./EditOrderLive"));

/**
 * A list of items from one array field, in the studio's live preview: items dragged to a new place show
 * there at once (EditOrderLive). Until that code has loaded, the items show in the order they were
 * rendered. `items`: each item's rendered element, by its key; `order`: the keys in that order.
 *
 * @param {{ id: string, path: import("@/lib/sanity/edit").Segment[], order: string[], items: Record<string, import("react").ReactNode> }} props
 */
export default function EditOrder(props) {
	return (
		<Suspense fallback={props.order.map((key) => props.items[key])}>
			<EditOrderLive {...props} />
		</Suspense>
	);
}
