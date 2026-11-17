"use client";

import { useEffect } from "react";
import LineCta from "@/components/LineCta";

/**
 * A page that failed to render, inside the site's nav and footer: the same look as the 404, with a way
 * to try the page again (retry fetches and renders it afresh) and a way home.
 */
export default function Error({ error, retry }) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<>
			<div className="grid-site items-start px-m pt-page pb-4">
				<h1 className="col-span-5 text-title desk:col-span-6">Something went wrong</h1>
				<p className="col-span-5 mt-2 text-muted desk:col-span-6">
					This page didn&apos;t load.{" "}
					{/* A lone inline action: underlined; keyboard focus thickens the underline, no box. */}
					<button
						type="button"
						onClick={() => retry()}
						className="hit cursor-pointer text-black underline underline-offset-2 transition-opacity duration-200 hover:opacity-50 focus-visible:decoration-2 focus-visible:outline-none"
					>
						Try again
					</button>
				</p>
			</div>
			<LineCta href="/">Back to home</LineCta>
		</>
	);
}
