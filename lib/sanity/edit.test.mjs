import assert from "node:assert/strict";
import { test } from "node:test";
import { NO_EDIT, editor, item, scope } from "./edit.js";

/** A data-sanity value's parts ("id=…;type=…;path=…;base=…"), as the preview's overlays read them. */
const parts = (value) => Object.fromEntries(value.split(";").map((part) => part.split("=")));

test("off (visitors), every path gives no attribute", () => {
	const edit = editor({ _id: "home", _type: "home" }, false);
	assert.equal(edit, NO_EDIT);
	assert.equal(scope(edit, "sections")("title"), undefined);
});

test("on, a scoped path opens the field in the studio, keyed array items included", () => {
	const edit = editor({ _id: "drafts.home", _type: "home" }, true);
	const section = scope(scope(edit, "sections"), item("abc"));
	assert.deepEqual(parts(section("description")), { id: "home", type: "home", path: "sections:abc.description", base: "%2Fstudio" });
	assert.equal(parts(section()).path, "sections:abc");
	assert.deepEqual(section.path, ["sections", { _key: "abc" }]);
	assert.equal(edit(), undefined);
});
