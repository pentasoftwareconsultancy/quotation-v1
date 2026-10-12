import React from "react";
import { formatIndianCurrency } from "../../utils/quotation/quotationCalculations";

const CostBreakdown = ({ formData, setFormData, gstAmount, finalAmount }) => {
  const addCostItem = () => {
    setFormData((prev) => ({
      ...prev,
      costBreakdown: [
        ...prev.costBreakdown,
        {
          srNo: prev.costBreakdown.length + 1,
          area: "",
          scope: "",
          amount: "",
        },
      ],
    }));
  };

  const removeCostItem = (index) => {
    const newItems = formData.costBreakdown.filter((_, i) => i !== index);
    const reNumberedItems = newItems.map((item, i) => ({ ...item, srNo: i + 1 }));
    setFormData({ ...formData, costBreakdown: reNumberedItems });
  };

  const updateCostItem = (index, field, value) => {
    const newItems = formData.costBreakdown.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, costBreakdown: newItems });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-slate-700 to-slate-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
          Cost Breakdown
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-gray-50 to-gray-100">
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm w-20">Sr. No</th>
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm">Development Area</th>
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm">Resources Assigned</th>
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm w-32">Amount (₹)</th>
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.costBreakdown?.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="border border-gray-200 p-3 text-center font-medium text-gray-600">{item.srNo}</td>
                  <td className="border border-gray-200 p-3">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-medium text-gray-800 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 transition-all"
                      value={item.area}
                      onChange={(e) => updateCostItem(index, "area", e.target.value)}
                      placeholder="Enter development area"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <textarea
                      className="w-full outline-none bg-transparent text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 transition-all resize-none text-sm leading-relaxed"
                      rows="3"
                      value={item.scope}
                      onChange={(e) => updateCostItem(index, "scope", e.target.value)}
                      placeholder="Enter resources assigne details"
                    />
                  </td>
                  <td className="border border-gray-200 p-3">
                    <input
                      type="number"
                      className="w-full outline-none bg-transparent font-semibold text-orange-600 focus:bg-orange-50 focus:ring-2 focus:ring-orange-200 rounded px-2 py-1 transition-all text-center"
                      value={item.amount}
                      onChange={(e) => updateCostItem(index, "amount", e.target.value)}
                      placeholder="Amount"
                    />
                  </td>
                  <td className="border border-gray-200 p-3 text-center">
                    <button
                      onClick={() => removeCostItem(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="bg-linear-to-r from-orange-100 to-amber-100 font-bold">
                <td className="border border-gray-200 p-4 text-right" colSpan="3">
                  <span className="text-gray-800 text-lg">TOTAL PROJECT COST</span>
                </td>
                <td className="border border-gray-200 p-4 text-center">
                  <span className="text-orange-700 text-lg font-bold">{formatIndianCurrency(formData.totalCost)}</span>
                </td>
                <td className="border border-gray-200 p-4"></td>
              </tr>

              {/*=========  GST row ========= */}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan="3" className="border border-gray-200 p-4 text-right">
                  <span className="mr-2">GST</span>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.gstPercent === 0 ? "" : formData.gstPercent}
                    onChange={(e) => {
                      const value = e.target.value;

                      setFormData({
                        ...formData,
                        gstPercent: value === "" ? "" : Number(value),
                      });
                    }}
                    onBlur={() => {
                      if (formData.gstPercent === "") {
                        setFormData({
                          ...formData,
                          gstPercent: 0,
                        });
                      }
                    }}
                    className="w-16 text-center border border-gray-300 rounded px-1 mx-1"
                  /> %
                </td>

                <td className="border border-gray-200 p-4 text-center text-blue-700">
                  {formatIndianCurrency(gstAmount)}
                </td>

                <td className="border border-gray-200 p-4"></td>
              </tr>

              {/* FINAL AMOUNT */}
              <tr className="bg-green-100 font-bold">
                <td colSpan="3" className="border border-gray-200 p-4 text-right text-lg">
                  FINAL AMOUNT
                </td>

                <td className="border border-gray-200 p-4 text-center text-green-700 text-lg">
                  {formatIndianCurrency(finalAmount)}
                </td>

                <td className="border border-gray-200 p-4"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={addCostItem}
            className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <span className="mr-2">+</span> Add Cost Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdown;
