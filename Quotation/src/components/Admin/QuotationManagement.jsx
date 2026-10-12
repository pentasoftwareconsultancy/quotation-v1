import React, { useState, useEffect } from "react";

const QuotationManagement = () => {
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [modalType, setModalType] = useState("");
  const [rejectionTooltip, setRejectionTooltip] = useState({
    visible: false,
    text: "",
    x: 0,
    y: 0,
    placeBelow: false
  });

  const statusFilters = ["All", "Draft", "Pending", "Approved", "Rejected", "Expired"];

  const fetchQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/quotations");
      if (!response.ok) throw new Error("Failed to fetch quotations");
      const data = await response.json();
      setQuotations(data);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const parseObjectIdTime = (id) => {
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) return NaN;
    return parseInt(id.slice(0, 8), 16) * 1000;
  };

  const parseDateValue = (dateValue) => {
    if (!dateValue || typeof dateValue !== 'string') return NaN;
    const normalized = dateValue.trim();
    const direct = new Date(normalized).getTime();
    if (!Number.isNaN(direct)) return direct;
    const parts = normalized.split(/[/-]/);
    if (parts.length === 3) {
      const [dayPart, monthPart, yearPart] = parts;
      const day = Number(dayPart);
      const month = Number(monthPart);
      const year = Number(yearPart);
      if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
        return new Date(year, month - 1, day).getTime();
      }
    }
    return NaN;
  };

  const parseQuotationTimestamp = (quote) => {
    const objectIdTime = parseObjectIdTime(quote.id);
    if (!Number.isNaN(objectIdTime)) return objectIdTime;
    const rawDate = quote.createdAt || quote.updatedAt || quote.date;
    const parsedDate = parseDateValue(rawDate);
    if (!Number.isNaN(parsedDate)) return parsedDate;
    return 0;
  };

  const sortedQuotations = [...quotations].sort(
    (a, b) => parseQuotationTimestamp(b) - parseQuotationTimestamp(a)
  );

  const filteredQuotations = sortedQuotations.filter((quote) => {
    const currentStatus = quote.status || "Draft";
    const matchesFilter = activeFilter === "All" || currentStatus === activeFilter;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      (quote.client?.toLowerCase() || "").includes(search) ||
      (quote.quotationNumber?.toLowerCase() || "").includes(search) ||
      (quote.preparedBy?.toLowerCase() || "").includes(search);
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuotations = filteredQuotations.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleAction = async (quote, action) => {
    if (action === 'view') {
      try {
        const response = await fetch(`http://localhost:8080/api/quotations/${quote.id}`);
        const fullData = await response.json();
        setSelectedQuote(fullData);
      } catch (error) {
        console.error("Error fetching details:", error);
      }
    } else {
      setSelectedQuote(quote);
    }
    setModalType(action);
    setShowModal(true);
  };

const updateQuotationStatus = async (quotationId, newStatus) => {
  // Matches backend format: dd/MM/yyyy HH:mm
  const today = new Date();
  const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()} ${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

  try {
    const response = await fetch(`http://localhost:8080/api/quotations/${quotationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        status: newStatus,
        actionDate: formattedDate // Changed from statusDate to actionDate
      })
    });

    if (response.ok) {
      setQuotations(prev =>
        prev.map(q => q.id === quotationId ? { ...q, status: newStatus, actionDate: formattedDate } : q)
      );
      setSelectedQuote(prev => ({ ...prev, status: newStatus, actionDate: formattedDate }));
    }
  } catch (error) {
    console.error("Update Error:", error);
  }
};

  const handleDelete = async (quoteId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/quotations/${quoteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // remove from UI instantly
        setQuotations(prev => prev.filter((q) => q.id !== quoteId));
        setShowModal(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const showRejectionTooltip = (event, text) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const placeBelow = rect.top < 170;
    setRejectionTooltip({
      visible: true,
      text,
      x: rect.left + rect.width / 2,
      y: placeBelow ? rect.bottom + 8 : rect.top - 8,
      placeBelow
    });
  };

  const hideRejectionTooltip = () => {
    setRejectionTooltip((prev) => ({ ...prev, visible: false }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Draft": return "bg-gray-100 text-gray-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Expired": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusDot = (status) => {
    switch (status) {
      case "Approved": return "bg-green-500";
      case "Pending": return "bg-yellow-500";
      case "Draft": return "bg-gray-500";
      case "Rejected": return "bg-red-500";
      case "Expired": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Quotation Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                activeFilter === filter ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QUOTATION NO</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CLIENT</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">AMOUNT</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">DATE</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTION DATE</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-3"></div>
                      <p className="text-gray-500 font-medium">Loading quotations...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No quotations found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(quote.status)}`}></div>
                        {quote.quotationNumber}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">{quote.client}</td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-semibold hidden sm:table-cell">
                     ₹{(quote.finalAmount || quote.totalCost + (quote.gstAmount || 0))?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="relative inline-block"> 
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium cursor-help ${getStatusColor(quote.status)}`}
                          onMouseEnter={(event) => {
                            if (quote.status === "Rejected" && quote.rejectionReason) {
                              showRejectionTooltip(event, quote.rejectionReason);
                            }
                          }}
                          onMouseLeave={hideRejectionTooltip}
                        >
                          {quote.status || 'Draft'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">{quote.date}</td>
                    {/* 2. Added Action Date Data Cell */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                          {quote.actionDate || "--"} 
                      </td>
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                      <div className="flex gap-3">
                        <button onClick={() => handleAction(quote, 'view')} className="text-green-600 hover:text-green-800 font-medium">View</button>
                        <button onClick={() => handleAction(quote, 'delete')} className="text-red-600 hover:text-red-800 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {rejectionTooltip.visible && (
        <div
          className="fixed z-100000 pointer-events-none"
          style={{
            left: `clamp(180px, ${rejectionTooltip.x}px, calc(100vw - 180px))`,
            top: `${rejectionTooltip.y}px`,
            transform: rejectionTooltip.placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-white text-gray-800 text-sm rounded-xl p-4 shadow-2xl ring-1 ring-black/5 min-w-55 max-w-90">
            <p className="font-bold border-b border-gray-100 pb-2 mb-2 text-red-500 text-xs uppercase tracking-wider">
              Rejection Reason
            </p>
            <p className="leading-relaxed text-gray-700 font-serif whitespace-normal wrap-break-word">
              "{rejectionTooltip.text}"
            </p>
            {rejectionTooltip.placeBelow ? (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white drop-shadow-sm"></div>
            ) : (
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white drop-shadow-sm"></div>
            )}
          </div>
        </div>
      )}

      {showModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-gray-800 capitalize">
                {modalType} Quotation
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {modalType === "view" && (
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Quotation No</span>
                  <span className="text-gray-900 font-bold">{selectedQuote.quotationNumber}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Client</span>
                  <span className="text-gray-900">{selectedQuote.client}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="text-green-600 font-bold">
                    {selectedQuote.currency}{" "}
                    {(selectedQuote.finalAmount || selectedQuote.totalCost + (selectedQuote.gstAmount || 0))
                      ?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedQuote.status)}`}>
                    {selectedQuote.status || "Draft"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="text-gray-900">{selectedQuote.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Action Date</span>
                  <span className="text-gray-900">{selectedQuote.actionDate || "--"}</span>
                </div>
                {selectedQuote.status === "Rejected" && selectedQuote.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Client Feedback</p>
                    <p className="text-sm text-gray-700 italic">"{selectedQuote.rejectionReason}"</p>
                  </div>
                )}
                
                {/* ✅ ADD STATUS CHANGE SECTION */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Change Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["Draft", "Pending", "Approved", "Rejected"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          updateQuotationStatus(selectedQuote.id, status);
                        }}
                        className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                          selectedQuote.status === status 
                            ? "bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-200" 
                            : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button onClick={() => setShowModal(false)} className="mt-8 w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors">
                  Close Details
                </button>
              </div>
            )}

            {modalType === "edit" && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Update status for <span className="font-semibold text-gray-900">{selectedQuote.quotationNumber}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Draft", "Pending", "Approved", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateQuotationStatus(selectedQuote.id, status)}
                      className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                        selectedQuote.status === status ? "bg-blue-50 border-blue-500 text-blue-600" : "hover:bg-gray-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowModal(false)} className="mt-6 w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors">Done</button>
              </div>
            )}

            {modalType === "delete" && (
              <div className="space-y-5">
                <p className="text-gray-600 text-sm leading-relaxed">
                  Are you sure you want to delete quotation <span className="font-semibold text-gray-900">{selectedQuote.quotationNumber}</span>?
                </p>
                <div className="flex gap-3">
                  <button onClick={() => handleDelete(selectedQuote.id)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors">Delete</button>
                  <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationManagement;