const toneClasses: Record<string, string> = {
  critical: "border-[#83524d]/35 bg-[#83524d]/10 text-[#71413d]",
  high: "border-[#94604f]/35 bg-[#94604f]/10 text-[#7b4c3e]",
  "action recommended": "border-[#9a6c42]/35 bg-[#9a6c42]/10 text-[#75502f]",
  medium: "border-[#a8864e]/35 bg-[#a8864e]/10 text-[#745a2b]",
  monitor: "border-[#a8864e]/35 bg-[#a8864e]/10 text-[#745a2b]",
  priority: "border-[#94604f]/35 bg-[#94604f]/10 text-[#7b4c3e]",
  urgent: "border-[#83524d]/35 bg-[#83524d]/10 text-[#71413d]",
  healthy: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  good: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  completed: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  complete: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  resolved: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  published: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  paid: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  succeeded: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  invoiced: "border-[#607568]/30 bg-[#607568]/9 text-[#4d6356]",
  "intake received": "border-[#a8864e]/35 bg-[#a8864e]/9 text-[#745a2b]",
  new: "border-[#a8864e]/35 bg-[#a8864e]/9 text-[#745a2b]",
  "field assessment": "border-[#68767a]/30 bg-[#68767a]/9 text-[#506064]",
  "field draft": "border-[#68767a]/30 bg-[#68767a]/9 text-[#506064]",
  "report draft": "border-[#76688a]/30 bg-[#76688a]/9 text-[#5e506f]",
  open: "border-[#94604f]/30 bg-[#94604f]/9 text-[#7b4c3e]",
  submitted: "border-[#a8864e]/30 bg-[#a8864e]/9 text-[#745a2b]",
  reviewing: "border-[#68767a]/30 bg-[#68767a]/9 text-[#506064]",
  scheduled: "border-[#68767a]/30 bg-[#68767a]/9 text-[#506064]",
  pending: "border-[#68767a]/30 bg-[#68767a]/9 text-[#506064]",
  sent: "border-[#a8864e]/30 bg-[#a8864e]/9 text-[#745a2b]",
  "partially paid": "border-[#a8864e]/30 bg-[#a8864e]/9 text-[#745a2b]",
  overdue: "border-[#83524d]/35 bg-[#83524d]/10 text-[#71413d]",
  failed: "border-[#83524d]/35 bg-[#83524d]/10 text-[#71413d]",
  refunded: "border-[#76688a]/30 bg-[#76688a]/9 text-[#5e506f]",
  "in progress": "border-[#76688a]/30 bg-[#76688a]/9 text-[#5e506f]",
};

export function labelStatus(value: string) {
  return value.replaceAll("_", " ");
}

export function StatusBadge({ value, className = "" }: { value: string; className?: string }) {
  const label = labelStatus(value);
  const tone = toneClasses[label.toLowerCase()] ?? "border-black/15 bg-black/[0.035] text-black/55";

  return <span className={`inline-flex w-fit items-center border px-2.5 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${tone} ${className}`}>{label}</span>;
}
