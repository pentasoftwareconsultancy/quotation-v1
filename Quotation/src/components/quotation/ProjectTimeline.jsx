import React from "react";
import { calculateTimelineWeeks } from "../../utils/quotation/quotationCalculations";

const ProjectTimeline = ({ formData, setFormData }) => {
  const addTimelineRow = () => {
    setFormData({
      ...formData,
      timeline: [
        ...formData.timeline,
        {
          srNo: formData.timeline.length + 1,
          phase: "",
          duration: "",
          deliverables: "",
        },
      ],
    });
  };

  const removeTimelineRow = (index) => {
    const newTimeline = formData.timeline.filter((_, i) => i !== index);
    setFormData({ ...formData, timeline: newTimeline });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">5</span>
          Project Timeline
        </h2>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-linear-to-r from-blue-50 to-indigo-50">
                <th className="border border-gray-200 p-3 text-left font-semibold text-gray-700 text-sm w-20">Sr. No</th>
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">Phase</th>
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">Duration</th>
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700">Deliverables</th>
                <th className="border border-gray-200 p-4 text-left font-semibold text-gray-700 w-20">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.timeline?.map((phase, index) => (
                <tr key={index} className="hover:bg-blue-50 transition-colors">
                  <td className="border border-gray-200 p-3 text-center font-medium text-gray-600">
                    {index + 1}
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-semibold text-blue-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={phase.phase}
                      onChange={(e) => {
                        const newTimeline = [...formData.timeline];
                        newTimeline[index].phase = e.target.value;
                        setFormData({ ...formData, timeline: newTimeline });
                      }}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent font-medium text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={phase.duration}
                      onChange={(e) => {
                        const newTimeline = [...formData.timeline];
                        newTimeline[index].duration = e.target.value;
                        setFormData({ ...formData, timeline: newTimeline });
                      }}
                    />
                  </td>

                  <td className="border border-gray-200 p-4">
                    <input
                      type="text"
                      className="w-full outline-none bg-transparent text-gray-700 focus:bg-blue-50 focus:ring-2 focus:ring-blue-200 rounded px-2 py-1"
                      value={phase.deliverables}
                      onChange={(e) => {
                        const newTimeline = [...formData.timeline];
                        newTimeline[index].deliverables = e.target.value;
                        setFormData({ ...formData, timeline: newTimeline });
                      }}
                    />
                  </td>

                  {/* REMOVE BUTTON */}
                  <td className="border border-gray-200 p-4 text-center">
                    <button
                      onClick={() => removeTimelineRow(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-xs">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold text-gray-800">Total Timeline:</span>
            <input
              type="text"
              readOnly
              value={`${calculateTimelineWeeks(formData.timeline)} Weeks`}
              className="flex-1 sm:max-w-xs px-3 py-2 border border-blue-200 rounded-lg font-bold text-blue-700 bg-white"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={addTimelineRow}
            className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center">
            <span className="mr-2">+</span> Add Phase
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;
