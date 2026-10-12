import React from "react";

const AboutProject = ({ formData, setFormData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-yellow-600 to-yellow-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            1
          </span>
          About Project
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 bg-yellow-50">
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none resize-none text-sm"
          placeholder="Write something about the project..."
          value={formData.aboutProject}
          onChange={(e) => setFormData({ ...formData, aboutProject: e.target.value })}
        />
      </div>
    </div>
  );
};

export default AboutProject;
