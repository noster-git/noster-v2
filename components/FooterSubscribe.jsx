"use client";

import { useActionState, useEffect, useRef } from "react";
import { subscribe } from "@/lib/subscribe";

/** Footer newsletter sign-up: a bordered email field and button side by side, with a status line under them. */
export default function FooterSubscribe() {
	const [state, action, pending] = useActionState(subscribe, null);
	const input = useRef(null);
	const invalid = state?.ok === false;

	// On an error, put the cursor back in the field so it can be fixed straight away.
	useEffect(() => {
		if (invalid) input.current?.focus();
	}, [state, invalid]);

	return (
		<form action={action} noValidate>
			<label htmlFor="footer-email">Subscribe for occasional updates:</label>
			<div className="mt-[0.5em] flex gap-g">
				<input
					ref={input}
					// Keyed on the returned email: React resets the form after the action, and the new
					// defaultValue keeps what was typed when sign-up fails.
					key={state?.email ?? ""}
					defaultValue={state?.email ?? ""}
					id="footer-email"
					name="email"
					type="email"
					autoComplete="email"
					spellCheck={false}
					required
					placeholder="name@company.com"
					aria-invalid={invalid || undefined}
					aria-describedby="footer-email-status"
					className="h-[2.25em] min-w-0 flex-1 rounded-none border border-current bg-transparent px-[0.6em] placeholder:text-current placeholder:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
				/>
				<button
					type="submit"
					disabled={pending}
					aria-busy={pending || undefined}
					className="h-[2.25em] shrink-0 border border-current px-[0.6em] transition-colors duration-200 hover:bg-black hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50"
				>
					{pending ? "Sending…" : "Subscribe"}
				</button>
			</div>
			<p id="footer-email-status" role="status" className="mt-[0.5em] min-h-[1lh]">
				{state?.message}
			</p>
		</form>
	);
}
