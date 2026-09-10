export type Service = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  promise: string;
  services: string[];
  outcomes: { title: string; copy: string }[];
  localTitle?: string;
  localCopy?: string[];
  idealFor?: string[];
  relatedLinks?: { href: string; label: string }[];
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
    localTitle: "Property maintenance built for Park City and the Wasatch Back.",
    localCopy: [
      "Mountain homes ask more of their systems. Freeze cycles, snow load, seasonal vacancy, dry air, irrigation, mechanical rooms, exterior assemblies, and changing temperatures can turn a small maintenance item into an expensive interruption. APRISM Property Services gives owners a local point of accountability for preventive property maintenance across Park City, Deer Valley, Promontory, Summit County, and select Wasatch Back communities.",
      "Our work is centered on continuity rather than one-off repair calls. We document conditions, track recurring maintenance, troubleshoot minor issues, coordinate qualified vendors when a specialist is needed, and keep the owner informed about what was found, what was completed, and what should happen next. That makes the property easier to own whether it is a primary residence, a second home, or part of a larger private estate.",
      "APRISM can also support seasonal opening and closing, arrival readiness, post-storm observations, minor repairs, contractor access, and follow-through after larger service visits. The goal is simple: fewer surprises, clearer records, and a home that is ready when you are.",
    ],
    idealFor: [
      "Primary and second homes needing proactive maintenance",
      "Owners who want one local contact for recurring property details",
      "Homes with multiple vendors, systems, and seasonal service needs",
      "Property managers seeking dependable field support and documentation",
    ],
    relatedLinks: [
      { href: "/home-watch", label: "Explore Home Watch" },
      { href: "/estate-management", label: "Explore Estate Management" },
      { href: "/memberships", label: "View Stewardship Memberships" },
    ],
    seoTitle: "Summit County Property Maintenance | APRISM",
    seoDescription:
      "Preventive property maintenance, minor repairs, seasonal preparation, reporting, and vendor coordination for Park City, Deer Valley, Promontory, and the Wasatch Back.",
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
    localTitle: "Private estate management with local accountability.",
    localCopy: [
      "APRISM Estate Management is designed for Park City and Wasatch Back owners who need more than periodic maintenance. Complex homes often involve specialty mechanical systems, snow and landscape contractors, security, smart-home technology, housekeeping, builders, service technicians, and seasonal preparation. Without a single steward, responsibility can become fragmented between vendors.",
      "APRISM provides a consistent local relationship that connects those moving parts. We schedule documented inspections, maintain the operating record, coordinate vendors, oversee approved projects, prepare the home for arrivals and departures, and help organize a response when an urgent condition develops. Owners receive a clearer picture of the property rather than a collection of disconnected service calls.",
      "For second-home and private-estate owners, this continuity matters most while the residence is unoccupied. A known local steward can notice changing conditions, confirm work was completed, maintain access information, and help prevent small issues from disappearing into the gaps between contractors. The result is practical estate stewardship focused on readiness, preservation, and long-term confidence in the home.",
    ],
    idealFor: [
      "Luxury second homes with multiple service providers",
      "Private estates requiring documented local oversight",
      "Owners who travel frequently or live outside Utah",
      "Homes needing coordinated arrivals, departures, projects, and maintenance",
    ],
    relatedLinks: [
      { href: "/home-watch", label: "Add Documented Home Watch" },
      { href: "/new-home-stewardship", label: "New Home Stewardship" },
      { href: "/memberships", label: "Compare Memberships" },
    ],
    seoTitle: "Park City Estate Management | APRISM",
    seoDescription:
      "Private estate management for Park City and Wasatch Back homes, including inspections, preventive maintenance, projects, arrivals, vendors, documentation, and emergency coordination.",
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
    localTitle: "Home watch for Park City second homes and mountain properties.",
    localCopy: [
      "An unoccupied mountain home can change quickly. Winter temperatures, snow, plumbing, HVAC performance, leaks, power interruptions, wind, exterior damage, and contractor activity all create conditions that are easy to miss from another state or another country. APRISM Home Watch provides scheduled, documented visual inspections for second homes in Park City, Deer Valley, Promontory, Summit County, and nearby Wasatch Back communities.",
      "A home watch visit is not a substitute for a licensed trade inspection. It is a consistent set of eyes on the property. We visually review accessible interior and exterior areas, note obvious changes, observe temperature and mechanical conditions, look for signs of water intrusion or freeze risk, and provide photo-supported reporting. When something needs attention, we communicate the condition and help coordinate the appropriate next step.",
      "Home Watch can operate as a stand-alone service or as part of a broader APRISM stewardship relationship. For owners who use the home seasonally, it can also connect naturally with arrival preparation, departure procedures, preventive maintenance, and vendor coordination so the residence remains cared for between visits.",
    ],
    idealFor: [
      "Second homes vacant for weeks or months at a time",
      "Park City owners living outside Utah",
      "Properties exposed to snow, freeze, storm, or leak risk",
      "Owners wanting documented visits and photo reporting",
    ],
    relatedLinks: [
      { href: "/property-services", label: "Add Property Maintenance" },
      { href: "/estate-management", label: "Explore Estate Management" },
      { href: "/contact", label: "Request a Property Assessment" },
    ],
    seoTitle: "Park City Home Watch & Second Home Care | APRISM",
    seoDescription:
      "Documented home watch for second homes in Park City, Deer Valley, Promontory, and Summit County, with photo reporting, weather-risk observations, and local coordination.",
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
    localTitle: "A structured handoff for new Park City and Wasatch Back homes.",
    localCopy: [
      "The first year of owning a new or newly purchased mountain home is when important information can disappear fastest. Builder contacts, subcontractors, equipment manuals, model and serial numbers, finish schedules, warranty dates, smart-home details, maintenance requirements, and seasonal procedures may be scattered across emails, binders, and different vendors.",
      "APRISM New Home Stewardship organizes that information into a usable property record. We inventory major equipment, capture documentation, record builder and vendor relationships, identify recurring maintenance needs, photograph key systems and conditions, and establish a practical calendar for the first year of ownership. That record becomes the foundation for future preventive maintenance and estate care.",
      "For new construction in Park City, Deer Valley, Promontory, Summit County, and the Wasatch Back, early documentation also helps owners distinguish warranty follow-up from routine maintenance. APRISM can help track open items, coordinate access, document observable changes, and preserve continuity after the builder handoff is complete.",
    ],
    idealFor: [
      "Recently completed custom homes",
      "Newly purchased second homes with unfamiliar systems",
      "Owners transitioning away from builder-led coordination",
      "Properties that need a clean maintenance and warranty record from day one",
    ],
    relatedLinks: [
      { href: "/estate-management", label: "Continue with Estate Management" },
      { href: "/property-services", label: "Build a Maintenance Plan" },
      { href: "/contact", label: "Request a Property Assessment" },
    ],
    seoTitle: "New Home Stewardship Park City | APRISM",
    seoDescription:
      "New-home onboarding, equipment inventory, warranty tracking, maintenance planning, and first-year stewardship for Park City and Summit County residences.",
  },
  {
    slug: "moto",
    eyebrow: "APRISM Moto",
    title: "Stewardship for the collection beyond the garage door.",
    intro:
      "Informed support for motorcycle acquisition, documentation, maintenance planning, and transport, built for owners who value provenance and readiness.",
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
    price: { amount: "149" },
    cadence: "/month",
    description: "A professional maintenance relationship for a primary residence.",
    features: ["Annual property review", "Maintenance planning", "Preferred scheduling", "Digital property record"],
  },
  {
    name: "Summit Home",
    price: { amount: "399" },
    cadence: "/month",
    description: "Proactive oversight for mountain homes used throughout the year.",
    features: ["Scheduled home watch", "Seasonal readiness review", "Photo condition reports", "Vendor coordination"],
    featured: true,
  },
  {
    name: "Estate Stewardship",
    price: { amount: "895" },
    cadence: "/month",
    description: "Comprehensive estate coordination and an accountable stewardship lead.",
    features: ["Frequent documented inspections", "Project and vendor oversight", "Arrival and departure care", "Priority coordination"],
  },
  {
    name: "Private Client",
    price: { amount: "1,750", qualifier: "From" },
    cadence: "/month",
    description: "A tailored program for complex estates, multiple properties, and specialty assets.",
    features: ["Custom stewardship schedule", "Portfolio-level property records", "Dedicated coordination", "APRISM Moto integration"],
  },
];
