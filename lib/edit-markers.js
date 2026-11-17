// Click-to-edit markers in the studio's live preview (lib/sanity/client.js): runs of invisible characters
// appended to content. No imports, so any component can use it without adding to the page's scripts.
export const EDIT_MARKERS = /[\u200B-\u200D\u2060-\u2064\uFEFF\u{1D173}-\u{1D17A}]{4,}/gu;

/**
 * The text without click-to-edit markers. Text without any comes back as it is.
 *
 * @param {string} text
 */
export function withoutEditMarkers(text) {
	return text.replace(EDIT_MARKERS, "");
}
