/**
 * The document a fetch found, or null when there is none: a page whose document is missing (not yet
 * published, or a slug no project has) renders its fallback or a 404 instead of failing.
 *
 * @template T
 * @param {Promise<{ data?: T | null }>} fetching
 * @returns {Promise<T | null>}
 */
export async function dataOrNull(fetching) {
	const result = await fetching;
	return result?.data ?? null;
}
