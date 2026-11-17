import assert from "node:assert/strict";
import { test } from "node:test";
import { schemaTypes } from "./index.js";

const byName = (name) => schemaTypes.find((t) => t.name === name);
const memberTypes = (doc) => byName(doc).fields.find((f) => f.name === "sections").of.map((m) => m.type);

test("every type the site reads exists", () => {
	const names = new Set(schemaTypes.map((t) => t.name));
	const expected = [
		"home", "works", "privacyPolicy", "navigation", "footer", "project",
		"seo", "link", "imageWithAlt", "blockContent",
		"hero", "ourApproach", "collaborators", "featuredWorks", "contact",
		"projectHero", "projectBrief", "projectImages", "nextProject",
	];
	for (const name of expected) assert.ok(names.has(name), `missing type ${name}`);
});

test("home and project sections", () => {
	assert.deepEqual(memberTypes("home"), ["hero", "ourApproach", "collaborators", "featuredWorks", "contact"]);
	assert.deepEqual(memberTypes("project"), ["projectHero", "projectBrief", "projectImages", "nextProject"]);
});

test("images carry alt and hotspot", () => {
	const image = byName("imageWithAlt");
	assert.equal(image.options.hotspot, true);
	assert.ok(image.fields.some((f) => f.name === "alt"));
});

test("every field has a description", () => {
	const missing = [];
	const walk = (fields, path) => {
		for (const f of fields ?? []) {
			if (!f.description) missing.push(`${path}.${f.name}`);
			if (f.fields) walk(f.fields, `${path}.${f.name}`);
			for (const m of f.of ?? []) if (m.fields) walk(m.fields, `${path}.${f.name}[]`);
		}
	};
	for (const t of schemaTypes) if (t.fields && t.name !== "imageWithAlt") walk(t.fields, t.name);
	assert.deepEqual(missing, []);
});

test("a link needs the target its kind asks for", async () => {
	const { checkLinkTarget } = await import("./objects/link.js");
	assert.notEqual(checkLinkTarget({ kind: "internal" }), true);
	assert.notEqual(checkLinkTarget({ kind: "external" }), true);
	assert.equal(checkLinkTarget({ kind: "internal", reference: { _ref: "x" } }), true);
	assert.equal(checkLinkTarget({ kind: "external", url: "https://example.com" }), true);
	assert.equal(checkLinkTarget(undefined), true);
});

test("a typed address may be a full address, a page path or a place on the page", async () => {
	const { checkAddress } = await import("./objects/link.js");
	for (const ok of ["https://example.com", "mailto:hi@noster.in", "tel:+919000000000", "/works", "/works/the-atomic", "#contact", undefined]) {
		assert.equal(checkAddress(ok), true, ok);
	}
	for (const bad of ["works", "//evil.example", "/\\evil.example", "#", "ftp://x", "/with space"]) assert.notEqual(checkAddress(bad), true, bad);
});
