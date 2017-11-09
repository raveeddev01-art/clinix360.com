const TIERS = ["BASIC", "PREMIUM", "POWER"];

const PLANS = {
  BASIC: {
    pricePerMonth: {
      monthly: 6,
      annual: 5
    },
    items: [
      {
        content: "HIPAA Compliant",
        beta: false
      },
      {
        content: "Public & Private Rooms",
        beta: false
      },
      {
        content: "Direct Messaging",
        beta: false
      },
      {
        content: "Healthcare Workflows",
        beta: false
      },
      {
        content: "Searchable Archives",
        beta: false
      },
      {
        content: "File Storage",
        beta: false
      },
      {
        content: "Mac & Windows Apps",
        beta: false
      },
      {
        content: "iOS & Android Apps",
        beta: false
      }
    ]
  },
  PREMIUM: {
    pricePerMonth: {
      monthly: 12,
      annual: 10
    },
    items: [
      {
        content: "Task Management",
        beta: false
      },
      {
        content: "Guest Access",
        beta: false
      },
      {
        content: "Custom User Groups",
        beta: true
      },
      {
        content: "Custom Data Retention",
        beta: true
      },
      {
        content: "Custom Profiles",
        beta: true
      },
      {
        content: "Priority Support",
        beta: false
      }
    ]
  },
  POWER: {
    pricePerMonth: {
      monthly: 18,
      annual: 15
    },
    items: [
      {
        content: "Voice & Video Calls",
        beta: true
      },
      {
        content: "Priority Messaging",
        beta: true
      },
      {
        content: "EHR Integrations",
        beta: true
      },
      {
        content: "Advanced Security Controls",
        beta: false
      },
      {
        content: "On-Site Training",
        beta: false
      },
      {
        content: "Dedicated Support",
        beta: false
      }
    ]
  }
};

const FREQUENCIES = [
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

const getSelectableTiers = () => {
  return TIERS;
};

const getUpgradableTiers = tier => {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 0) {
    return [];
  }

  return TIERS.slice(index + 1);
};

const getBelowTier = tier => {
  const index = TIERS.findIndex(t => t === tier);

  if (index < 1) {
    return "";
  }

  return TIERS[index - 1];
};

const getPlanForTier = tier => {
  return PLANS[tier];
};

const getFrequency = frequencyIndex => {
  return FREQUENCIES[frequencyIndex];
};

const getAnnualFrequency = () => {
  return FREQUENCIES[1];
};

const getMonthlyFrequency = () => {
  return FREQUENCIES[0];
};

const getFrequencyName = frequencyIndex => {
  return FREQUENCIES[frequencyIndex].name;
};

const getMonthlyPrice = (tier, frequencyIndex) => {
  const plan = getPlanForTier(tier);
  const frequencyName = getFrequencyName(frequencyIndex);

  return plan.pricePerMonth[frequencyName];
};

export {
  getSelectableTiers,
  getUpgradableTiers,
  getBelowTier,
  getPlanForTier,
  getFrequency,
  getAnnualFrequency,
  getMonthlyFrequency,
  getFrequencyName,
  getMonthlyPrice
};
