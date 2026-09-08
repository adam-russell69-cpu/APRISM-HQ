export type PortalProperty = {
  id: string; name: string; location: string; type: string; size: string; built: string;
  health: string; summary: string | null; createdAt: string; updatedAt: string;
};

export type PortalSystem = {
  id: string; propertyId: string; name: string; category: string; manufacturer: string | null;
  modelNumber: string | null; status: string; installedOn: string | null;
  warrantyExpiresOn: string | null; serviceInterval: string | null; notes: string | null; updatedAt: string;
};

export type PortalInspection = {
  id: string; propertyId: string; type: string; status: string; health: string;
  scheduledFor: string; completedAt: string | null; summary: string | null; updatedAt: string;
};

export type PortalInspectionItem = {
  id: string; inspectionId: string; title: string; area: string | null; status: string;
  observation: string | null; recommendation: string | null; photoCount: number;
};

export type PortalMaintenanceTask = {
  id: string; propertyId: string; propertySystemId: string | null; vendorId: string | null;
  title: string; description: string | null; status: string; priority: string; dueDate: string | null;
  completedAt: string | null; recurrence: string | null; updatedAt: string;
};

export type PortalIssue = {
  id: string; propertyId: string; inspectionId: string | null; assignedVendorId: string | null;
  title: string; description: string | null; status: string; severity: string;
  resolvedAt: string | null; createdAt: string; updatedAt: string;
};

export type PortalDocument = {
  id: string; propertyId: string; name: string; category: string; mimeType: string | null;
  sizeBytes: number | null; updatedAt: string;
};

export type PortalVendor = { id: string; name: string; trade: string; primaryContact: string | null };
export type PortalPropertyVendor = { id: string; propertyId: string; vendorId: string; scope: string | null; isPreferred: boolean };
export type PortalServiceRequest = {
  id: string; propertyId: string; category: string; title: string; description: string;
  preferredTiming: string | null; status: string; createdAt: string; updatedAt: string;
};

export type PortalSnapshot = {
  mode: "preview" | "live"; errorMessage: string | null; properties: PortalProperty[];
  systems: PortalSystem[]; inspections: PortalInspection[]; inspectionItems: PortalInspectionItem[];
  maintenanceTasks: PortalMaintenanceTask[]; issues: PortalIssue[]; documents: PortalDocument[];
  vendors: PortalVendor[]; propertyVendors: PortalPropertyVendor[]; serviceRequests: PortalServiceRequest[];
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Denver" });
const shortDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Denver" });

function parseDate(value: string) {
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
}

export function formatDate(value: string | null | undefined, fallback = "Not scheduled") {
  if (!value) return fallback;
  const date = parseDate(value);
  return Number.isNaN(date.valueOf()) ? fallback : dateFormatter.format(date);
}

export function formatShortDate(value: string | null | undefined, fallback = "TBD") {
  if (!value) return fallback;
  const date = parseDate(value);
  return Number.isNaN(date.valueOf()) ? fallback : shortDateFormatter.format(date);
}

export function formatMonthDay(value: string | null | undefined) {
  const [month = "TBD", day = ""] = formatShortDate(value).split(" ");
  return { month, day };
}

export function humanizeStatus(value: string | null | undefined, fallback = "Pending") {
  if (!value) return fallback;
  const label = value.trim().replace(/[_-]+/g, " ").toLowerCase();
  return label.replace(/\b\w/g, (character) => character.toUpperCase());
}

export function healthLabel(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "healthy") return "Healthy";
  if (normalized === "critical") return "Critical";
  if (normalized === "action_recommended" || normalized === "action_required") return "Action Recommended";
  return "Monitor";
}

export function isClosedStatus(value: string) {
  return ["closed", "completed", "resolved", "cancelled", "canceled"].includes(value.trim().toLowerCase());
}

export function formatFileSize(sizeBytes: number | null) {
  if (sizeBytes === null) return null;
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

const previewProperty: PortalProperty = {
  id: "silver-pine", name: "Silver Pine Residence", location: "Deer Valley, Utah", type: "Second home",
  size: "6,850 sq. ft.", built: "2021", health: "Monitor",
  summary: "A current operating view of the residence, its systems, and coordinated care.",
  createdAt: "2025-04-01T12:00:00Z", updatedAt: "2026-08-24T12:00:00Z",
};

export const previewPortalSnapshot: PortalSnapshot = {
  mode: "preview",
  errorMessage: null,
  properties: [previewProperty],
  systems: [
    { id: "climate", propertyId: previewProperty.id, name: "Climate & HVAC", category: "Climate", manufacturer: null, modelNumber: null, status: "Healthy", installedOn: null, warrantyExpiresOn: null, serviceInterval: "Annual", notes: "2 boilers, 4 air handlers, and radiant heat", updatedAt: "2026-07-18T12:00:00Z" },
    { id: "water", propertyId: previewProperty.id, name: "Water & Leak Protection", category: "Plumbing", manufacturer: "Flo", modelNumber: null, status: "Healthy", installedOn: null, warrantyExpiresOn: null, serviceInterval: "Quarterly", notes: "Whole-home monitoring and 8 zone sensors", updatedAt: "2026-08-23T12:00:00Z" },
    { id: "smart-home", propertyId: previewProperty.id, name: "Smart Home", category: "Automation", manufacturer: "Savant", modelNumber: null, status: "Monitor", installedOn: null, warrantyExpiresOn: null, serviceInterval: "As needed", notes: "Lutron lighting and access control", updatedAt: "2026-08-21T12:00:00Z" },
    { id: "snowmelt", propertyId: previewProperty.id, name: "Exterior & Snow Melt", category: "Exterior", manufacturer: null, modelNumber: null, status: "Action Recommended", installedOn: null, warrantyExpiresOn: null, serviceInterval: "Seasonal", notes: "Drive, entry, and patio zones", updatedAt: "2026-08-23T12:00:00Z" },
  ],
  inspections: [
    { id: "inspection-1", propertyId: previewProperty.id, type: "Scheduled property inspection", status: "Completed", health: "Monitor", scheduledFor: "2026-08-23T15:00:00Z", completedAt: "2026-08-23T17:00:00Z", summary: "Routine inspection completed with two follow-up items.", updatedAt: "2026-08-23T17:00:00Z" },
    { id: "inspection-2", propertyId: previewProperty.id, type: "Scheduled property inspection", status: "Completed", health: "Healthy", scheduledFor: "2026-08-09T15:00:00Z", completedAt: "2026-08-09T17:00:00Z", summary: "All observed systems operating normally.", updatedAt: "2026-08-09T17:00:00Z" },
    { id: "inspection-3", propertyId: previewProperty.id, type: "Post-storm inspection", status: "Completed", health: "Healthy", scheduledFor: "2026-07-26T15:00:00Z", completedAt: "2026-07-26T16:00:00Z", summary: "No storm-related damage observed.", updatedAt: "2026-07-26T16:00:00Z" },
    { id: "inspection-4", propertyId: previewProperty.id, type: "Scheduled property inspection", status: "Completed", health: "Healthy", scheduledFor: "2026-07-12T15:00:00Z", completedAt: "2026-07-12T17:00:00Z", summary: "Routine inspection completed.", updatedAt: "2026-07-12T17:00:00Z" },
    { id: "inspection-next", propertyId: previewProperty.id, type: "Scheduled property inspection", status: "Scheduled", health: "Monitor", scheduledFor: "2026-09-06T15:00:00Z", completedAt: null, summary: null, updatedAt: "2026-08-24T12:00:00Z" },
  ],
  inspectionItems: [
    { id: "item-1", inspectionId: "inspection-1", title: "South patio snowmelt", area: "Exterior", status: "Action Recommended", observation: "Pressure variance observed at the south patio zone.", recommendation: "Complete a pre-season pressure test.", photoCount: 1 },
    { id: "item-2", inspectionId: "inspection-1", title: "Primary suite shade", area: "Primary suite", status: "Monitor", observation: "Shade was intermittently offline during testing.", recommendation: "Review the gateway and shade controller.", photoCount: 1 },
    { id: "item-3", inspectionId: "inspection-1", title: "Mechanical room", area: "Mechanical", status: "Healthy", observation: "Equipment area was orderly with no visible leaks.", recommendation: null, photoCount: 1 },
  ],
  maintenanceTasks: [
    { id: "task-1", propertyId: previewProperty.id, propertySystemId: "climate", vendorId: "vendor-1", title: "Boiler pre-season service", description: "Annual pre-season service for both boilers.", status: "Scheduled", priority: "Normal", dueDate: "2026-09-12", completedAt: null, recurrence: "Annual", updatedAt: "2026-08-24T12:00:00Z" },
    { id: "task-2", propertyId: previewProperty.id, propertySystemId: "snowmelt", vendorId: "vendor-1", title: "Snowmelt system pressure test", description: "Test drive, entry, and patio zones before the winter season.", status: "Coordination", priority: "High", dueDate: "2026-09-18", completedAt: null, recurrence: "Annual", updatedAt: "2026-08-24T12:00:00Z" },
    { id: "task-3", propertyId: previewProperty.id, propertySystemId: null, vendorId: null, title: "Whole-home generator exercise", description: "Scheduled generator exercise and operating check.", status: "Upcoming", priority: "Normal", dueDate: "2026-10-02", completedAt: null, recurrence: "Quarterly", updatedAt: "2026-08-24T12:00:00Z" },
    { id: "task-4", propertyId: previewProperty.id, propertySystemId: null, vendorId: "vendor-3", title: "Fireplace and flue inspection", description: "Seasonal fireplace safety inspection.", status: "Upcoming", priority: "Normal", dueDate: "2026-10-07", completedAt: null, recurrence: "Annual", updatedAt: "2026-08-24T12:00:00Z" },
  ],
  issues: [
    { id: "issue-1", propertyId: previewProperty.id, inspectionId: "inspection-1", assignedVendorId: "vendor-1", title: "South patio snowmelt pressure variance", description: "Pressure variance observed during the latest inspection.", status: "In progress", severity: "Action Recommended", resolvedAt: null, createdAt: "2026-08-23T17:00:00Z", updatedAt: "2026-08-24T12:00:00Z" },
    { id: "issue-2", propertyId: previewProperty.id, inspectionId: "inspection-1", assignedVendorId: "vendor-2", title: "Primary suite shade intermittently offline", description: "The primary shade intermittently failed to respond.", status: "Monitoring", severity: "Monitor", resolvedAt: null, createdAt: "2026-08-21T17:00:00Z", updatedAt: "2026-08-24T12:00:00Z" },
  ],
  documents: [
    { id: "document-1", propertyId: previewProperty.id, name: "2026 Property Stewardship Plan", category: "Plan", mimeType: "application/pdf", sizeBytes: null, updatedAt: "2026-08-24T12:00:00Z" },
    { id: "document-2", propertyId: previewProperty.id, name: "Boiler Service Record", category: "Service record", mimeType: "application/pdf", sizeBytes: null, updatedAt: "2026-07-18T12:00:00Z" },
    { id: "document-3", propertyId: previewProperty.id, name: "Savant System Overview", category: "System document", mimeType: "application/pdf", sizeBytes: null, updatedAt: "2026-06-04T12:00:00Z" },
    { id: "document-4", propertyId: previewProperty.id, name: "Builder Closeout & Warranty Register", category: "Warranty", mimeType: "application/pdf", sizeBytes: null, updatedAt: "2026-05-22T12:00:00Z" },
  ],
  vendors: [
    { id: "vendor-1", name: "Wasatch Mechanical", trade: "HVAC & hydronics", primaryContact: "Mara Collins" },
    { id: "vendor-2", name: "Highline Automation", trade: "Savant & Lutron", primaryContact: "Evan Lee" },
    { id: "vendor-3", name: "Summit Fire & Chimney", trade: "Fireplace systems", primaryContact: "Dispatch" },
  ],
  propertyVendors: [
    { id: "property-vendor-1", propertyId: previewProperty.id, vendorId: "vendor-1", scope: "Climate and snowmelt", isPreferred: true },
    { id: "property-vendor-2", propertyId: previewProperty.id, vendorId: "vendor-2", scope: "Home automation", isPreferred: true },
    { id: "property-vendor-3", propertyId: previewProperty.id, vendorId: "vendor-3", scope: "Fireplace systems", isPreferred: true },
  ],
  serviceRequests: [
    { id: "request-1", propertyId: previewProperty.id, category: "Arrival preparation", title: "Arrival preparation · Labor Day", description: "Prepare the residence for arrival.", preferredTiming: "Before Labor Day", status: "Completed", createdAt: "2026-08-26T12:00:00Z", updatedAt: "2026-08-28T12:00:00Z" },
    { id: "request-2", propertyId: previewProperty.id, category: "Repair / troubleshooting", title: "Primary shade troubleshooting", description: "Coordinate shade troubleshooting.", preferredTiming: "This week", status: "In progress", createdAt: "2026-08-21T12:00:00Z", updatedAt: "2026-08-24T12:00:00Z" },
    { id: "request-3", propertyId: previewProperty.id, category: "Maintenance", title: "Garage vehicle tender check", description: "Confirm tender operation.", preferredTiming: null, status: "Completed", createdAt: "2026-08-09T12:00:00Z", updatedAt: "2026-08-10T12:00:00Z" },
  ],
};
