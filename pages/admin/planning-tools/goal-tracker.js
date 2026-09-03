import PlanningContentEditor from "@/components/admin/PlanningContentEditor";
import { defaultGoalTrackerContent } from "@/data/planning-tools/goal-tracker-content";

export default function AdminGoalTrackerPage() {
  return (
    <PlanningContentEditor
      pageId="planning-goal-tracker"
      label="Goal Tracker"
      publicPath="/planning-tools/goal-tracker"
      getDefaults={() => defaultGoalTrackerContent}
      subtitle="Edit the goal tracker article sections, banner, and related links."
    />
  );
}
