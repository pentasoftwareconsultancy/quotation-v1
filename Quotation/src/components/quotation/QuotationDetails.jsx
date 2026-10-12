import React from "react";
import { COMPANY_CONFIG } from "../../config/quotation/companyConfig";

const QuotationDetails = ({ formData, setFormData, onCompanyChange }) => {
  return (
    <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-4 lg:p-6 rounded-xl border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        Quotation Details
      </h3>
      <div className="space-y-3">
        {/* Company Selection */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Company:
          </label>
          <select
            value={formData.companyKey || "smartmatrix"}
            onChange={(e) => onCompanyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white"
          >
            {Object.values(COMPANY_CONFIG).map((c) => (
              <option key={c.key} value={c.key}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-gray-600 w-full sm:w-24 mb-1 sm:mb-0">Number:</label>
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={formData.quotationNumber}
            onChange={(e) => setFormData({ ...formData, quotationNumber: e.target.value })}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-gray-600 w-full sm:w-24 mb-1 sm:mb-0">Date:</label>
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center">
          <label className="text-sm font-medium text-gray-600 w-full sm:w-24 mb-1 sm:mb-0">Valid Until:</label>
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};

export default QuotationDetails;
