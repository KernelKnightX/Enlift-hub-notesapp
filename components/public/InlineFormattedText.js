import Link from "next/link";
import { renderInlineFormattedText } from "@/lib/upscCalendarContent";

export default function InlineFormattedText({ text, className }) {
  const parts = renderInlineFormattedText(text);

  return (
    <span className={className}>
      {parts.map((part) => {
        if (part.type === "strong") {
          return <strong key={part.key}>{part.value}</strong>;
        }
        if (part.type === "link") {
          const isExternal = /^https?:\/\//i.test(part.href);
          if (isExternal) {
            return (
              <a key={part.key} href={part.href} target="_blank" rel="noopener noreferrer">
                {part.label}
              </a>
            );
          }
          return (
            <Link key={part.key} href={part.href}>
              {part.label}
            </Link>
          );
        }
        return <span key={part.key}>{part.value}</span>;
      })}
    </span>
  );
}
