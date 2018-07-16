// Desktop Pricing
export const PRICING_TABLE = {
  PLATFORM: [
    {
      feature: "Full HIPAA Compliance",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "iOS & Android Apps",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "Mac & Windows Apps",
      basic: true,
      standard: true,
      premium: true
    },
    {
      feature: "EHR Integrations",
      basic: true,
      standard: true,
      premium: true
    }
  ],
  TEAM_MESSAGING: [
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
      feature: "Total File Storage",
      basic: "1GB",
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
      feature: "Guest Access",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Voice & Video Calls",
      basic: false,
      standard: true,
      premium: true
    }
  ],
  PATIENT_COMMUNICATION: [
    {
      feature: "Unlimited Patients",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "In-app Messaging",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Assignments",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Search & File Uploads",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Dedicated URL",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Family Access",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Templates & Macros",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Internal Notes",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Custom Inboxes",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Custom Forms",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Voice & Video Calls",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "White Labeling",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Custom URL",
      basic: false,
      standard: false,
      premium: true
    }
  ],
  TASK_MANAGEMENT: [
    {
      feature: "Task Creation",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Task Assignment",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Threaded Comments",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Total File Storage",
      basic: false,
      standard: "1GB",
      premium: "Unlimited"
    },
    {
      feature: "Due Date Reminders",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Guest Access",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "Custom Workflows",
      basic: false,
      standard: false,
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
    {
      feature: "Phone Support",
      basic: false,
      standard: true,
      premium: true
    },
    {
      feature: "Custom Data Retention",
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
    {
      feature: "Advanced Security Controls",
      basic: false,
      standard: false,
      premium: true
    },
    {
      feature: "On-Site Training",
      basic: false,
      standard: false,
      premium: true
    },
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
      { feature: "Full HIPAA Compliance" },
      { feature: "iOS & Android Apps" },
      { feature: "Mac & Windows Apps" },
      { feature: "EHR Integrations" }
    ],
    TEAM_MESSAGING: [
      { feature: "Public & Private Rooms" },
      { feature: "Group & Direct Messaging" },
      { feature: "1,000 Message Search Access" },
      { feature: "1GB Total File Storage" }
    ],
    ADMINISTRATION: [
      { feature: "Usage Analytics" },
      { feature: "Member Management" },
      { feature: "Inactivity Lockout Timer" },
      { feature: "Data Import & Export" },
      { feature: "User Access Logs" }
    ]
  },
  STANDARD: {
    TEAM_MESSAGING: [
      { feature: "Guest Access" },
      { feature: "Voice & Video Calls" },
      { feature: "Unlimited Search Archives" },
      { feature: "Unlimited File Storage" }
    ],
    PATIENT_COMMUNICATION: [
      { feature: "Unlimited Patients" },
      { feature: "In-App Messaging" },
      { feature: "Assignments" },
      { feature: "Search & File Uploads" },
      { feature: "Dedicated URL" }
    ],
    TASK_MANAGEMENT: [
      { feature: "Task Creation" },
      { feature: "Task Assignment" },
      { feature: "Threaded Comments" },
      { feature: "1GB Total File Storage" },
      { feature: "Due Date Reminders" }
    ],
    ADMINISTRATION: [
      { feature: "Priority Email Support" },
      { feature: "Phone Support" },
      { feature: "Custom Data Retention" }
    ]
  },
  PREMIUM: {
    PATIENT_COMMUNICATION: [
      { feature: "Family Access" },
      { feature: "Templates & Macros" },
      { feature: "Internal Notes" },
      { feature: "Custom Inboxes" },
      { feature: "Custom Forms" },
      { feature: "Video & Voice Calls" },
      { feature: "White Labeling" },
      { feature: "Custom URL" }
    ],
    TASK_MANAGEMENT: [
      { feature: "Unlimited File Storage" },
      { feature: "Guest Access" },
      { feature: "Custom Workflows" }
    ],
    ADMINISTRATION: [
      { feature: "Dedicated Support" },
      { feature: "Advanced Security Controls" },
      { feature: "On-site Training" },
      { feature: "Custom Profiles" },
      { feature: "Single Sign On" },
      { feature: "Custom Integrations" }
    ]
  }
};
