import React from "react";

const ScopeOfWork = ({ formData, setFormData }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-pink-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-pink-500 to-pink-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-pink-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            2
          </span>
          Scope of Work
        </h2>
      </div>

      {/* Body */}
      <div className="p-6 bg-pink-50">
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-pink-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none resize-none text-sm"
          placeholder="Write something about scope of project..."
          value={formData.scopeOfWork}
          onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ScopeOfWork;
