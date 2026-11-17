import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { handover, handoverDate, joinNames, locationText, projectFacts, scopeText, sizeText, statusText } from "./project-facts.js";

// Each project's facts as its page listed them in words, beside the details they are now written from.
const PROJECTS = JSON.parse(readFileSync(new URL("./fixtures/project-facts.json", import.meta.url), "utf8"));

/** The same text with any spaces around a line break dropped (they never show). */
const shown = (text) => text.replace(/[ \t]*\n[ \t]*/g, "\n").trim();

test("every project's facts read exactly as before, line breaks included", () => {
	assert.equal(PROJECTS.length, 13);
	for (const { project, brief, details } of PROJECTS) {
		const facts = projectFacts(details);
		assert.deepEqual(
			facts.map((f) => [f.label, shown(f.value)]),
			brief.map((d) => [d.label, shown(d.value)]),
			project,
		);
	}
});

test("names join with & before the last", () => {
	assert.equal(joinNames(["Litmus7"]), "Litmus7");
	assert.equal(joinNames(["Litmus7", "Deep Future Intelligence (DFI)"]), "Litmus7 & Deep Future Intelligence (DFI)");
	assert.equal(joinNames(["A", " B ", null, "C"]), "A, B & C");
	assert.equal(joinNames([]), "");
});

test("status and handover", () => {
	assert.equal(handover({ year: 2024, month: 7 }), "July 2024");
	assert.equal(handover({ year: 2024 }), "2024");
	assert.equal(handover(null), "");
	assert.equal(statusText({ status: "delivered", completion: { year: 2016, month: 11 } }), "Project delivered in\nNovember 2016");
	assert.equal(statusText({ status: "inProgress", completion: { year: 2027, month: 3 } }), "In progress, due\nMarch 2027");
	assert.equal(statusText({ status: "inProgress" }), "In progress");
	assert.equal(handoverDate({ year: 2024, month: 7 }), "2024-07");
	assert.equal(handoverDate({ year: 2024 }), "2024");
	assert.equal(handoverDate(undefined), undefined);
});

test("location, scope and size", () => {
	const place = { area: "Technopark Phase 3", city: { name: "Trivandrum", state: "Kerala" } };
	assert.equal(locationText(place), "Technopark Phase 3,\nTrivandrum, Kerala");
	assert.equal(locationText(place, { oneLine: true, withState: false }), "Technopark Phase 3, Trivandrum");
	assert.equal(locationText({ city: { name: "Kochi" } }), "Kochi");
	assert.equal(scopeText(["Interior Design"]), "Interior Design");
	assert.equal(scopeText(["A", "B", "C", "D"]), "A, B,\nC, D");
	assert.equal(sizeText(44650), "44,650 sq ft");
	assert.equal(sizeText(null), "");
});

test("facts with nothing to say are left out", () => {
	assert.deepEqual(projectFacts({ clients: ["Adesso"] }).map((f) => f.label), ["Client"]);
	assert.deepEqual(projectFacts({}), []);
});
