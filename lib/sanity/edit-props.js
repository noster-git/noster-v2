/**
 * A click-to-edit `data-sanity` value (lib/sanity/edit.js) as props to spread on an element: none at all
 * when there is no value (visitors), so not even an empty prop reaches the page.
 *
 * @param {string | undefined} value
 * @returns {{ "data-sanity": string } | undefined}
 */
export function editProps(value) {
	return value ? { "data-sanity": value } : undefined;
}
