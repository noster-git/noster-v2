import assert from "node:assert/strict";
import { test } from "node:test";
import { of, firstValueFrom, isObservable } from "rxjs";
import { LOCATED_TYPES, resolve } from "./presentation.js";
import { schemaTypes } from "./schema/index.js";

const DOCUMENT_TYPES = schemaTypes.filter((t) => t.type === "document").map((t) => t.name);

/** The locations for a document of `type`, with the live query answered by `data`. */
async function locate(type, data) {
	const asked = [];
	const documentStore = { listenQuery: (query, params, options) => (asked.push({ query, params, options }), of(data)) };
	const state = resolve.locations({ id: `drafts.${type}-1`, type, version: undefined, perspectiveStack: [] }, { documentStore });
	const value = isObservable(state) ? await firstValueFrom(state) : state;
	return { value, hrefs: value?.locations?.map((l) => l.href), asked };
}

test("every document type lists where it shows", () => {
	assert.deepEqual([...LOCATED_TYPES].sort(), [...DOCUMENT_TYPES].sort());
});

test("fixed pages point at their own page; what is on every page lists the main pages", async () => {
	assert.deepEqual((await locate("home")).hrefs, ["/"]);
	assert.deepEqual((await locate("works")).hrefs, ["/works"]);
	assert.deepEqual((await locate("privacyPolicy")).hrefs, ["/privacy_policy"]);
	for (const type of ["siteSettings", "navigation", "footer", "office"]) assert.deepEqual((await locate(type)).hrefs, ["/", "/works", "/privacy_policy"], type);
});

test("a project shows on its page, titled with its name, on Home and on the Works page", async () => {
	const { value, asked } = await locate("project", { slug: "orbit-labs", name: " Orbit\nLabs " });
	assert.deepEqual(value.locations, [
		{ title: "Orbit Labs", href: "/works/orbit-labs" },
		{ title: "Home", href: "/" },
		{ title: "Works", href: "/works" },
	]);
	assert.deepEqual(asked[0].params, { id: "project-1" });
	assert.equal((await locate("project", { slug: "orbit-labs" })).value.locations[0].title, "orbit-labs");
	assert.equal((await locate("project", { name: "x" })).value, null);
});

test("a page built from sections shows at its address", async () => {
	assert.deepEqual((await locate("page", { slug: "about", title: "About us" })).value, { locations: [{ title: "About us", href: "/about" }] });
	assert.equal((await locate("page", { title: "No address yet" })).value, null);
});

test("library records show where their projects do", async () => {
	const projects = [{ name: "Adesso", slug: "adesso" }, { name: "Mozanta", slug: "mozanta" }];
	assert.deepEqual((await locate("client", projects)).hrefs, ["/", "/works/adesso", "/works/mozanta"]);
	assert.deepEqual((await locate("city", projects)).hrefs, ["/", "/works", "/privacy_policy", "/works/adesso", "/works/mozanta"]);
	assert.deepEqual((await locate("sector", projects)).hrefs, ["/works/adesso", "/works/mozanta"]);
	const unused = await locate("service", []);
	assert.equal(unused.value.locations, undefined);
	assert.ok(unused.value.message);
	assert.match(unused.asked[0].query, /references\(\$id\)/);
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
