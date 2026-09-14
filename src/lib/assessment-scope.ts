export const assessmentScope = [
  "Structured visual walkthrough of accessible interior, exterior, garage, and site areas",
  "Photo documentation of observable property conditions and notable maintenance items",
  "Visual observations of accessible plumbing, HVAC, electrical, appliances, life-safety, and specialty systems",
  "Identification of visible maintenance concerns, loss-prevention issues, and items that merit further evaluation",
  "Prioritized findings organized as Immediate, Recommended, Monitor, or Good",
  "Recommended next actions, including referral to an appropriately licensed trade when needed",
  "A written property-condition baseline and preventive-maintenance plan",
  "An APRISM Home Stewardship recommendation when ongoing oversight would benefit the property",
] as const;

export const assessmentExclusions = [
  "Not a licensed home inspection, engineering evaluation, appraisal, or code-compliance inspection",
  "No destructive or invasive testing and no opening of walls, ceilings, equipment, or concealed assemblies",
  "No certification of structural, electrical, plumbing, HVAC, fire, environmental, septic, well, or other trade-specific systems",
  "No guarantee that concealed, intermittent, inaccessible, or future defects will be discovered",
  "Roof, crawlspace, attic, ladder, snow, ice, and other elevated or restricted areas are observed only when safely and reasonably accessible",
  "Environmental hazards such as mold, asbestos, radon, lead, pests, or hazardous materials are not tested or certified",
  "Specialty equipment is visually observed only unless separate testing or service has been specifically authorized",
] as const;

export const assessmentFieldRule = "Photograph the condition. Describe what you observe. Recommend the next action. Do not over-diagnose.";
