import React from "react";

const AuthorizedSignature = ({ formData, setFormData, company }) => {
  const signatureSrc = formData.signature || company.assets.signature;
  const stampSrc = formData.companyStamp || company.assets.stamp;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-linear-to-r from-gray-700 to-gray-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="w-6 h-6 bg-white text-gray-700 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
            10
          </span>
          Authorized Signature
        </h2>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-8 items-start">
        {/* Left Side Info */}
        <div className="space-y-3">
          <input
            type="text"
            value={formData.authorizedName}
            placeholder="Authorized Person Name"
            onChange={(e) => setFormData({ ...formData, authorizedName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={formData.authorizedRole}
            placeholder="Designation"
            onChange={(e) => setFormData({ ...formData, authorizedRole: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={formData.companyName}
            placeholder="Company Name"
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={formData.contactNumber}
            placeholder="Contact Number"
            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            value={formData.contactEmail}
            placeholder="Email Address"
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            value={formData.location}
            placeholder="Location"
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Signature + Stamp Upload */}
        <div className="text-center space-y-6">
          {/* Signature Upload */}
          <div>
            <p className="font-semibold text-gray-700 mb-3">
              Authorized Signature
            </p>

            <div
              className="w-35 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 mx-auto"
              onClick={() => document.getElementById("signatureUpload").click()}
            >
              {signatureSrc ? (
                <img
                  src={signatureSrc}
                  alt="Signature"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  Upload Signature
                </span>
              )}
            </div>

            <input
              id="signatureUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  setFormData({
                    ...formData,
                    signature: event.target.result,
                  });
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          {/* Company Stamp */}
          <div>
            <p className="font-semibold text-gray-700 mb-3">
              Company Stamp
            </p>

            <div
              className="w-40 h-25 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 mx-auto"
              onClick={() => document.getElementById("companyStamp").click()}
            >
              {stampSrc ? (
                <img
                  src={stampSrc}
                  alt="Stamp"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">
                  Click to Upload
                </span>
              )}
            </div>

            <input
              id="companyStamp"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                  setFormData({
                    ...formData,
                    companyStamp: event.target.result,
                  });
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="px-6 pb-6">
        <textarea
          rows="2"
          placeholder="Note..."
          value={formData.signatureNote}
          onChange={(e) => setFormData({ ...formData, signatureNote: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default AuthorizedSignature;
