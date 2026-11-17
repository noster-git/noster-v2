import { createDataAttribute, stegaClean } from "next-sanity";
import { getPublishedId } from "@sanity/client/csm";

/**
 * @typedef {string | { _key: string }} Segment One step of a field path: a field name, or an array item by its key.
 *
 * @typedef {{
 *   (path?: Segment | Segment[]): string | undefined,
 *   doc?: { id: string, type: string },
 *   path?: Segment[],
 * }} Edit
 * Click-to-edit for one document, or a part of it: called with a field path (relative to `path`), it gives
 * the `data-sanity` value that opens that field in the studio. In draft mode only: for visitors every call
 * gives undefined, so no attribute is rendered.
 */

/** @type {Edit} */
export const NO_EDIT = () => undefined;

const toPath = (path) => (path === undefined ? [] : Array.isArray(path) ? path : [path]);

/**
 * Click-to-edit for a document (its _id and _type, as the queries return them), on only when `on` (draft
 * mode: the fetch's `stega` option). The document goes by its published ID, as the studio names it: without
 * the draft or content-release prefix.
 *
 * @param {{ _id?: string | null, _type?: string | null } | null | undefined} doc
 * @param {boolean} on
 * @returns {Edit}
 */
export function editor(doc, on) {
	const id = stegaClean(doc?._id);
	const type = stegaClean(doc?._type);
	if (!on || !id || !type) return NO_EDIT;
	return scope(Object.assign(() => undefined, { doc: { id: getPublishedId(id), type }, path: [] }), []);
}

/**
 * The same document's editor, with every path starting at `base` (a section, an array item).
 *
 * @param {Edit} edit
 * @param {Segment | Segment[]} base
 * @returns {Edit}
 */
export function scope(edit, base) {
	if (!edit.doc) return NO_EDIT;
	const { id, type } = edit.doc;
	const prefix = [...(edit.path ?? []), ...toPath(base)];
	const attr = createDataAttribute({ id, type, baseUrl: "/studio" });
	/** @type {Edit} */
	const scoped = (path) => {
		const full = [...prefix, ...toPath(path)];
		return full.length ? attr(full) : undefined;
	};
	scoped.doc = edit.doc;
	scoped.path = prefix;
	return scoped;
}

/**
 * An array item by its key, as a path step.
 *
 * @param {string | null | undefined} key
 * @returns {{ _key: string }}
 */
export const item = (key) => ({ _key: stegaClean(key) ?? "" });
