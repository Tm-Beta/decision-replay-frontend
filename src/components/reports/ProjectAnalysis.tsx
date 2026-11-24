import Link from "next/link";
import { BarChart3, CalendarClock, CheckCircle2, Route } from "lucide-react";
import type { Decision } from "@/types/decision.types";

const monthKey = new Intl.DateTimeFormat("en-CA", {
  year: "numeric", month: "2-digit", timeZone: "Asia/Colombo",
});
const monthLabel = new Intl.DateTimeFormat("en", {
  year: "2-digit", month: "short", timeZone: "Asia/Colombo",
});

export function ProjectAnalysis({ decisions, openPlans, now }: {
  decisions: Decision[];
  openPlans: number;
  now: number;
}) {
  const pending = decisions.filter(decision => !decision.outcome);
  const completed = decisions.length - pending.length;
  const due = pending.filter(decision => {
    const reminder = decision.nextReminder || decision.reviewDate;
    return reminder && Date.parse(reminder) <= now;
  });
  const measured = decisions.flatMap(decision => decision.outcome ? decision.assumptions : [])
    .filter(assumption => assumption.validated != null);
  const met = measured.filter(assumption => assumption.validated).length;
  const months = new Map<string, { label: string; decisions: number; outcomes: number }>();

  function count(timestamp: string, kind: "decisions" | "outcomes") {
    const date = new Date(timestamp);
    const key = monthKey.format(date);
    const month = months.get(key) ?? { label: monthLabel.format(date), decisions: 0, outcomes: 0 };
    month[kind]++;
    months.set(key, month);
  }

  for (const decision of decisions) {
    count(decision.createdAt, "decisions");
    if (decision.outcome) count(decision.outcome.recordedAt, "outcomes");
  }

  const activity = [...months.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  const max = Math.max(1, ...activity.flatMap(([, month]) => [month.decisions, month.outcomes]));

  return <div className="project-analysis">
    <div className="report-stats">
      {[[decisions.length,"Decisions"], [completed,"Outcomes recorded"], [pending.length,"Awaiting outcome"], [openPlans,"Open plans"]].map(([value, label]) =>
        <div key={label}><strong>{value}</strong><span>{label}</span></div>
      )}
    </div>
    <div className="analysis-columns">
      <section className="analysis-panel">
        <h3><BarChart3 size={17} /> Activity by month</h3>
        {activity.length ? <>
          <p className="analysis-legend"><span>Decisions</span><span>Outcomes</span></p>
          <ul className="analysis-chart">
            {activity.map(([key, month]) => <li key={key}>
              <span>{month.label}</span>
              <div className="analysis-bars">
                <div aria-label={month.decisions + " decisions"}><i style={{ width: `${month.decisions / max * 100}%` }} /> <b>{month.decisions}</b></div>
                <div aria-label={month.outcomes + " outcomes"}><i style={{ width: `${month.outcomes / max * 100}%` }} /> <b>{month.outcomes}</b></div>
              </div>
            </li>)}
          </ul>
        </> : <p>No activity recorded yet.</p>}
      </section>
      <section className="analysis-panel">
        <h3>Analysis</h3>
        <div className="analysis-finding">
          <CalendarClock size={17} /><div><strong>{due.length} reviews due</strong>
          {due.slice(0, 3).map(decision => <Link key={decision.id} href={`/decisions/${decision.id}/replay`}>{decision.title} →</Link>)}</div>
        </div>
        <div className="analysis-finding">
          <CheckCircle2 size={17} /><div><strong>{measured.length ? `${met} of ${measured.length} assumptions held` : "No assumptions assessed yet"}</strong>
          {measured.length > 0 && <progress aria-label="Assumptions that held" max={measured.length} value={met} />}</div>
        </div>
        <div className="analysis-finding">
          <Route size={17} /><div><strong>{openPlans} open {openPlans === 1 ? "plan" : "plans"}</strong></div>
        </div>
      </section>
    </div>
  </div>;
}
