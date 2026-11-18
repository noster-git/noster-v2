import { absolute } from "@/lib/site";

// Crawlers that only gather training data for AI models. AI search and answer bots (OAI-SearchBot,
// ChatGPT-User, Claude-SearchBot, PerplexityBot) stay allowed, so the studio can still be found and cited.
const AI_TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bytespider", "Meta-ExternalAgent"];

export default function robots() {
	return {
		rules: [
			{ userAgent: "*", allow: "/", disallow: ["/api/", "/studio"] },
			{ userAgent: AI_TRAINING, disallow: "/" },
		],
		sitemap: absolute("/sitemap.xml"),
	};
}
