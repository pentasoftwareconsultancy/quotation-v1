import React from "react";

const TechnologyStack = ({ formData, setFormData }) => {
  const addTechStack = () => {
    setFormData({
      ...formData,
      techStack: [...formData.techStack, { component: "", technology: "", rationale: "" }],
    });
  };

  const removeTechStack = (index) => {
    const newStack = formData.techStack.filter((_, i) => i !== index);
    setFormData({ ...formData, techStack: newStack });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">3</span>
          Technology Stack
        </h2>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-blue-50 to-indigo-50">
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Component
                </th>

                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Technology
                </th>

                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">
                  Rationale
                </th>

                <th className="border border-gray-200 p-4 text-center font-semibold text-gray-700 w-20">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {formData.techStack?.map((tech, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-semibold text-blue-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 transition-all"
                      value={tech.component}
                      onChange={(e) => {
                        const newStack = [...formData.techStack];
                        newStack[index].component = e.target.value;
                        setFormData({ ...formData, techStack: newStack });
                      }}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-medium text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 transition-all"
                      value={tech.technology}
                      onChange={(e) => {
                        const newStack = [...formData.techStack];
                        newStack[index].technology = e.target.value;
                        setFormData({ ...formData, techStack: newStack });
                      }}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1 transition-all"
                      value={tech.rationale}
                      onChange={(e) => {
                        const newStack = [...formData.techStack];
                        newStack[index].rationale = e.target.value;
                        setFormData({ ...formData, techStack: newStack });
                      }}
                    />
                  </td>

                  {/* REMOVE BUTTON */}
                  <td className="border border-gray-200 p-4 text-center min-w-25">
                    <button
                      onClick={() => removeTechStack(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Technology Row Button */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={addTechStack}
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <span className="mr-2">+</span> Add Technology
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnologyStack;
