import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MyQuotations = ({ onEdit }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [quotations, setQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [rejectionTooltip, setRejectionTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    placeBelow: false,
  });

  const currentEmpId = localStorage.getItem("empId") || "EMP-001"; 
  

  const fetchMyQuotations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/quotations/employee/id/${currentEmpId}`);
      if (response.ok) {
        const data = await response.json();
        setQuotations(data);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQuotations();
  }, [currentEmpId]);

  const parseObjectIdTime = (id) => {
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
      return NaN;
    }

    return parseInt(id.slice(0, 8), 16) * 1000;
  };

  const parseDateValue = (dateValue) => {
    if (!dateValue || typeof dateValue !== 'string') {
      return NaN;
    }

    const normalized = dateValue.trim();
    const direct = new Date(normalized).getTime();
    if (!Number.isNaN(direct)) {
      return direct;
    }

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
    if (!Number.isNaN(objectIdTime)) {
      return objectIdTime;
    }

    const rawDate = quote.createdAt || quote.updatedAt || quote.date;
    const parsedDate = parseDateValue(rawDate);
    if (!Number.isNaN(parsedDate)) {
      return parsedDate;
    }

    const quotationNumberValue = Number((quote.quotationNumber || '').replace(/\D/g, ''));
    if (!Number.isNaN(quotationNumberValue)) {
      return quotationNumberValue;
    }

    return 0;
  };

  const sortedQuotations = [...quotations].sort(
    (a, b) => parseQuotationTimestamp(b) - parseQuotationTimestamp(a)
  );

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const isRejectedStatus = (status) => (status || '').toLowerCase() === 'rejected';

  const showRejectionTooltip = (event, text) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const placeBelow = rect.top < 170;

    setRejectionTooltip({
      visible: true,
      text,
      x: rect.left + rect.width / 2,
      y: placeBelow ? rect.bottom + 8 : rect.top - 8,
      placeBelow,
    });
  };

  const hideRejectionTooltip = () => {
    setRejectionTooltip((prev) => ({ ...prev, visible: false }));
  };

  const handleRejectedHover = async (event, quote) => {
    if (!isRejectedStatus(quote.status)) {
      return;
    }

    if (quote.rejectionReason) {
      showRejectionTooltip(event, quote.rejectionReason);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/quotations/${quote.id}`);
      if (!response.ok) {
        return;
      }

      const fullQuote = await response.json();
      if (!fullQuote?.rejectionReason) {
        return;
      }

      setQuotations((prev) =>
        prev.map((item) =>
          item.id === quote.id
            ? { ...item, rejectionReason: fullQuote.rejectionReason }
            : item
        )
      );

      showRejectionTooltip(event, fullQuote.rejectionReason);
    } catch (error) {
      console.error('Failed to load rejection reason:', error);
    }
  };

  const search = searchTerm.toLowerCase();
  const filteredQuotations = sortedQuotations.filter(quote => {
    const matchesFilter = filter === 'all' || (quote.status && quote.status.toLowerCase() === filter.toLowerCase());
    const matchesSearch =
      (quote.client?.toLowerCase() || '').includes(search) ||
      (quote.quotationNumber?.toLowerCase() || '').includes(search) ||
      (quote.preparedBy?.toLowerCase() || '').includes(search);
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

  return (
    <div className="space-y-4 sm:space-y-6 p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">My Quotations</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage assigned quotations (ID: {currentEmpId})</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Status Filter Tabs */}
        <div className="p-4 border-b">
          <div className="flex flex-wrap gap-2">
            {['all', 'Draft', 'Pending', 'Approved', 'Rejected', 'Expired'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${
                  filter === status ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QUOTATION NO</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CLIENT</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">AMOUNT</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STATUS</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">CREATED DATE</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTION DATE</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">Loading...</td></tr>
              ) : paginatedQuotations.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No quotations found.</td></tr>
              ) : (
                paginatedQuotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">

                    {/* Quotation No */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          quote.status === "Approved" ? "bg-green-500" :
                          quote.status === "Pending" ? "bg-yellow-500" :
                          quote.status === "Rejected" ? "bg-red-500" :
                          "bg-gray-500"
                        }`}></div>
                        {quote.quotationNumber}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                      {quote.client}
                    </td>

                    {/* Amount */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm font-semibold hidden sm:table-cell">
                      ₹{(quote.finalAmount || quote.totalCost + (quote.gstAmount || 0))?.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td className="px-3 sm:px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          getStatusColor(quote.status)
                        } ${quote.status === "Rejected" ? "cursor-help" : ""}`}
                        onMouseEnter={(event) => handleRejectedHover(event, quote)}
                        onMouseLeave={hideRejectionTooltip}
                      >
                        {quote.status || 'Draft'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                      {quote.date || "--"}
                    </td>

                    {/* Action Date */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-600">
                      {quote.actionDate || "--"}
                    </td>

                    {/* Actions */}
                    <td className="px-3 sm:px-6 py-4 text-xs sm:text-sm">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => setSelectedQuote(quote)} 
                          className="text-green-600 hover:text-green-800 font-medium"
                        >
                          View
                        </button>

                        {(quote.status === "Draft" || quote.status === "Pending") && (
                          <button 
  onClick={() => onEdit(quote)}
  className="text-blue-600 hover:text-blue-800 font-medium">
  Edit
</button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuotations.length)} of {filteredQuotations.length}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
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
            transform: rejectionTooltip.placeBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
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

      {/* --- VIEW QUOTATION MODAL --- */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-gray-800">Quotation Summary</h3>
              <button onClick={() => setSelectedQuote(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Quotation Number</span>
                <span className="text-gray-900 font-bold">{selectedQuote.quotationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Client Name</span>
                <span className="text-gray-900 font-medium">{selectedQuote.client}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Project Name</span>
                <span className="text-gray-900">{selectedQuote.project || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Total Amount</span>
                <span className="text-green-600 font-bold">{selectedQuote.currency} {selectedQuote.totalCost?.toLocaleString()}</span>
              </div>
              {/* ✅ Date Row in Modal */}
              <div className="flex justify-between">
                <span className="text-gray-500">Created Date</span>
                <span className="text-gray-900">{selectedQuote.date || 'N/A'}</span>
              </div>

              {/* ✅ Added Action Date Row */}
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Action Date</span>
                <span className="text-blue-700 font-medium">{selectedQuote.actionDate || 'Not processed'}</span>
              </div>
            </div>

             {selectedQuote.status === "Rejected" && selectedQuote.rejectionReason && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-xs font-bold text-red-700 uppercase mb-1">Client Feedback</p>
                    <p className="text-sm text-gray-700 italic">"{selectedQuote.rejectionReason}"</p>
                  </div>
                )}

            <button 
              onClick={() => setSelectedQuote(null)}
              className="mt-8 w-full bg-gray-800 text-white py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuotations;