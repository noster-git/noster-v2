import { stegaClean } from "next-sanity";
import { telHref } from "@/lib/content";
import { item, scope } from "@/lib/sanity/edit";
import { editProps } from "@/lib/sanity/edit-props";
import Ordered from "./Ordered";

/**
 * The studio's email address and phone numbers (Settings), one ruled row each across the full width:
 * "Email" or "Phone" in the first two of six columns, the value from the third. Values are read without the
 * click-to-edit markers, so the addresses stay clean. Other props go on the list (the footer's and the
 * Contact section's entrance attributes).
 * In the studio's live preview the email opens its field; each phone number opens its entry and can be
 * dragged to a new place.
 *
 * @param {{ settings: import("@/lib/settings").Settings | null | undefined, edit: import("@/lib/sanity/edit").Edit } & import("react").ComponentProps<"ul">} props
 */
export default function ContactRows({ settings, edit, className = "", ...rest }) {
	const email = stegaClean(settings?.email)?.trim();
	const phones = scope(edit, "phones");
	const rows = (settings?.phones ?? [])
		.map((p) => ({ key: p._key, value: stegaClean(p.number)?.trim() }))
		.filter((p) => p.value && telHref(p.value));
	if (!email && !rows.length) return null;

	const row = (label, value, href, editValue) => (
		<a
			href={href}
			{...editProps(editValue)}
			className="grid grid-cols-6 items-baseline gap-x-g py-[0.35em] pointer-coarse:min-h-[44px] pointer-coarse:content-center transition-opacity duration-200 hover:opacity-60"
		>
			<span className="col-span-2">{label}</span>
			<span className="col-span-4 min-w-0 text-lead [overflow-wrap:anywhere]">{value}</span>
		</a>
	);

	return (
		<ul {...rest} className={`border-b border-current ${className}`.trim()} {...editProps(phones())}>
			{email && (
				<li className="border-t border-current" data-sanity-drag-disable={edit.doc ? "true" : undefined}>
					{row("Email", email, `mailto:${email}`, edit("email"))}
				</li>
			)}
			<Ordered
				edit={phones}
				items={rows.map((p) => ({
					key: p.key,
					node: (
						<li key={p.key} className="border-t border-current">
							{row("Phone", p.value, telHref(p.value), phones(item(p.key)))}
						</li>
					),
				}))}
			/>
		</ul>
	);
}
