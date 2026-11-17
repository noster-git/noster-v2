"use client";

import "./globals.css";

// Underlined text actions: keyboard focus thickens the underline, no box.
const ACTION = "cursor-pointer underline underline-offset-2 focus-visible:decoration-2 focus-visible:outline-none";
const ACTION_STYLE = { padding: 0, border: 0, background: "none", font: "inherit", color: "inherit", textDecorationLine: "underline" };

/**
 * Shown when the root layout itself fails: it replaces the whole document, so it brings its own <html>,
 * <body> and title. Plain inline styles keep it readable even if the site's styles don't load.
 */
export default function GlobalError({ retry }) {
	return (
		<html lang="en">
			<body style={{ margin: 0, padding: "84px 24px", background: "#ffffff", color: "#000000", fontFamily: "system-ui, sans-serif" }}>
				<title>Something went wrong | Noster</title>
				<h1 style={{ margin: 0, fontSize: 32, fontWeight: 300, lineHeight: 1.1 }}>Something went wrong</h1>
				<p style={{ margin: "16px 0 0" }}>This page didn&apos;t load.</p>
				<p style={{ display: "flex", gap: 24, margin: "16px 0 0" }}>
					<button type="button" onClick={() => retry()} className={ACTION} style={ACTION_STYLE}>
						Try again
					</button>
					{/* A full page load: the app around this page is what failed. */}
					{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
					<a href="/" className={ACTION} style={ACTION_STYLE}>
						Back to home
					</a>
				</p>
			</body>
		</html>
	);
}
