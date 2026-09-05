import Link from "next/link";
import { renderInlineFormattedText } from "@/lib/upscCalendarContent";
import { isExternalHref, sanitizeHref } from "@/lib/safeUrl";

export default function InlineFormattedText({ text, className }) {
  const parts = renderInlineFormattedText(text);

  return (
    <span className={className}>
      {parts.map((part) => {
        if (part.type === "strong") {
          return <strong key={part.key}>{part.value}</strong>;
        }
        if (part.type === "link") {
          const href = sanitizeHref(part.href);
          if (!href) {
            return <span key={part.key}>{part.label}</span>;
          }
          if (isExternalHref(href)) {
            return (
              <a key={part.key} href={href} target="_blank" rel="noopener noreferrer">
                {part.label}
              </a>
            );
          }
          return (
            <Link key={part.key} href={href}>
              {part.label}
            </Link>
          );
        }
        return <span key={part.key}>{part.value}</span>;
      })}
    </span>
  );
}
