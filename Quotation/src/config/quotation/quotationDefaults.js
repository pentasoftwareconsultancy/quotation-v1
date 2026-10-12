// Static default values used to seed a brand-new quotation's formData.
// Values are copied verbatim from the previous CreateQuotation.jsx —
// changing them changes what a new quotation starts with.

export const QUOTATION_DEFAULTS = {
  documentType: "Commercial Quotation",
  version: "1.0",
  currency: "INR",
  gstPercent: 18,

  techStack: [
    { component: "Frontend", technology: "React.js", rationale: "Fast rendering, design fidelity" },
    { component: "Backend", technology: "PHP (Laravel)", rationale: "Secure e-commerce APIs" },
    { component: "Database", technology: "MySQL", rationale: "Reliable transaction handling" },
    { component: "Admin Panels", technology: "React.js", rationale: "Real-time dashboards" },
    { component: "Hosting", technology: "AWS / DigitalOcean", rationale: "99.9% uptime, easy scaling" },
    { component: "Payments", technology: "Razorpay", rationale: "UPI / recurring billing" },
  ],

  costBreakdown: [
    { srNo: 1, area: "Architecture & Planning", scope: "", amount: "" },
    { srNo: 2, area: "UI / UX Design", scope: "", amount: "" },
    { srNo: 3, area: "Core 3D Engine Development", scope: "", amount: "" },
    { srNo: 4, area: "Backend Development", scope: "", amount: "" },
    { srNo: 5, area: "3D Asset Creation & Optimization", scope: "", amount: "" },
    { srNo: 6, area: "Testing & Quality Assurance", scope: "", amount: "" },
    { srNo: 7, area: "DevOps & Cloud Deployment", scope: "", amount: "" },
    { srNo: 8, area: "Project Management & Delivery", scope: "", amount: "" },
  ],

  includes: [
    "Complete enterprise-grade web platform",
    "Backend APIs + database",
    "QA testing & production rollout",
  ],

  timeline: [
    { srNo: 1, phase: "Discovery", duration: "1 Week", deliverables: "Requirements, main page prototype" },
    { srNo: 2, phase: "Core Frontend + Backend", duration: "2 Weeks", deliverables: "Main + subscription MVP" },
    { srNo: 3, phase: "Payments Page", duration: "1 Week", deliverables: "Checkout integration" },
    { srNo: 4, phase: "Admin + Testing", duration: "1 Week", deliverables: "Dashboards, QA cycles" },
    { srNo: 5, phase: "UAT & Launch", duration: "1 Week", deliverables: "Bug fixes, deployment, training" },
  ],

  paymentTermsDefault: [
    { percent: 25, label: "Advance upon contract signing" },
    { percent: 30, label: "Midpoint milestone" },
    { percent: 25, label: "UAT approval" },
    { percent: 20, label: "Final delivery and deployment" },
  ],

  paymentTermsSmallProject: [
    { percent: 40, label: "Advance upon contract signing" },
    { percent: 60, label: "Final delivery and deployment" },
  ],

  maintenancePlans: [
    { plan: "Basic", coverage: "Bug fixes, server monitoring", monthly: 12000 },
    { plan: "Standard (Recommended)", coverage: "+ Feature updates, API monitoring", monthly: 20000 },
  ],

  signatureNote:
    "Once discussion is finalized, the SOW will be initiated along with the contractual obligations.",

  assumptions: {
    included: [
      "Source code handover (React + PHP/Laravel)",
      "30 days free post-launch support",
      "Complete documentation",
      "Training session for admin panel",
    ],
    excluded: [
      "Custom hardware integration",
      "Marketing & user acquisition",
      "Regulatory compliance (e-commerce norms)",
      "Third-party API costs",
      "Hosting/domain setup",
    ],
    warranty: ["3 months defect-free guarantee, priority support"],
  },
};

export default QUOTATION_DEFAULTS;
