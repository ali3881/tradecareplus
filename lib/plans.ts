export const PLANS = {
  BASIC: {
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    name: "Basic",
    includedVisits: 0,
    discounts: {
      allJobs: 0.25,
      additionalWork: 0,
      hotWater: 0,
      propertyCare: 0,
    },
    features: ["chat", "diy_guidance", "checklist"],
  },
  STANDARD: {
    priceId: process.env.STRIPE_STANDARD_PRICE_ID,
    name: "Standard",
    includedVisits: 10,
    discounts: {
      allJobs: 0.25, // Basic included
      additionalWork: 0.15,
      hotWater: 0,
      propertyCare: 0,
    },
    features: ["chat", "diy_guidance", "checklist", "visits", "leaking_taps", "blocked_drains_247"],
  },
  PREMIUM: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    name: "Premium",
    includedVisits: 10, // Assuming same as Standard + special visits
    discounts: {
      allJobs: 0.25,
      additionalWork: 0.15,
      hotWater: 0.20,
      propertyCare: 0.25,
    },
    features: [
      "chat",
      "diy_guidance",
      "checklist",
      "visits",
      "leaking_taps",
      "blocked_drains_247",
      "cctv_jet_blast",
      "hot_water_inspection",
      "emergency_priority",
      "fixed_pricing",
    ],
  },
};

export function getPlanFromPriceId(priceId: string) {
  if (priceId === process.env.STRIPE_BASIC_PRICE_ID) return "BASIC";
  if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) return "STANDARD";
  if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) return "PREMIUM";
  return null;
}
