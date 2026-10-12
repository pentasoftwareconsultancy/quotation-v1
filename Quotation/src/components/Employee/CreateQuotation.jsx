import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import QuotationPreview from './QuotationPreview';

import { COMPANY_CONFIG, DEFAULT_COMPANY_KEY, getCompany } from '../../config/quotation/companyConfig';
import { QUOTATION_DEFAULTS } from '../../config/quotation/quotationDefaults';
import { calculateTotal, calculateGST, calculateFinalAmount } from '../../utils/quotation/quotationCalculations';

import QuotationHeader from '../quotation/QuotationHeader';
import QuotationDetails from '../quotation/QuotationDetails';
import ClientInformation from '../quotation/ClientInformation';
import ProjectDetails from '../quotation/ProjectDetails';
import AboutProject from '../quotation/AboutProject';
import ScopeOfWork from '../quotation/ScopeOfWork';
import TechnologyStack from '../quotation/TechnologyStack';
import CostBreakdown from '../quotation/CostBreakdown';
import ProjectTimeline from '../quotation/ProjectTimeline';
import PaymentTerms from '../quotation/PaymentTerms';
import MaintenancePlans from '../quotation/MaintenancePlans';
import Assumptions from '../quotation/Assumptions';
import InvestmentSummary from '../quotation/InvestmentSummary';
import AuthorizedSignature from '../quotation/AuthorizedSignature';
import QuotationFooter from '../quotation/QuotationFooter';
import QuotationActions from '../quotation/QuotationActions';

const defaultCompany = COMPANY_CONFIG[DEFAULT_COMPANY_KEY];

// Deep-clone the shared defaults so editing one quotation's techStack/
// costBreakdown/etc. (which several handlers mutate index-in-place before
// spreading) never bleeds into another quotation created later in the
// same session.
const cloneDefault = (value) => JSON.parse(JSON.stringify(value));

const buildInitialFormData = () => ({
  companyKey: DEFAULT_COMPANY_KEY,
  quotationNumber: `QT-${Date.now().toString().slice(-6)}`,
  date: new Date().toLocaleDateString('en-IN'),
  validUntil: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
  project: '',
  client: '',
  clientOrganization: '',
  clientAddress: '',
  clientEmail: '',
  clientPhone: '',
  preparedBy: 'Development Team',
  documentType: QUOTATION_DEFAULTS.documentType,
  version: QUOTATION_DEFAULTS.version,
  currency: QUOTATION_DEFAULTS.currency,
  totalCost: 0,
  gstPercent: QUOTATION_DEFAULTS.gstPercent,
  aboutProject: '',
  scopeOfWork: '',
  techStack: cloneDefault(QUOTATION_DEFAULTS.techStack),
  costBreakdown: cloneDefault(QUOTATION_DEFAULTS.costBreakdown),
  includes: cloneDefault(QUOTATION_DEFAULTS.includes),
  timeline: cloneDefault(QUOTATION_DEFAULTS.timeline),
  paymentTerms: cloneDefault(QUOTATION_DEFAULTS.paymentTermsDefault),
  maintenancePlans: cloneDefault(QUOTATION_DEFAULTS.maintenancePlans),

  authorizedName: defaultCompany.authorizedPerson.name,
  authorizedRole: defaultCompany.authorizedPerson.role,
  companyName: defaultCompany.authorizedPerson.companyName,
  contactNumber: defaultCompany.authorizedPerson.phone,
  contactEmail: defaultCompany.authorizedPerson.email,
  location: defaultCompany.authorizedPerson.location,

  // No upload yet — rendering falls back to the selected company's
  // default signature/stamp (see AuthorizedSignature.jsx).
  signatureUpload: null,
  signature: null,
  companyStamp: null,
  signatureNote: QUOTATION_DEFAULTS.signatureNote,

  assumptions: cloneDefault(QUOTATION_DEFAULTS.assumptions),
});

const CreateQuotation = ({ selectedClient, editData }) => {

  const { id } = useParams();

  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState(buildInitialFormData);

  const company = getCompany(formData.companyKey);

  const onCompanyChange = (newCompanyKey) => {
    const newCompany = getCompany(newCompanyKey);

    setFormData((prev) => ({
      ...prev,
      companyKey: newCompanyKey,
      authorizedName: newCompany.authorizedPerson.name,
      authorizedRole: newCompany.authorizedPerson.role,
      companyName: newCompany.authorizedPerson.companyName,
      contactNumber: newCompany.authorizedPerson.phone,
      contactEmail: newCompany.authorizedPerson.email,
      location: newCompany.authorizedPerson.location,
    }));
  };

  useEffect(() => {
    // 1. Logic for EDITING an existing quotation
    if (editData) {
      setFormData(prev => ({
        ...prev,
        ...editData,
        companyKey: editData.companyKey || DEFAULT_COMPANY_KEY,
        clientOrganization: editData.clientOrganization || prev.clientOrganization || "",
        assumptions: editData.assumptions || {
          included: [],
          excluded: [],
          warranty: []
        }
      }));

      // 🔥 FETCH ORGANIZATION IF MISSING
      if (!editData.clientOrganization && editData.client) {
        fetch(`https://quotation-v1-y2m6.onrender.com/api/clients`)
          .then(res => res.json())
          .then(data => {
            const matchedClient = data.find(
              c => c.name === editData.client
            );

            if (matchedClient) {
              setFormData(prev => ({
                ...prev,
                clientOrganization: matchedClient.organization || ""
              }));
            }
          })
          .catch(err => console.error("Error fetching organization:", err));
      }

      console.log("Mode: Editing existing quotation");

    } else if (!editData && selectedClient) {   // 🔥 IMPORTANT FIX
      setFormData((prev) => ({
        ...prev,
        client: selectedClient.name || '',
        clientEmail: selectedClient.email || '',
        clientPhone: selectedClient.phone || '',
        clientAddress: selectedClient.address || '',
        clientOrganization: selectedClient.organization || ""

      }));
      console.log("Mode: Creating new quote for client");
    }
  }, [id, editData, selectedClient]);

  useEffect(() => {
    const total = calculateTotal(formData.costBreakdown);
    setFormData((prev) => ({
      ...prev,
      totalCost: total
    }));
  }, [formData.costBreakdown]);

  useEffect(() => {

    if (formData.totalCost < 10000) {

      setFormData(prev => ({
        ...prev,
        paymentTerms: cloneDefault(QUOTATION_DEFAULTS.paymentTermsSmallProject)
      }));

    } else {

      setFormData(prev => ({
        ...prev,
        paymentTerms: cloneDefault(QUOTATION_DEFAULTS.paymentTermsDefault)
      }));

    }

  }, [formData.totalCost]);


  // ===========  GST =====================
  const gstPercent = formData.gstPercent || 0;

  const gstAmount = calculateGST(formData.totalCost, gstPercent);

  const finalAmount = calculateFinalAmount(formData.totalCost, gstAmount);

  const saveQuotation = async () => {
    if (!formData.client || !formData.project) {
      toast.warning(" Client and Project name required");
      return;
    }

    const currentEmpId = localStorage.getItem("empId");

    if (!currentEmpId) {
      toast.error(" Session expired. Please login again");
      return;
    }

    const payload = {
      ...formData,
      clientOrganization: formData.clientOrganization ?? "",
      totalCost: formData.totalCost,
      gstAmount: gstAmount,
      finalAmount: finalAmount,
      preparedBy: currentEmpId,
      status: "Draft"
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://quotation-v1-y2m6.onrender.com/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        toast.error(" Error saving quotation");
        return;
      }

      const data = await response.json();

      setFormData(prev => ({
        ...prev,
        id: data.id
      }));

      toast.success(" Quotation Saved Successfully!");

      setShowPreview(true);

    } catch (error) {
      console.error("Error:", error);
      toast.error(" Server error. Try again later");
    }
  };

  const handlePreviewClick = () => {
    if (!formData.id) {
      toast.error("Please save the quotation before previewing or sending for approval.");
      return;
    }
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl">
        <QuotationHeader company={company} />

        {/* Quotation Details */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
            <QuotationDetails
              formData={formData}
              setFormData={setFormData}
              onCompanyChange={onCompanyChange}
            />

            <ClientInformation
              formData={formData}
              setFormData={setFormData}
            />

            <ProjectDetails
              formData={formData}
              setFormData={setFormData}
              finalAmount={finalAmount}
            />
          </div>
        </div>

        {/* About Project */}
        <div className="px-4 sm:px-6 lg:px-8 pb-2">
          <AboutProject formData={formData} setFormData={setFormData} />
        </div>

        {/* Scope of Work */}
        <div className="px-4 sm:px-6 lg:px-8 pb-2">
          <ScopeOfWork formData={formData} setFormData={setFormData} />
        </div>

        {/* Technology Stack */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <TechnologyStack formData={formData} setFormData={setFormData} />
        </div>

        {/* Cost Breakdown */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <CostBreakdown
            formData={formData}
            setFormData={setFormData}
            gstAmount={gstAmount}
            finalAmount={finalAmount}
          />
        </div>

        {/* Project Timeline */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <ProjectTimeline formData={formData} setFormData={setFormData} />
        </div>

        {/* Payment Terms */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <PaymentTerms formData={formData} setFormData={setFormData} />
        </div>

        {/* Post-Launch Maintenance */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <MaintenancePlans formData={formData} setFormData={setFormData} />
        </div>

        {/* Assumptions, Exclusions & Warranty */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <Assumptions formData={formData} setFormData={setFormData} />
        </div>

        {/* Investment Summary */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <InvestmentSummary
            formData={formData}
            setFormData={setFormData}
            gstAmount={gstAmount}
            finalAmount={finalAmount}
          />
        </div>

        {/* Authorized Signature */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <AuthorizedSignature
            formData={formData}
            setFormData={setFormData}
            company={company}
          />
        </div>

        {/* Footer */}
        <QuotationFooter company={company} />

        {/* Action Buttons */}
        <QuotationActions onSave={saveQuotation} onPreview={handlePreviewClick} />

        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <QuotationPreview
          formData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default CreateQuotation;
