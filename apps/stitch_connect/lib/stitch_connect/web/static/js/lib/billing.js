import moment from "moment";
import countries from "i18n-iso-countries";
import provinces from "provinces";

import flow from "lodash/flow";
// lodash-fp imports only used for flow
import groupBy from "lodash/fp/groupBy";
import map from "lodash/fp/map";
import mapValues from "lodash/fp/mapValues";
import sortBy from "lodash/fp/sortBy";

const TIERS = ["FREE", "STANDARD", "PREMIUM"];

const PLANS = {
  FREE: {
    pricePerMonth: {
      monthly: 0,
      annual: 0
    },
    items: [
      {
        content: "HIPAA Compliance",
        beta: false
      },
      {
        content: "Public & Private Rooms",
        beta: false
      },
      {
        content: "Group & Direct Messaging",
        beta: false
      },
      {
        content: "1K Message Access",
        beta: false
      },
      {
        content: "1GB File Storage",
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
  STANDARD: {
    pricePerMonth: {
      monthly: 6,
      annual: 5
    },
    items: [
      {
        content: "Advanced Security Controls",
        beta: false
      },
      {
        content: "Guest Access",
        beta: false
      },
      {
        content: "Unlimited Message Access",
        beta: true
      },
      {
        content: "Unlimited File Storage",
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
  PREMIUM: {
    pricePerMonth: {
      monthly: 12,
      annual: 10
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
        content: "Custom Data Retention",
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
    months: 1,
    value: "MONTHLY"
  },
  {
    title: "annually",
    name: "annual",
    unit: "year",
    months: 12,
    value: "YEARLY"
  }
];

const processSubscriptionData = subscription => {
  const dateFormat = "dddd, MMMM Do YYYY";
  const today = moment.utc();
  const validUntil =
    subscription.valid_until && moment.utc(subscription.valid_until);

  subscription.tier = subscription.tier;
  subscription.valid_until = validUntil && validUntil.format(dateFormat);
  subscription.plan_remaining_days =
    validUntil && validUntil.diff(today, "days");

  return subscription;
};

const getSelectableTiers = tier => {
  return TIERS.filter(t => t !== tier);
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

const getCountries = () => {
  const alpha2Map = countries.getNames("en");

  return flow(
    map((name, alpha2) => ({
      alpha2,
      alpha3: countries.alpha2ToAlpha3(alpha2),
      name
    })),
    sortBy("name")
  )(alpha2Map);
};

const getProvinces = () => {
  return flow(
    map(province => {
      const country = countries.alpha2ToAlpha3(province.country);
      const name = province.english || province.name;
      const short = province.english
        ? province.english
        : province.short || province.name;

      return {
        country,
        name,
        short
      };
    }),
    groupBy("country"),
    mapValues(sortBy(({ name }) => name.toLowerCase()))
  )(provinces);
};

export {
  processSubscriptionData,
  getSelectableTiers,
  getBelowTier,
  getPlanForTier,
  getFrequency,
  getAnnualFrequency,
  getMonthlyFrequency,
  getFrequencyName,
  getMonthlyPrice,
  getCountries,
  getProvinces
};
