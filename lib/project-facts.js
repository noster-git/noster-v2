// A project's facts (client, sector, status, location, scope, size) as the site writes them, from the
// project's linked records and fields. Plain values in, plain text out: no click-to-edit markers, so callers
// pass values read without them (stegaClean).

export const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * @typedef {{
 *   clients?: Array<string | null> | null,
 *   sectors?: Array<string | null> | null,
 *   area?: string | null,
 *   city?: { name?: string | null, state?: string | null } | null,
 *   status?: "delivered" | "inProgress" | null,
 *   completion?: { year?: number | null, month?: number | null } | null,
 *   services?: Array<string | null> | null,
 *   size?: number | null,
 * }} ProjectDetails The project's details, each linked record by its name.
 */

const names = (list) => (list ?? []).map((name) => name?.replace(/\s+/g, " ").trim()).filter(Boolean);

/**
 * Names as a list in words: "A", "A & B", "A, B & C".
 *
 * @param {Array<string | null> | null | undefined} list
 */
export function joinNames(list) {
	const all = names(list);
	if (all.length < 2) return all[0] ?? "";
	return `${all.slice(0, -1).join(", ")} & ${all.at(-1)}`;
}

/**
 * "July 2024", or just the year when no month is set; "" without a year.
 *
 * @param {ProjectDetails["completion"]} completion
 */
export function handover(completion) {
	const year = completion?.year;
	if (!year) return "";
	const month = MONTHS[(completion.month ?? 0) - 1];
	return month ? `${month} ${year}` : String(year);
}

/**
 * "Project delivered in\nJuly 2024" (the line break before the date), or "In progress, due\nJuly 2024".
 *
 * @param {Pick<ProjectDetails, "status" | "completion">} project
 */
export function statusText({ status, completion }) {
	const when = handover(completion);
	if (status === "inProgress") return when ? `In progress, due\n${when}` : "In progress";
	return when ? `Project delivered in\n${when}` : "Project delivered";
}

/**
 * "Infopark,\nKochi, Kerala": the area on the first line, then the city and its state. Without the line
 * break when `oneLine`, and without the state when `withState` is false ("Infopark, Kochi").
 *
 * @param {Pick<ProjectDetails, "area" | "city">} project
 * @param {{ oneLine?: boolean, withState?: boolean }} [options]
 */
export function locationText({ area, city }, { oneLine = false, withState = true } = {}) {
	const place = [city?.name, withState ? city?.state : null].map((part) => part?.trim()).filter(Boolean).join(", ");
	const first = area?.replace(/\s+/g, " ").trim();
	if (!first) return place;
	if (!place) return first;
	return `${first},${oneLine ? " " : "\n"}${place}`;
}

/**
 * The services as a list over two lines, the break after the first half (rounded down): "Interior Design,\nConstruction, Furniture Design".
 *
 * @param {Array<string | null> | null | undefined} services
 */
export function scopeText(services) {
	const all = names(services);
	if (all.length < 2) return all[0] ?? "";
	const half = Math.floor(all.length / 2);
	return `${all.slice(0, half).join(", ")},\n${all.slice(half).join(", ")}`;
}

/**
 * "13,000 sq ft"; "" without a size.
 *
 * @param {number | null | undefined} size
 */
export function sizeText(size) {
	return size ? `${Math.round(size).toLocaleString("en-IN")} sq ft` : "";
}

/**
 * The facts listed beside a project's text, in order, each with the field it is edited in; facts with no
 * value are left out.
 *
 * @param {ProjectDetails} project
 * @returns {Array<{ label: string, value: string, field: string }>}
 */
export function projectFacts(project) {
	return [
		{ label: "Client", value: joinNames(project.clients), field: "clients" },
		{ label: "Sector", value: names(project.sectors).join(", "), field: "sectors" },
		{ label: "Status", value: project.status || project.completion?.year ? statusText(project) : "", field: "status" },
		{ label: "Location", value: locationText(project), field: "area" },
		{ label: "Scope", value: scopeText(project.services), field: "services" },
		{ label: "Scale", value: sizeText(project.size), field: "size" },
	].filter((fact) => fact.value);
}

/**
 * The handover as a schema.org date: "2024-07", or "2024" without a month.
 *
 * @param {ProjectDetails["completion"]} completion
 */
export function handoverDate(completion) {
	if (!completion?.year) return undefined;
	return completion.month ? `${completion.year}-${String(completion.month).padStart(2, "0")}` : String(completion.year);
}
