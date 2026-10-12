import React from "react";
import { calculatePayment, formatIndianCurrency } from "../../utils/quotation/quotationCalculations";

const PaymentTerms = ({ formData, setFormData }) => {
  const gstPercent = formData.gstPercent || 0;

  const updatePaymentTerm = (index, field, value) => {
    const updated = [...formData.paymentTerms];
    updated[index][field] = value;

    setFormData({
      ...formData,
      paymentTerms: updated,
    });
  };

  const addPaymentTerm = () => {
    setFormData({
      ...formData,
      paymentTerms: [...formData.paymentTerms, { percent: "", label: "" }],
    });
  };

  const removePaymentTerm = (index) => {
    const updated = formData.paymentTerms.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      paymentTerms: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-green-600 to-emerald-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            6
          </span>
          Payment Terms (Net 30 Days Invoicing)
        </h2>
      </div>

      <div className="p-6 space-y-3">
        {formData.paymentTerms?.map((term, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="number"
              value={term.percent}
              onChange={(e) => updatePaymentTerm(index, "percent", e.target.value)}
              className="w-20 border border-gray-300 rounded px-2 py-1 text-center"
            />

            <span className="font-semibold">%</span>

            <span className="text-gray-600">
              ({formatIndianCurrency(calculatePayment(formData.totalCost, term.percent))})
            </span>

            <input
              type="text"
              value={term.label}
              onChange={(e) => updatePaymentTerm(index, "label", e.target.value)}
              className="flex-1 border border-gray-300 rounded px-3 py-1"
            />

            <button
              onClick={() => removePaymentTerm(index)}
              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add Button */}
        <button
          onClick={addPaymentTerm}
          className="mt-3 bg-green-500 text-white px-5 py-2 rounded hover:bg-green-600 text-sm"
        >
          + Add Payment Term
        </button>

        {/* GST */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-green-600 font-bold">•</span>
          <span>GST @ {gstPercent}% extra as applicable</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentTerms;
