export type Service = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  promise: string;
  services: string[];
  outcomes: { title: string; copy: string }[];
  seoTitle: string;
  seoDescription: string;
};

export const services: Service[] = [
  {
    slug: "property-services",
    eyebrow: "APRISM Property Services",
    title: "Preventive care for the property you value.",
    intro:
      "A disciplined maintenance relationship for owners who expect their home to operate as carefully as it was designed.",
    promise:
      "We identify small changes early, keep the maintenance record current, and coordinate the right response before deferred details become disruptive problems.",
    services: [
      "Preventive maintenance",
      "Minor repair and troubleshooting",
      "Seasonal preparation",
      "Property condition reporting",
      "Vendor coordination",
      "Smart-home troubleshooting",
      "Maintenance planning",
    ],
    outcomes: [
      { title: "Continuity", copy: "One living record for service history, systems, and next actions." },
      { title: "Foresight", copy: "Planned attention before weather, wear, or vacancy creates urgency." },
      { title: "Accountability", copy: "A clear owner for follow-through across technicians and vendors." },
    ],
    seoTitle: "Summit County Property Maintenance",
    seoDescription:
      "Preventive property maintenance, troubleshooting, seasonal preparation, and vendor coordination for homes in Park City, Deer Valley, and Promontory.",
  },
  {
    slug: "estate-management",
    eyebrow: "APRISM Estate Management",
    title: "A single steward for the whole estate.",
    intro:
      "Comprehensive oversight for residences that require consistent judgment, documentation, and coordination across many systems and specialists.",
    promise:
      "APRISM becomes the accountable through-line between ownership, the property, and every professional responsible for its care.",
    services: [
      "Scheduled property inspections",
      "Preventive maintenance management",
      "Contractor and vendor coordination",
      "Project oversight",
      "Arrival preparation",
      "Departure procedures",
      "Emergency coordination",
      "Property documentation",
    ],
    outcomes: [
      { title: "One relationship", copy: "A discreet point of contact with a complete view of the residence." },
      { title: "One strategy", copy: "Maintenance decisions guided by condition, priority, and long-term value." },
      { title: "One record", copy: "Inspections, documents, systems, vendors, and work history kept together." },
    ],
    seoTitle: "Park City Estate Management",
    seoDescription:
      "Private estate management for luxury homes in Park City and the Wasatch Back, including inspections, projects, arrivals, vendors, and emergency coordination.",
  },
  {
    slug: "home-watch",
    eyebrow: "APRISM Home Watch",
    title: "Confidence while you are away.",
    intro:
      "Documented, scheduled visual inspections designed for mountain homes exposed to vacancy, weather, and rapidly changing conditions.",
    promise:
      "Each visit produces a clear record of observations and the next recommended action, so distance never becomes uncertainty.",
    services: [
      "Documented scheduled inspections",
      "Interior and exterior visual checks",
      "Temperature, leak, and HVAC observations",
      "Storm, snow, and freeze-risk review",
      "Owner reports with photos",
    ],
    outcomes: [
      { title: "Documented visits", copy: "Time-stamped observations and photographs for every scheduled check." },
      { title: "Mountain-aware", copy: "Focused review of the conditions most likely to affect an unoccupied home." },
      { title: "Clear escalation", copy: "Prompt communication and coordinated action when a condition changes." },
    ],
    seoTitle: "Park City Home Watch",
    seoDescription:
      "Documented home watch inspections for second homes in Park City, Deer Valley, and Summit County, with photo reporting and weather-risk observations.",
  },
  {
    slug: "new-home-stewardship",
    eyebrow: "New Home Stewardship",
    title: "Start the property record on day one.",
    intro:
      "A structured onboarding program for new construction, newly purchased homes, and owners inheriting an unfamiliar set of systems.",
    promise:
      "We turn scattered manuals, contacts, warranties, and equipment details into an operating record that supports confident ownership from the beginning.",
    services: [
      "Equipment inventory",
      "Serial and model documentation",
      "Warranty tracking",
      "Builder and vendor records",
      "Maintenance calendar",
      "Property photography",
      "First-year inspection program",
    ],
    outcomes: [
      { title: "Organized turnover", copy: "A complete handoff from builder, seller, or prior management." },
      { title: "Warranty awareness", copy: "Key dates and documentation kept visible before coverage expires." },
      { title: "First-year clarity", copy: "Recurring reviews while the home and its systems settle into use." },
    ],
    seoTitle: "New Luxury Home Stewardship Park City",
    seoDescription:
      "New-home onboarding, equipment inventory, warranty tracking, and first-year stewardship for luxury residences in Park City and Summit County.",
  },
  {
    slug: "moto",
    eyebrow: "APRISM Moto",
    title: "Stewardship for the collection beyond the garage door.",
    intro:
      "Informed support for motorcycle acquisition, documentation, maintenance planning, and transport—built for owners who value provenance and readiness.",
    promise:
      "The same disciplined care APRISM brings to a residence, applied to specialty assets with distinct histories, requirements, and meaning.",
    services: [
      "Motorcycle acquisition consulting",
      "Pre-purchase inspection",
      "Collection documentation",
      "Maintenance planning",
      "Transport coordination",
      "Collector support",
    ],
    outcomes: [
      { title: "Informed acquisition", copy: "Condition, history, and fit considered before a commitment is made." },
      { title: "Collection record", copy: "Specifications, provenance, service history, and documentation maintained." },
      { title: "Ready when needed", copy: "Maintenance and transport coordinated around how the collection is used." },
    ],
    seoTitle: "APRISM Moto | Motorcycle Collection Stewardship",
    seoDescription:
      "Motorcycle acquisition consulting, collection documentation, maintenance planning, and transport coordination for private clients.",
  },
];

export const serviceBySlug = Object.fromEntries(services.map((service) => [service.slug, service]));

export const healthStatuses = [
  { name: "Healthy", tone: "#7f9a80", copy: "Systems and conditions are operating as expected." },
  { name: "Monitor", tone: "#c7a76b", copy: "A change is documented and scheduled for continued observation." },
  { name: "Action Recommended", tone: "#c88352", copy: "A clear next step is advised to protect performance or condition." },
  { name: "Critical", tone: "#a95b54", copy: "Immediate coordination is required to limit risk or damage." },
];

export const memberships = [
  {
    name: "Essential Care",
    price: "$149",
    cadence: "/month",
    description: "A professional maintenance relationship for a primary residence.",
    features: ["Annual property review", "Maintenance planning", "Preferred scheduling", "Digital property record"],
  },
  {
    name: "Summit Home",
    price: "$399",
    cadence: "/month",
    description: "Proactive oversight for mountain homes used throughout the year.",
    features: ["Scheduled home watch", "Seasonal readiness review", "Photo condition reports", "Vendor coordination"],
    featured: true,
  },
  {
    name: "Estate Stewardship",
    price: "$895",
    cadence: "/month",
    description: "Comprehensive estate coordination and an accountable stewardship lead.",
    features: ["Frequent documented inspections", "Project and vendor oversight", "Arrival and departure care", "Priority coordination"],
  },
  {
    name: "Private Client",
    price: "From $1,750",
    cadence: "/month",
    description: "A tailored program for complex estates, multiple properties, and specialty assets.",
    features: ["Custom stewardship schedule", "Portfolio-level property records", "Dedicated coordination", "APRISM Moto integration"],
  },
];
