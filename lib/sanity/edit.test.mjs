import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeSanityNodeData } from "@sanity/visual-editing-csm";
import { getArrayItemKeyAndParentPath } from "@sanity/visual-editing";
import { NO_EDIT, editor, item, scope } from "./edit.js";

test("off (visitors), every path gives no attribute", () => {
	const edit = editor({ _id: "home", _type: "home" }, false);
	assert.equal(edit, NO_EDIT);
	assert.equal(scope(edit, "sections")("title"), undefined);
});

test("on, a scoped path opens the field in the studio, keyed array items included", () => {
	const edit = editor({ _id: "drafts.home", _type: "home" }, true);
	const section = scope(scope(edit, "sections"), item("abc"));
	const node = decodeSanityNodeData(section("description"));
	assert.equal(node.id, "home");
	assert.equal(node.type, "home");
	assert.equal(node.baseUrl, "/studio");
	assert.equal(node.path, 'sections[_key=="abc"].description');
	assert.deepEqual(section.path, ["sections", { _key: "abc" }]);
	assert.equal(edit(), undefined);
});

// The preview's overlays read data-sanity with decodeSanityNodeData. Items can be dragged among each other
// when their paths end in a keyed item of the same array; the item menu (move, insert) finds the array and
// the item with getArrayItemKeyAndParentPath. Both come from the packages the preview runs.
test("a list and its items decode as one array of keyed items, as the preview's drag and item menu read them", () => {
	const page = editor({ _id: "home", _type: "home" }, true);
	const list = scope(page, "sections");
	const parent = decodeSanityNodeData(list());
	assert.equal(parent.path, "sections");
	const items = ["hero-0", "ourApproach-1"].map((key) => decodeSanityNodeData(list(item(key))));
	const sameArray = (path) => path.replace(/\[[^\]]*\]$/, "[]");
	for (const [i, node] of items.entries()) {
		assert.equal(node.id, "home");
		assert.match(node.path, /\[_key=="[^"]+"\]$/);
		assert.equal(sameArray(node.path), "sections[]");
		const { path, key } = getArrayItemKeyAndParentPath(node);
		assert.equal(path, parent.path);
		assert.equal(key, ["hero-0", "ourApproach-1"][i]);
	}
	// Nested lists (a section's photos) are their own array, not the page's sections.
	const photo = decodeSanityNodeData(scope(scope(list, item("images-2")), "photos")(item("p1")));
	assert.deepEqual(getArrayItemKeyAndParentPath(photo), { path: 'sections[_key=="images-2"].photos', key: "p1", hasExplicitKey: true });
});
