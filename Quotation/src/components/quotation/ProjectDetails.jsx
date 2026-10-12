import React from "react";
import { formatIndianCurrency } from "../../utils/quotation/quotationCalculations";

const ProjectDetails = ({ formData, setFormData, finalAmount }) => {
  return (
    <div className="bg-linear-to-br from-orange-50 to-amber-50 p-4 lg:p-6 rounded-xl border border-orange-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
        Project Details
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Project Name:</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
            value={formData.project || ""}
            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Final Amount:</label>
          <input
            type="text"
            readOnly
            value={formatIndianCurrency(finalAmount)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 font-semibold text-orange-700"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Version:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Currency:</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
