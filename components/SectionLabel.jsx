/**
 * A section's label with its index: a small lime chip numbered in page order ("01", "02"…, counted by CSS:
 * globals.css → .section-index), then the children. The number is decoration; screen readers get the label.
 * Keep the chip out of anything split into lines (data-reveal="lines"): the split's temporary copy would
 * count it twice. For a big heading, pass the heading as a child and `top` to hang the chip at its top.
 */
export default function SectionLabel({ as: Tag = "p", top = false, className = "", children, ...props }) {
	return (
		<Tag className={`flex gap-[0.5em] ${top ? "items-start" : "items-baseline"} ${className}`} {...props}>
			<span aria-hidden="true" className="section-index shrink-0 rounded-chip bg-lime px-[0.35em] text-body text-black tabular-nums" />
			{children}
		</Tag>
	);
}
