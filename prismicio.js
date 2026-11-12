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