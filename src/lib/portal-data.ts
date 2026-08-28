export const demoProperty = {
  id: "silver-pine",
  name: "Silver Pine Residence",
  location: "Deer Valley, Utah",
  type: "Second home",
  size: "6,850 sq. ft.",
  built: "2021",
  health: "Monitor",
  lastInspection: "August 23, 2026",
  nextVisit: "September 6, 2026",
  openIssues: 2,
  upcomingMaintenance: 4,
};

export const propertySystems = [
  { name: "Climate & HVAC", detail: "2 boilers · 4 air handlers · radiant heat", status: "Healthy", service: "Serviced July 18" },
  { name: "Water & Leak Protection", detail: "Flo monitoring · 8 zone sensors", status: "Healthy", service: "Tested August 23" },
  { name: "Smart Home", detail: "Lutron · Savant · access control", status: "Monitor", service: "Gateway review due" },
  { name: "Exterior & Snow Melt", detail: "Drive, entry, and patio zones", status: "Action Recommended", service: "Pressure check scheduled" },
];

export const maintenanceItems = [
  { title: "Boiler pre-season service", date: "Sep 12", category: "Climate", status: "Scheduled" },
  { title: "Snowmelt system pressure test", date: "Sep 18", category: "Exterior", status: "Coordination" },
  { title: "Whole-home generator exercise", date: "Oct 02", category: "Electrical", status: "Upcoming" },
  { title: "Fireplace and flue inspection", date: "Oct 07", category: "Seasonal", status: "Upcoming" },
];

export const issues = [
  { title: "South patio snowmelt pressure variance", severity: "Action Recommended", opened: "Aug 23", owner: "Wasatch Mechanical" },
  { title: "Primary suite shade intermittently offline", severity: "Monitor", opened: "Aug 21", owner: "Highline Automation" },
];

export const inspections = [
  { date: "Aug 23, 2026", type: "Scheduled property inspection", result: "Monitor", items: "42 items", report: "Report available" },
  { date: "Aug 09, 2026", type: "Scheduled property inspection", result: "Healthy", items: "39 items", report: "Report available" },
  { date: "Jul 26, 2026", type: "Post-storm inspection", result: "Healthy", items: "18 items", report: "Report available" },
  { date: "Jul 12, 2026", type: "Scheduled property inspection", result: "Healthy", items: "40 items", report: "Report available" },
];

export const documents = [
  { name: "2026 Property Stewardship Plan", type: "Plan", updated: "Aug 24, 2026" },
  { name: "Boiler Service Record", type: "Service record", updated: "Jul 18, 2026" },
  { name: "Savant System Overview", type: "System document", updated: "Jun 04, 2026" },
  { name: "Builder Closeout & Warranty Register", type: "Warranty", updated: "May 22, 2026" },
];

export const vendors = [
  { name: "Wasatch Mechanical", specialty: "HVAC & hydronics", contact: "Mara Collins" },
  { name: "Highline Automation", specialty: "Savant & Lutron", contact: "Evan Lee" },
  { name: "Summit Fire & Chimney", specialty: "Fireplace systems", contact: "Dispatch" },
];

export const serviceHistory = [
  { date: "Aug 23", title: "Property inspection completed", detail: "42 checkpoints · 2 follow-up items" },
  { date: "Jul 18", title: "Annual boiler service", detail: "Completed by Wasatch Mechanical" },
  { date: "Jun 04", title: "Smart-home firmware review", detail: "Savant controller updated" },
  { date: "May 22", title: "Spring exterior walk", detail: "Drainage and envelope observations documented" },
];
