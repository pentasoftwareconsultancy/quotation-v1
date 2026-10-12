import React from "react";
import { formatIndianCurrency } from "../../utils/quotation/quotationCalculations";

const InvestmentSummary = ({ formData, setFormData, gstAmount, finalAmount }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-emerald-600 to-green-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            9
          </span>
          Project Investment Summary
        </h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Total Project Cost */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="font-semibold text-gray-700 w-56">
            Total Project Cost
          </span>

          <input
            type="text"
            readOnly
            value={formatIndianCurrency(formData.totalCost)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold text-gray-800"
          />
        </div>

        {/* GST Input */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="font-semibold text-gray-700 w-56">
            GST Percentage
          </span>

          <input
            type="number"
            min="0"
            max="100"
            value={formData.gstPercent}
            onChange={(e) =>
              setFormData({
                ...formData,
                gstPercent: Number(e.target.value),
              })
            }
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
          />

          <span className="text-gray-600">% GST Applicable</span>
        </div>

        {/* GST Amount */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="font-semibold text-gray-700 w-56">
            GST Amount
          </span>

          <input
            type="text"
            readOnly
            value={formatIndianCurrency(gstAmount)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold text-blue-700"
          />
        </div>

        {/* Final Amount */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t pt-4">
          <span className="font-bold text-gray-800 w-56 text-lg">
            Final Project Investment
          </span>

          <input
            type="text"
            readOnly
            value={formatIndianCurrency(finalAmount)}
            className="px-3 py-2 border border-green-300 rounded-lg bg-green-50 font-bold text-green-700 text-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default InvestmentSummary;
