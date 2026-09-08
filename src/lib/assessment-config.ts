export type AssessmentField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: string[];
  placeholder?: string;
};

export type AssessmentSection = {
  title: string;
  eyebrow: string;
  description: string;
  fields: AssessmentField[];
};

export const intakeSections: AssessmentSection[] = [
  {
    eyebrow: "01",
    title: "Property identity",
    description: "The residence and setting we are preparing to understand.",
    fields: [
      { name: "property_name", label: "Property / residence name", placeholder: "Optional" },
      { name: "property_address", label: "Property address", required: true },
      { name: "community", label: "Community / neighborhood" },
      { name: "hoa", label: "HOA / association" },
      { name: "year_built", label: "Year built", type: "number" },
      { name: "square_feet", label: "Approximate square feet", type: "number" },
    ],
  },
  {
    eyebrow: "02",
    title: "Owner & contact information",
    description: "Primary contacts and the communication rhythm you prefer.",
    fields: [
      { name: "owner_name", label: "Owner / primary contact", required: true },
      { name: "co_owner", label: "Co-owner / additional contact" },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Mobile phone", type: "tel", required: true },
      { name: "preferred_contact", label: "Preferred contact method / best times", type: "textarea" },
    ],
  },
  {
    eyebrow: "03",
    title: "Occupancy & use pattern",
    description: "How the property is occupied, visited, and prepared through the year.",
    fields: [
      { name: "property_use", label: "Property use", type: "select", required: true, options: ["Primary residence", "Second home", "Occasional rental", "Other"] },
      { name: "occupancy_pattern", label: "Typical occupancy / travel pattern", type: "textarea", required: true },
      { name: "arrival_preferences", label: "Arrival, departure, or guest-readiness preferences", type: "textarea" },
    ],
  },
  {
    eyebrow: "04",
    title: "Access information",
    description: "Share operational context without including alarm passwords or sensitive codes.",
    fields: [
      { name: "access_method", label: "Preferred property access method", type: "textarea" },
      { name: "gate_entry_notes", label: "Gate / entry notes", type: "textarea" },
      { name: "key_garage_notes", label: "Key, lockbox, or garage access notes", type: "textarea" },
      { name: "authorized_people", label: "People authorized to enter", type: "textarea", placeholder: "Family, housekeepers, vendors, caretakers, contractors" },
    ],
  },
  {
    eyebrow: "05",
    title: "Emergency contacts",
    description: "Local relationships APRISM should know before a time-sensitive condition arises.",
    fields: [
      { name: "emergency_contact", label: "Local emergency contact" },
      { name: "emergency_phone", label: "Emergency contact phone", type: "tel" },
      { name: "emergency_notes", label: "Preferred local contact / medical / other notes", type: "textarea" },
    ],
  },
  {
    eyebrow: "06",
    title: "Exterior & property information",
    description: "Site, envelope, snow exposure, drainage, and exterior conditions.",
    fields: [{ name: "exterior_information", label: "Exterior, roof, drainage, snow, access, and known site conditions", type: "textarea" }],
  },
  {
    eyebrow: "07",
    title: "HVAC, heating & cooling",
    description: "Heating, cooling, radiant, snowmelt, controls, and service history.",
    fields: [{ name: "hvac_information", label: "Systems, known issues, recent repairs, warranties, and service providers", type: "textarea" }],
  },
  {
    eyebrow: "08",
    title: "Plumbing & water systems",
    description: "Water supply, treatment, drainage, shutoffs, well or septic systems.",
    fields: [
      { name: "plumbing_information", label: "Plumbing, water treatment, well / septic, and known concerns", type: "textarea" },
      { name: "water_shutoff", label: "Main water shutoff location", type: "textarea" },
      { name: "gas_shutoff", label: "Gas shutoff / propane notes", type: "textarea" },
    ],
  },
  {
    eyebrow: "09",
    title: "Electrical & backup power",
    description: "Service panels, generator, solar, batteries, and essential power needs.",
    fields: [
      { name: "electrical_information", label: "Electrical service, generator, solar / battery, and known concerns", type: "textarea" },
      { name: "electrical_panel", label: "Main electrical panel location", type: "textarea" },
    ],
  },
  {
    eyebrow: "10",
    title: "Fire & life safety",
    description: "Smoke and CO detection, extinguishers, suppression, and egress considerations.",
    fields: [{ name: "life_safety_information", label: "Fire / life-safety systems, service history, and known concerns", type: "textarea" }],
  },
  {
    eyebrow: "11",
    title: "Security & access control",
    description: "Monitoring relationships, cameras, gates, locks, and smart access.",
    fields: [
      { name: "security_provider", label: "Alarm / security provider and phone" },
      { name: "security_information", label: "Security, cameras, gates, locks, and access-control notes", type: "textarea" },
    ],
  },
  {
    eyebrow: "12",
    title: "Appliances & major equipment",
    description: "Household equipment, specialty rooms, lifts, network, and smart-home systems.",
    fields: [{ name: "equipment_information", label: "Major appliances, equipment, smart-home, network, and specialty-system notes", type: "textarea" }],
  },
  {
    eyebrow: "13",
    title: "Spa, pool & hot tub",
    description: "Water-care equipment, service schedules, covers, and seasonal procedures.",
    fields: [{ name: "spa_pool_information", label: "Spa / pool / hot-tub systems and service information", type: "textarea", placeholder: "If applicable" }],
  },
  {
    eyebrow: "14",
    title: "Landscaping & irrigation",
    description: "Irrigation, snow removal, defensible space, and seasonal exterior care.",
    fields: [{ name: "landscape_information", label: "Landscaping, irrigation, snow removal, and seasonal notes", type: "textarea" }],
  },
  {
    eyebrow: "15",
    title: "Garage & specialty assets",
    description: "Vehicles, motorcycles, chargers, tenders, collections, and storage conditions.",
    fields: [{ name: "specialty_assets", label: "Garage, vehicles, motorcycles, collections, and specialty assets", type: "textarea" }],
  },
  {
    eyebrow: "16",
    title: "Existing vendors",
    description: "The people and firms already responsible for the property.",
    fields: [{ name: "vendors", label: "Existing vendors and service providers", type: "textarea", placeholder: "HVAC, plumbing, electrical, landscaping, snow, housekeeping, security, pool / spa, AV / IT" }],
  },
  {
    eyebrow: "17",
    title: "Warranties, manuals & records",
    description: "Where operating knowledge lives today and what may need to be gathered.",
    fields: [{ name: "records", label: "Warranties, manuals, service records, contracts, and property documentation", type: "textarea" }],
  },
  {
    eyebrow: "18",
    title: "Current concerns",
    description: "Known conditions, recent surprises, deferred work, or unresolved frustration.",
    fields: [{ name: "current_concerns", label: "Top concerns, recent repairs, and items needing attention", type: "textarea", required: true }],
  },
  {
    eyebrow: "19",
    title: "Owner priorities",
    description: "What thoughtful stewardship should make easier for you.",
    fields: [
      { name: "owner_priorities", label: "What matters most", type: "textarea", required: true, placeholder: "Prevention, watch while away, arrival readiness, vendors, records, projects, seasonal care, specialty assets" },
      { name: "aprism_value", label: "What would make APRISM genuinely valuable to you?", type: "textarea" },
    ],
  },
  {
    eyebrow: "20",
    title: "Privacy & access restrictions",
    description: "Discretion is part of the operating plan, not an afterthought.",
    fields: [
      { name: "access_restrictions", label: "Restricted rooms, collections, people, or access instructions", type: "textarea" },
      { name: "photo_restrictions", label: "Photography, documentation, or privacy restrictions", type: "textarea" },
    ],
  },
  {
    eyebrow: "21",
    title: "Authorization & acknowledgment",
    description: "Confirm the assessment scope and the authority to document observable conditions.",
    fields: [
      { name: "authorized_name", label: "Typed name / authorized representative", required: true },
      { name: "authorization_date", label: "Date", type: "date", required: true },
      { name: "photo_authorization", label: "I authorize property-condition photography for APRISM records, subject to the restrictions above.", type: "checkbox" },
      { name: "vendor_authorization", label: "APRISM may contact listed vendors to confirm service history or scheduling when requested.", type: "checkbox" },
      { name: "scope_acknowledgment", label: "I acknowledge the stewardship and observable-condition assessment scope described below.", type: "checkbox", required: true },
    ],
  },
];

export const fieldAssessmentAreas = [
  "Exterior",
  "Roof, drainage & snow exposure",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Fire & life safety",
  "Security & access",
  "Interior",
  "Appliances & equipment",
  "Garage",
  "Spa, pool & hot tub",
  "Landscaping & irrigation",
  "Vehicles, motorcycles & specialty assets",
  "Vendors",
  "Documentation",
  "Immediate concerns",
  "30-day priorities",
  "Seasonal priorities",
  "Long-term preventive maintenance",
  "Photo references",
] as const;

export const findingStatuses = ["Good", "Monitor", "Service Recommended", "Priority"] as const;

export function assessmentAreaKey(area: string) {
  return area.toLowerCase().replaceAll("&", "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

export const reportFields = [
  ["executive_summary", "Executive summary"],
  ["condition_overview", "Condition overview"],
  ["systems_baseline", "Major systems baseline"],
  ["priority_findings", "Priority findings"],
  ["photo_references", "Photo references"],
  ["immediate_actions", "Immediate recommended actions"],
  ["first_30_days", "First 30-day plan"],
  ["seasonal_recommendations", "Seasonal recommendations"],
  ["preventive_maintenance", "Preventive maintenance recommendations"],
  ["stewardship_recommendation", "APRISM stewardship recommendation"],
  ["next_steps", "Next steps"],
] as const;

export const assessmentDisclaimer = "APRISM Property Assessments are stewardship and observable-condition assessments intended to support maintenance planning, property documentation, and ongoing asset care. They are not licensed home inspections, engineering evaluations, code inspections, appraisals, or trade-specific diagnostic reports.";

export const intakeFieldNames = intakeSections.flatMap((section) => section.fields.map((field) => field.name));
export const requiredIntakeFields = intakeSections.flatMap((section) => section.fields.filter((field) => field.required).map((field) => field.name));
