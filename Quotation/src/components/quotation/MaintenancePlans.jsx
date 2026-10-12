import React from "react";
import { calculateMaintenanceRange } from "../../utils/quotation/quotationCalculations";

const MaintenancePlans = ({ formData, setFormData }) => {
  const updateMaintenancePlan = (index, field, value) => {
    const updated = [...formData.maintenancePlans];
    updated[index][field] = value;

    setFormData({
      ...formData,
      maintenancePlans: updated,
    });
  };

  const addMaintenancePlan = () => {
    setFormData({
      ...formData,
      maintenancePlans: [...formData.maintenancePlans, { plan: "", coverage: "", monthly: "" }],
    });
  };

  const removeMaintenancePlan = (index) => {
    const updated = formData.maintenancePlans.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      maintenancePlans: updated,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            7
          </span>
          Post-Launch Maintenance (Optional, 12-Month Contract)
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-blue-50 to-indigo-50">
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Plan
                </th>

                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Coverage
                </th>

                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Monthly (₹)
                </th>

                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {formData.maintenancePlans?.map((plan, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-semibold text-blue-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={plan.plan}
                      onChange={(e) => updateMaintenancePlan(index, "plan", e.target.value)}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={plan.coverage}
                      onChange={(e) => updateMaintenancePlan(index, "coverage", e.target.value)}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="number"
                      className="w-full outline-none bg-transparent font-semibold text-gray-800 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={plan.monthly}
                      onChange={(e) => updateMaintenancePlan(index, "monthly", e.target.value)}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <button
                      onClick={() => removeMaintenancePlan(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Plan Button */}
        <div className="mt-6">
          <button
            onClick={addMaintenancePlan}
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium shadow">
            + Add Plan
          </button>
        </div>

        {/* Total Range */}
        <p className="mt-6 font-semibold text-gray-800">
          Total Range: {calculateMaintenanceRange(formData.maintenancePlans)} <span className="font-normal">(per year, Excl. GST)</span>
        </p>

        {/* Note */}
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-semibold">Note:</span> Usage-based recurring costs excluded from development quote per industry norms. Client manages billing directly with providers.
        </p>
      </div>
    </div>
  );
};

export default MaintenancePlans;
