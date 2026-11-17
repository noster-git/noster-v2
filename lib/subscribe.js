"use server";

import { NEWSLETTER } from "@/lib/site";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Adds an email to the mailing list. The one place the newsletter provider plugs in.
 * TODO: connect the provider (Mailchimp, Resend, etc.), then turn SUBSCRIBE on in components/Footer.jsx.
 */
async function addSubscriber(email) {
	throw new Error(`Newsletter provider not connected (${email.length} chars received)`);
}

/**
 * Server action for the footer's subscribe form (used with useActionState).
 * A failure hands the email back so the field keeps it (React resets the form after every action).
 */
export async function subscribe(_prev, formData) {
	if (!NEWSLETTER) return { ok: false, message: "Sign-up isn’t open yet." };
	// A bot filled the field people never see (FooterSubscribe): look done, add nothing.
	if (formData.get("company")) return { ok: true, message: "Thanks, you’re on the list." };
	const email = String(formData.get("email") ?? "").trim();
	// 254 characters is the longest an email address can be.
	if (email.length > 254 || !EMAIL.test(email)) return { ok: false, email, message: "Enter an email address like name@company.com." };
	try {
		await addSubscriber(email);
		return { ok: true, message: "Thanks, you’re on the list." };
	} catch (err) {
		console.error("[subscribe]", err);
		return { ok: false, email, message: "Couldn’t sign you up just now. Try again in a few minutes." };
	}
}
