// Desktop Pricing
export const PRICING_TABLE = {
  PLATFORM: [
    // {
    //   feature: "iOS & Android Apps",
    //   basic: true,
    //   standard: true,
    //   premium: true
    // },
    // {
    //   feature: "Mac & Windows Apps",
    //   basic: true,
    //   standard: true,
    //   premium: true
    // },
    {
      feature: "API Access",
      basic: true,
      standard: true,
      premium: true
    }
  ],
  COMMUNICATION: [
    {
      feature: "Public & Private Rooms",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Group & Direct Messaging",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Message Search Access",
      basic: "1,000 Messages",
      standard: "Unlimited",
      premium: "Unlimited"
    },
    {
      feature: "Priority Messaging",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Voice & Video Calls",
      basic: false,
      standard: false,
      premium: true
    }
  ],
  FILE_SHARING: [
    {
      feature: "Image & Video Uploads",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Document Uploads",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Total File Storage",
      basic: "1GB/User",
      standard: "5GB/User",
      premium: "10GB/User"
    },
    {
      feature: "Threaded File Comments",
      basic: true,
      standard: true,
      premium: true
    }
  ],
  PRODUCTIVITY: [
    {
      feature: "Read Receipts",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Message Pinning",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Message Starring",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Emoji Reactions",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Search Modifier",
      basic: true,
      standard: true,
      premium: true
    }
  ],
  ADMINISTRATION: [
    {
      feature: "Usage Analytics",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "User Access Logs",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Member Management",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Inactivity Lockout Timer",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Data Import & Export",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Priority Email Support",
      basic: false,
      standard: true,
      premium: true
    },
    // {
    //   feature: "Phone Support",
    //   basic: false,
    //   standard: true,
    //   premium: true
    // },
    {
      feature: "Custom Data Retention",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Guest Access",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Dedicated Support",
      basic: false,
      standard: false,
      premium: true
    },
    // {
    //   feature: "Advanced Security Controls",
    //   basic: false,
    //   standard: false,
    //   premium: true
    // },
    // {
    //   feature: "On-Site Training",
    //   basic: false,
    //   standard: false,
    //   premium: true
    // },
    {
      feature: "Custom Profiles",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Single Sign On",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Custom Integrations",
      basic: false,
      standard: false,
      premium: true
    }
  ]
};

// Mobile Pricing
export const PRICING_TABLE_MOBILE = {
  BASIC: {
    PLATFORM: [
      { feature: "iOS & Android Apps" },
      { feature: "Mac & Windows Apps" },
      { feature: "EHR Integrations" },
      { feature: "API Access" }
    ],
    COMMUNICATION: [
      { feature: "Public & Private Rooms" },
      { feature: "Group & Direct Messaging" },
      { feature: "1,000 Message Search Access" },
      { feature: "Priority Messaging" }
    ],
    FILE_SHARING: [
      { feature: "Image & Video Uploads" },
      { feature: "Document Uploads" },
      { feature: "1GB Total File Storage" },
      { feature: "Threaded File Comments" }
    ],
    PRODUCTIVITY: [
      { feature: "Read Receipts" },
      { feature: "Message Pinning" },
      { feature: "Message Starring" },
      { feature: "Emoji Reactions" },
      { feature: "Search Modifiers" }
    ],
    ADMINISTRATION: [
      { feature: "Usage Analytics" },
      { feature: "User Access Logs" },
      { feature: "Member Management" },
      { feature: "Inactivity Lockout Timer" },
      { feature: "Data Import & Export" }
    ]
  },
  STANDARD: {
    COMMUNICATION: [{ feature: "Unlimited Search Archives" }],
    FILE_SHARING: [{ feature: "5GB/User" }],
    ADMINISTRATION: [
      { feature: "Priority Email Support" },
      { feature: "Phone Support" },
      { feature: "Custom Data Retention" },
      { feature: "Guest Access" }
    ]
  },
  PREMIUM: {
    PLATFORM: [
      // { feature: "iOS & Android Apps" },
      // { feature: "Mac & Windows Apps" },
      { feature: "API Access" }
    ],
    COMMUNICATION: [
      { feature: "Public & Private Rooms" },
      { feature: "Group & Direct Messaging" },
      { feature: "Unlimited" },
      { feature: "Priority Messaging" },
      { feature: "Voice & Video Calls" }
    ],
    FILE_SHARING: [
      { feature: "Image & Video Uploads" },
      { feature: "Document Uploads" },
      { feature: "10GB Total File Storage" },
      { feature: "Threaded File Comments" }
    ],
    PRODUCTIVITY: [
      { feature: "Read Receipts" },
      { feature: "Message Pinning" },
      { feature: "Message Starring" },
      { feature: "Emoji Reactions" },
      { feature: "Search Modifiers" }
    ],
    ADMINISTRATION: [
      { feature: "Usage Analytics" },
      { feature: "User Access Logs" },
      { feature: "Member Management" },
      { feature: "Inactivity Lockout Timer" },
      { feature: "Data Import & Export" },
      { feature: "Priority Email Support" },
      { feature: "Custom Data Retention" },
      { feature: "Guest Access" },
      { feature: "Dedicated Support" },
      { feature: "Custom Profiles" },
      { feature: "Single Sign On" },
      { feature: "Custom Integrations" }
    ]
  }
};

export const PRICING_TABLE_ENTERPRISE = {
  COMPLIANCE: [
    { feature: "Custom BAA, Terms of Service and Master Agreement" },
    { feature: "Full eDiscovery capabilities and assistance" },
    { feature: "Custom retention policies for messages and files" }
  ],
  FEATURES: [
    { feature: "Granular feature toggling for a controlled experience" },
    { feature: "Custom API endpoints for deep integrations" },
    { feature: "1 TB (1,000 GB) file storage per user" }
  ],
  SUPPORT: [
    { feature: "Personalized onboarding and training sessions" },
    { feature: "Designated account and customer success team" },
    { feature: "24/7 support with 6-hour first response time" }
  ]
};
