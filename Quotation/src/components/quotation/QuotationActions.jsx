import React from "react";

const QuotationActions = ({ onSave, onPreview }) => {
  return (
    <div className="bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row gap-8 justify-center">
        <button
          onClick={onSave}
          className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base">
          Save Quotation
        </button>

        <button
          onClick={onPreview}
          className="bg-linear-to-r from-purple-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
          Preview Quotation
        </button>
      </div>
    </div>
  );
};

export default QuotationActions;
