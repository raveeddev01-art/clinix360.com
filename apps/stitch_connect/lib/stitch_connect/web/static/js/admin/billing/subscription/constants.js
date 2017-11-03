export const TIERS = ["BASIC", "PREMIUM", "POWER"];

export const PLANS = {
  BASIC: {
    pricePerMonth: {
      monthly: 6,
      annually: 5
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
      annually: 10
    },
    items: []
  },
  POWER: {
    pricePerMonth: {
      monthly: 18,
      annually: 15
    },
    items: []
  }
};

export const FREQUENCIES = ["monthly", "annually"];
