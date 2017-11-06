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
    items: []
  },
  POWER: {
    pricePerMonth: {
      monthly: 18,
      annual: 15
    },
    items: []
  }
};

export const FREQUENCIES = [
  {
    title: "monthly",
    name: "monthly"
  },
  {
    title: "annually",
    name: "annual"
  }
];
