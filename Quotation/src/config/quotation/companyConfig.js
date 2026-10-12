// Centralized per-company branding/config for the Quotation module.
// Add a new company by adding a key here + its assets — quotation
// components read everything through this config, never hardcoded.

import smartmatrixSignature from "../../assets/Smartmatrix_CEO.png";
import smartmatrixStamp from "../../assets/Smartmatrix_stamp.png";
import smartmatrixWatermark from "../../assets/Smartmatrix_watermark.png";
import smartmatrixHeader from "../../assets/header.jpg";
import smartmatrixFooter from "../../assets/footer.jpg";

import smartSoftwareHeader from "../../assets/smartsoftware/header.jpeg";
import smartSoftwareFooter from "../../assets/smartsoftware/footer.jpeg";
import smartSoftwareLogo from "../../assets/smartsoftware/SmartLogo.png";
import smartSoftwareStamp from "../../assets/smartsoftware/stamp.jpeg";
import smartSoftwareSignature from "../../assets/smartsoftware/smartsign.jpeg";
import smartSoftwareWatermark from "../../assets/smartsoftware/smartwatermark.jpeg";

export const COMPANY_CONFIG = {
  smartmatrix: {
    key: "smartmatrix",
    name: "SmartMatrix Digital Solutions Pvt. Ltd.",
    displayName: "SMARTMATRIX",
    tagline: "Digital Services & Solutions",
    quotationTitle: "PROFESSIONAL QUOTATION",

    certifications: ["ISO 27001:2013", "ISO 9001:2015"],

    contact: {
      email: "hr@smartmatrixtech.com",
      website: "www.smartmatrixtech.com",
      phone: "+91 2721 2397 | 9112106843",
    },

    address: {
      line1: "Shop No. 5, Athwagate Road,",
      line2: "Opp. Sombhai Material Road",
      city: "Surat, Gujarat, India",
    },

    authorizedPerson: {
      name: "Sanjay K.",
      role: "Project Lead",
      companyName: "SmartMatrix Digital Solutions Pvt. Ltd",
      phone: "+91 9765400796",
      email: "sanjay.k@smartmatrixds.com",
      location: "Pune, Maharashtra, India",
    },

    assets: {
      header: smartmatrixHeader,
      footer: smartmatrixFooter,
      logo: null,
      watermark: smartmatrixWatermark,
      signature: smartmatrixSignature,
      stamp: smartmatrixStamp,
    },
  },

  smartsoftware: {
    key: "smartsoftware",
    name: "Smart Software Services Pvt. Ltd.",
    displayName: "SMART SOFTWARE",
    tagline: "Digital Services & Solutions",
    quotationTitle: "PROFESSIONAL QUOTATION",

    // No certifications text exists anywhere in the project for this company.
    certifications: [],

    // No contact/address text exists anywhere in the project for this
    // company (only image assets). Left blank intentionally — fill in
    // once known, see final report.
    contact: {
      email: "hr@smartsoftwareservice.com",
      website: "https://smartsoftwareservice.com",
      phone: "+91 7066511234",
    },

    address: {
      line1: "",
      line2: "",
      city: "",
    },

    authorizedPerson: {
      name: "Sanjay K.",
      role: "",
      companyName: "Smart Software Services Pvt. Ltd.",
      phone: "+91 7066511234",
      email: "hr@smartsoftwareservice.com",
      location: "Pune",
    },

    assets: {
      header: smartSoftwareHeader,
      footer: smartSoftwareFooter,
      logo: smartSoftwareLogo,
      watermark: smartSoftwareWatermark,
      signature: smartSoftwareSignature,
      stamp: smartSoftwareStamp,
    },
  },
};

export const DEFAULT_COMPANY_KEY = "smartmatrix";

export const getCompany = (companyKey) =>
  COMPANY_CONFIG[companyKey] || COMPANY_CONFIG[DEFAULT_COMPANY_KEY];

export default COMPANY_CONFIG;
