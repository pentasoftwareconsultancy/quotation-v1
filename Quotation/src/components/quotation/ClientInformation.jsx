import React from "react";

const ClientInformation = ({ formData, setFormData }) => {
  return (
    <div className="bg-linear-to-br from-green-50 to-emerald-50 p-4 lg:p-6 rounded-xl border border-green-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
        Client Information
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Client Name:</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            value={formData.client || ""}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            placeholder="Enter client name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">
            Organization
          </label>

          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100"
            value={formData.clientOrganization ?? ""}
            readOnly
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Email:</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            value={formData.clientEmail || ""}
            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
            placeholder="Enter email address"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Phone No:</label>
          <input
            type="tel"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
            value={formData.clientPhone || ""}
            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
            placeholder="Enter phone number"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Address:</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none"
            rows="2"
            value={formData.clientAddress || ""}
            onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
            placeholder="Enter client address"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientInformation;
