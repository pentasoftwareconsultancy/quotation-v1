import React from "react";

const QuotationHeader = ({ company }) => {
  return (
    <div className="bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10"></div>
      <div className="relative px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {company.displayName?.slice(0, 2) || "SM"}
                </span>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold tracking-wide">{company.displayName}</div>
                <div className="text-sm lg:text-base text-gray-300">{company.tagline}</div>
              </div>
            </div>
          </div>
          <div className="text-white text-right">
            <div className="text-lg lg:text-xl font-semibold mb-1">{company.quotationTitle}</div>
            {company.certifications?.length > 0 && (
              <div className="text-sm text-gray-300">
                {company.certifications.join(" | ")} Certified
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-orange-400 via-yellow-400 to-orange-400"></div>
    </div>
  );
};

export default QuotationHeader;
