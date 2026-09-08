import { Check } from "lucide-react";

const steps = ["Intake", "Field Assessment", "Report", "Complete"] as const;

export function assessmentStep(status: string) {
  if (["completed", "published"].includes(status)) return 3;
  if (status === "report_draft") return 2;
  if (["field_draft", "scheduled"].includes(status)) return 1;
  return 0;
}

export function WorkflowStepper({ status }: { status: string }) {
  const current = assessmentStep(status);
  return <ol className="grid gap-2 sm:grid-cols-4" aria-label="Assessment workflow">
    {steps.map((step, index) => {
      const complete = index < current;
      const active = index === current;
      return <li key={step} className={`flex min-h-14 items-center gap-3 border px-3.5 ${active ? "border-[#9a793e] bg-[#9a793e]/8" : complete ? "border-[#66776c]/25 bg-[#66776c]/7" : "border-black/10 bg-white"}`} aria-current={active ? "step" : undefined}>
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${active ? "bg-[#171a19] text-white" : complete ? "bg-[#65786c] text-white" : "bg-black/5 text-black/42"}`}>{complete ? <Check aria-hidden="true" className="size-3.5" /> : index + 1}</span>
        <span className={`text-xs font-semibold ${active ? "text-black/80" : "text-black/48"}`}>{step}</span>
      </li>;
    })}
  </ol>;
}
