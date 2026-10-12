import React from "react";

const QuotationFooter = ({ company }) => {
  return (
    <div className="bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10"></div>
      <div className="relative px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
          <div>
            <h4 className="font-semibold mb-2 text-orange-400">Contact Information</h4>
            <div className="space-y-1 text-sm">
              {company.contact.email && (
                <div className="flex items-center"><span className="mr-2">📧</span> {company.contact.email}</div>
              )}
              {company.contact.website && (
                <div className="flex items-center"><span className="mr-2">🌐</span> {company.contact.website}</div>
              )}
              {company.contact.phone && (
                <div className="flex items-center"><span className="mr-2">📱</span> {company.contact.phone}</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-orange-400">Office Address</h4>
            <div className="text-sm text-gray-300">
              {company.address.line1 && <>{company.address.line1}<br /></>}
              {company.address.line2 && <>{company.address.line2}<br /></>}
              {company.address.city}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-orange-400">Certifications</h4>
            <div className="text-sm text-gray-300">
              {company.certifications?.map((cert) => (
                <div key={cert} className="flex items-center mb-1"><span className="mr-2">🏆</span> {cert}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
    </div>
  );
};

export default QuotationFooter;
