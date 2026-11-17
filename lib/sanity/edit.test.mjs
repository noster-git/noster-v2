import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeSanityNodeData } from "@sanity/visual-editing-csm";
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
	assert.equal(decodeSanityNodeData(section()).path, 'sections[_key=="abc"]');
	assert.deepEqual(section.path, ["sections", { _key: "abc" }]);
	assert.equal(edit(), undefined);
});
