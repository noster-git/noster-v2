import * as prismic from "@prismicio/client";
import { createClient as baseCreateClient } from "@prismicio/client";
import prismicConfig from "./prismic.config.json";

/**
 * The project's Prismic repository name.
 */
export const repositoryName =
	process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT || prismicConfig.repositoryName;

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param {import("@prismicio/client").ClientConfig} config - Configuration for the Prismic client.
 */
export const createClient = (config = {}) => {
	return baseCreateClient(repositoryName, {
		routes: prismicConfig.routes,
		...config,
	});
};
/**
 * Runs a Prismic query with an optional preview ref and sorts out failures:
 * - document doesn't exist → null (the page shows a 404);
 * - preview ref no longer valid (e.g. an old preview cookie from a release that has since been
 *   published or deleted) → the same query on published content, so the page still loads;
 * - anything else (network, wrong repository, …) is a real error and is thrown, not hidden as a 404.
 *
 * @template T
 * @param {(ref?: string) => Promise<T>} query
 * @param {string} [ref]
 * @returns {Promise<T | null>}
 */
export async function queryOrNull(query, ref) {
	try {
		return await query(ref);
	} catch (error) {
		if (error instanceof prismic.NotFoundError) return null;
		const staleRef =
			error instanceof prismic.RefExpiredError ||
			error instanceof prismic.RefNotFoundError ||
			error instanceof prismic.PreviewTokenExpiredError;
		if (ref && staleRef) return queryOrNull(query);
		throw error;
	}
}
