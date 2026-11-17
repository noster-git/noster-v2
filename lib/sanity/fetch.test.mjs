import assert from "node:assert/strict";
import { test } from "node:test";
import { dataOrNull } from "./fetch.js";

test("a fetch that finds no document gives null", async () => {
	assert.equal(await dataOrNull(Promise.resolve({ data: null })), null);
	assert.equal(await dataOrNull(Promise.resolve({})), null);
});

test("a fetch that finds the document gives its data", async () => {
	assert.deepEqual(await dataOrNull(Promise.resolve({ data: { _id: "home" } })), { _id: "home" });
});
