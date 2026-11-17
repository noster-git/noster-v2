import assert from "node:assert/strict";
import { test } from "node:test";
import { resolve } from "./presentation.js";
import { schemaTypes } from "./schema/index.js";

const hrefs = (state) => state?.locations?.map((l) => l.href);
const DOCUMENT_TYPES = schemaTypes.filter((t) => t.type === "document").map((t) => t.name);

test("every document type lists where it shows", () => {
	assert.deepEqual(Object.keys(resolve.locations).sort(), [...DOCUMENT_TYPES].sort());
});

test("fixed pages point at their own page; what is on every page lists the main pages", () => {
	assert.deepEqual(hrefs(resolve.locations.home), ["/"]);
	assert.deepEqual(hrefs(resolve.locations.works), ["/works"]);
	assert.deepEqual(hrefs(resolve.locations.privacyPolicy), ["/privacy_policy"]);
	for (const type of ["siteSettings", "navigation", "footer", "office", "city"]) assert.deepEqual(hrefs(resolve.locations[type]), ["/", "/works", "/privacy_policy"], type);
	assert.deepEqual(hrefs(resolve.locations.client), ["/", "/works"]);
	for (const type of ["sector", "service"]) assert.ok(resolve.locations[type].message, type);
});

test("a project points at its page, titled with its name, and the Works page", () => {
	const { select, resolve: locate } = resolve.locations.project;
	assert.deepEqual(select, { slug: "slug.current", name: "name" });
	assert.deepEqual(locate({ slug: "orbit-labs", name: " Orbit\nLabs " }).locations, [
		{ title: "Orbit Labs", href: "/works/orbit-labs" },
		{ title: "Works", href: "/works" },
	]);
	assert.equal(locate({ slug: "orbit-labs" }).locations[0].title, "orbit-labs");
	assert.equal(locate({ name: "x" }), null);
	assert.equal(locate(null), null);
});

test("a page built from sections points at its address", () => {
	const { select, resolve: locate } = resolve.locations.page;
	assert.deepEqual(select, { slug: "slug.current", title: "title" });
	assert.deepEqual(locate({ slug: "about", title: "About us" }), { locations: [{ title: "About us", href: "/about" }] });
	assert.equal(locate({ title: "No address yet" }), null);
});

test("each page opens its document", () => {
	const byRoute = Object.fromEntries(resolve.mainDocuments.map((d) => [d.route, d]));
	assert.equal(byRoute["/"].type, "home");
	assert.equal(byRoute["/works"].type, "works");
	assert.equal(byRoute["/privacy_policy"].type, "privacyPolicy");
	const project = byRoute["/works/:slug"];
	assert.equal(project.filter, `_type == "project" && slug.current == $slug`);
	assert.deepEqual(project.params({ origin: "http://localhost", path: "/works/orbit-labs", params: { slug: "orbit-labs" } }), { slug: "orbit-labs" });
	const page = byRoute["/:slug"];
	assert.equal(page.filter, `_type == "page" && slug.current == $slug`);
	assert.deepEqual(page.params({ origin: "http://localhost", path: "/about", params: { slug: "about" } }), { slug: "about" });
	// The fixed pages come first, so /works isn't read as a page called "works".
	assert.ok(resolve.mainDocuments.findIndex((d) => d.route === "/works") < resolve.mainDocuments.findIndex((d) => d.route === "/:slug"));
});
