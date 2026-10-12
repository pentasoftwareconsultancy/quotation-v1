import React from "react";

const Assumptions = ({ formData, setFormData }) => {
  const updateAssumption = (section, index, value) => {
    const updated = [...formData.assumptions[section]];
    updated[index] = value;

    setFormData({
      ...formData,
      assumptions: {
        ...formData.assumptions,
        [section]: updated,
      },
    });
  };

  const addAssumption = (section) => {
    setFormData({
      ...formData,
      assumptions: {
        ...formData.assumptions,
        [section]: [...formData.assumptions[section], ""],
      },
    });
  };

  const removeAssumption = (section, index) => {
    const updated = formData.assumptions[section].filter((_, i) => i !== index);

    setFormData({
      ...formData,
      assumptions: {
        ...formData.assumptions,
        [section]: updated,
      },
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-slate-700 to-slate-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-slate-700 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            8
          </span>
          Assumptions, Exclusions & Warranty
        </h2>
      </div>

      <div className="p-6 space-y-8">
        {/* INCLUDED */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Included</h3>

          {formData.assumptions.included.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateAssumption("included", index, e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2"
              />

              <button
                onClick={() => removeAssumption("included", index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs flex-shrink-0"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={() => addAssumption("included")}
            className="mt-2 text-blue-600 font-medium"
          >
            + Add Included
          </button>
        </div>

        {/* EXCLUDED */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Excluded</h3>
          {formData.assumptions.excluded.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateAssumption("excluded", index, e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2" />

              <button
                onClick={() => removeAssumption("excluded", index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs flex-shrink-0">
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={() => addAssumption("excluded")}
            className="mt-2 text-blue-600 font-medium">
            + Add Exclusion
          </button>
        </div>

        {/* WARRANTY */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">Warranty & Support</h3>

          {formData.assumptions.warranty.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => updateAssumption("warranty", index, e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2" />

              <button
                onClick={() => removeAssumption("warranty", index)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs flex-shrink-0">
                Remove
              </button>
            </div>
          ))}

          <button
            onClick={() => addAssumption("warranty")}
            className="mt-2 text-blue-600 font-medium">
            + Add Warranty
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assumptions;
