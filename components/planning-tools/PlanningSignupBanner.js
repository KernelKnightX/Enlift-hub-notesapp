import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function PlanningSignupBanner({
  title = "Save your plan in Student Desk",
  description = "Create a free account to save your timetable, sync tasks across devices, and unlock AI-generated study plans from your weaknesses.",
  href = "/register",
  buttonLabel = "Sign up free",
}) {
  return (
    <div className="planning-signup-banner">
      <div className="planning-signup-banner__content">
        <div className="planning-signup-banner__icon" aria-hidden="true">
          <Sparkles size={18} strokeWidth={1.8} />
        </div>
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
      <Link href={href} className="planning-signup-banner__button">
        {buttonLabel}
        <ArrowRight size={15} strokeWidth={2} />
      </Link>
    </div>
  );
}
