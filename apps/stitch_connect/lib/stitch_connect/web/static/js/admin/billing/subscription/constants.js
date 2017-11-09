export const TIERS = ["BASIC", "PREMIUM", "POWER"];

export const PLANS = {
  BASIC: {
    pricePerMonth: {
      monthly: 6,
      annual: 5
    },
    items: [
      "HIPAA Compliant",
      "Public & Private Rooms",
      "Direct Messaging",
      "Healthcare Workflows",
      "Searchable Archives",
      "File Storage",
      "Mac & Windows Apps",
      "iOS & Android Apps"
    ]
  },
  PREMIUM: {
    pricePerMonth: {
      monthly: 12,
      annual: 10
    },
    items: [
      "Task Management",
      "Guest Access",
      "Custom User Groups (Beta)",
      "Custom Data Retention (Beta)",
      "Custom Profiles (Beta)",
      "Priority Support"
    ]
  },
  POWER: {
    pricePerMonth: {
      monthly: 18,
      annual: 15
    },
    items: [
      "Voice & Video Calls (Beta)",
      "Priority Messaging (Beta)",
      "EHR Integrations (Beta)",
      "Advanced Security Controls",
      "On-Site Training",
      "Dedicated Support"
    ]
  }
};

export const FREQUENCIES = [
  {
    title: "monthly",
    name: "monthly",
    unit: "month",
    months: 1
  },
  {
    title: "annually",
    name: "annual",
    unit: "year",
    months: 12
  }
];
