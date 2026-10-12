import React, { useState, useEffect } from 'react';

const InvoiceGenerator = () => {
  const [invoices, setInvoices] = useState([]);
  const [groupedClients, setGroupedClients] = useState({});
  const [expandedClient, setExpandedClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingStatusInvoiceId, setEditingStatusInvoiceId] = useState(null);
  const [statusPickerPos, setStatusPickerPos] = useState({ top: 0, left: 0 });
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const fetchAllInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/all-invoices`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInvoices();
  }, []);

  useEffect(() => {
    const grouped = invoices.reduce((acc, invoice) => {
      const name = invoice.clientName || "Unknown Client";
      if (!acc[name]) {
        acc[name] = {
          clientName: name,
          invoices: [],
          totalInvoices: 0,
          latestInvoiceDate: invoice.invoiceDate || "-",
        };
      }
      acc[name].invoices.push(invoice);
      acc[name].totalInvoices = acc[name].invoices.length;

      const existing = new Date(acc[name].latestInvoiceDate);
      const current = new Date(invoice.invoiceDate);
      if (!Number.isNaN(current.getTime()) && (Number.isNaN(existing.getTime()) || current > existing)) {
        acc[name].latestInvoiceDate = invoice.invoiceDate;
      }
      return acc;
    }, {});
    setGroupedClients(grouped);
  }, [invoices]);

  const handleClientExpand = (clientName) => {
    setExpandedClient((prev) => (prev === clientName ? null : clientName));
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/update-status/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setEditingStatusInvoiceId(null);
        // Refresh from backend to ensure consistency
        await fetchAllInvoices();
      } else {
        console.error('Failed to update status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    const targetId = invoiceToDelete.id || invoiceToDelete._id;
    if (!targetId) {
      console.error("Error: Invoice ID is missing.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/invoices/delete/${targetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setInvoiceToDelete(null);   // close modal
        fetchAllInvoices();         // refresh list
      } else {
        const errorText = await response.text();
        console.error("Delete failed:", errorText);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };

  const STATUS_OPTIONS = [
    { label: 'Sent',           value: 'Sent',           classes: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    { label: 'Pending',        value: 'Pending',        classes: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
    { label: 'Partially Paid', value: 'Partially Paid', classes: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    { label: 'Paid',           value: 'Paid',           classes: 'bg-green-100 text-green-700 hover:bg-green-200' },
    { label: 'Overdue',        value: 'Overdue',        classes: 'bg-red-100 text-red-700 hover:bg-red-200' },
    { label: 'Cancelled',      value: 'Cancelled',      classes: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  ];

  const getStatusClasses = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': case 'unpaid': return 'bg-yellow-100 text-yellow-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'cancelled': case 'canceled': return 'bg-gray-100 text-gray-600';
      case 'draft': return 'bg-slate-100 text-slate-600';
      case 'partially paid': return 'bg-purple-100 text-purple-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const getDisplayStatus = (inv) => {
    if (inv.status === 'Paid' || inv.status === 'Cancelled') {
      return inv.status;
    }
    if (inv.balanceAmount <= 0) {
      return 'Paid';
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = inv.dueDate ? new Date(inv.dueDate) : null;
    if (inv.balanceAmount > 0 && dueDate && today > dueDate) {
      return 'Overdue';
    }
    if (inv.totalPaidAmount > 0 && inv.balanceAmount > 0) {
      return 'Partially Paid';
    }
    return inv.status || 'Sent';
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Invoice Management</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invoices</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Latest Invoice Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">Loading...</td></tr>
              ) : (() => {
                const search = searchTerm.toLowerCase();
                const filteredClients = Object.values(groupedClients).filter((cg) =>
                  cg.clientName.toLowerCase().includes(search) ||
                  cg.invoices.some((inv) => (inv.invoiceNumber || '').toLowerCase().includes(search))
                );
                const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

                if (filteredClients.length === 0) return (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400">No invoices found.</td></tr>
                );

                return (
                  <>
                    {paginatedClients.map((clientGroup) => (
                  <React.Fragment key={clientGroup.clientName}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td
                        className="px-6 py-4 text-sm font-bold text-teal-700 cursor-pointer hover:underline"
                        onClick={() => handleClientExpand(clientGroup.clientName)}
                      >{clientGroup.clientName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{clientGroup.totalInvoices}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{clientGroup.latestInvoiceDate}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleClientExpand(clientGroup.clientName)}
                          className="text-teal-600 hover:text-teal-800 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>

                    {expandedClient === clientGroup.clientName && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 bg-slate-50 border-t border-b border-teal-100">
                          <div className="rounded-xl border border-teal-200 shadow-md overflow-hidden">
                          <table className="min-w-full bg-white">
                            <thead className="bg-teal-50 border-b-2 border-teal-200">
                              <tr>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Emp ID</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Invoice Number</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Total Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Paid Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Balance Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-bold text-teal-700 uppercase tracking-wider">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(() => {
                                const groupedByProject = clientGroup.invoices.reduce((acc, inv) => {
                                  const qId = inv.quotationId || 'unknown';
                                  if (!acc[qId]) {
                                    acc[qId] = { quotationId: qId, projectName: inv.projectName || 'Unnamed Project', invoices: [] };
                                  }
                                  acc[qId].invoices.push(inv);
                                  return acc;
                                }, {});

                                return Object.entries(groupedByProject).map(([qId, projectGroup]) => (
                                  <React.Fragment key={qId}>
                                    <tr className="bg-gray-100 border-t border-b border-gray-300">
                                      <td colSpan="8" className="px-5 py-2 font-bold text-gray-700 text-sm">
                                        PROJECT: {projectGroup.projectName}
                                      </td>
                                    </tr>
                                    {projectGroup.invoices.map((inv) => (
                                      <tr key={inv.id} className="hover:bg-teal-50/40 transition-colors">
                                        <td className="px-5 py-3 text-sm text-gray-600">{inv.employeeId || 'N/A'}</td>
                                        <td
                                          className="px-5 py-3 text-sm font-bold text-teal-700 cursor-pointer hover:underline"
                                          onClick={() => setSelectedInvoice(inv)}
                                        >{inv.invoiceNumber}</td>
                                        <td className="px-5 py-3 text-sm text-gray-500">{inv.invoiceDate}</td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                                          ₹{Number(inv.finalAmount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-green-700">
                                          ₹{Number(inv.totalPaidAmount || 0).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                                          ₹{Number(inv.balanceAmount || 0).toLocaleString('en-IN')}
                                        </td>
                                       <td className="px-5 py-3">
                                        {(() => {
                                          const currentStatus = getDisplayStatus(inv);
                                          return (
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(currentStatus)}`}>
                                              {currentStatus}
                                            </span>
                                          );
                                        })()}
                                      </td>
                                        <td className="px-5 py-3 text-sm">
                                          <div className="flex items-center gap-3">
                                            <button
                                              onClick={() => setSelectedInvoice(inv)}
                                              className="text-teal-600 hover:text-teal-800 font-medium"
                                            >
                                              View
                                            </button>
                                            <div className="relative">
                                              <button
                                                onClick={(e) => {
                                                  const invId = inv._id || inv.id;
                                                  if (editingStatusInvoiceId === invId) {
                                                    setEditingStatusInvoiceId(null);
                                                  } else {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setStatusPickerPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                                                    setEditingStatusInvoiceId(invId);
                                                  }
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium"
                                              >
                                                Edit
                                              </button>
                                            </div>
                                            <button
                                              onClick={() => setInvoiceToDelete(inv)}
                                              className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </React.Fragment>
                                ));
                              })()}
                            </tbody>
                          </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

                    {totalPages > 1 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredClients.length)} of {filteredClients.length}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {editingStatusInvoiceId && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setEditingStatusInvoiceId(null)}
          />
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-2 flex flex-col gap-1 max-w-xs"
            style={{
              top: (() => {
                const dropdownHeight = 200;
                const padding = 10;
                return statusPickerPos.top + dropdownHeight > window.innerHeight - padding
                  ? Math.max(0, statusPickerPos.top - dropdownHeight - 10)
                  : statusPickerPos.top + 6;
              })(),
              left: (() => {
                const dropdownWidth = 160;
                const padding = 10;
                return statusPickerPos.left + dropdownWidth > window.innerWidth - padding
                  ? Math.max(0, window.innerWidth - dropdownWidth - padding)
                  : statusPickerPos.left;
              })(),
            }}
          >
            <p className="text-xs text-gray-400 font-semibold uppercase px-1 pb-1">Set Status</p>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleStatusUpdate(editingStatusInvoiceId, opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full text-left ${opt.classes}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-gray-800">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 text-xs uppercase font-bold">Client Information</p>
                <p className="text-gray-900 font-bold text-base">{selectedInvoice.clientName}</p>
                <p className="text-gray-600">{selectedInvoice.clientEmail}</p>
                <p className="text-gray-600">{selectedInvoice.clientPhone}</p>
                <p className="text-gray-600 text-xs italic">{selectedInvoice.clientAddress}</p>
              </div>

              <div>
                <span className="text-gray-500 block">Invoice Number</span>
                <span className="text-gray-900 font-bold">{selectedInvoice.invoiceNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Project</span>
                <span className="text-gray-900 font-medium">{selectedInvoice.projectName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Billing Date</span>
                <span className="text-gray-900">{selectedInvoice.invoiceDate}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Due Date</span>
                <span className="text-red-500 font-medium">{selectedInvoice.dueDate}</span>
              </div>
              <div className="col-span-2 border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">Total Amount</span>
                  <span className="text-black-900">₹{Number(selectedInvoice.finalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-green-700">Paid Amount</span>
                  <span className="text-green-600">
                    ₹{Number(selectedInvoice.totalPaidAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-red-700">Balance Amount</span>
                  <span className="text-red-600">
                    ₹{Number(selectedInvoice.balanceAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {invoiceToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Confirm Delete</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to delete invoice <strong>{invoiceToDelete.invoiceNumber}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setInvoiceToDelete(null)} className="flex-1 bg-gray-100 py-2 rounded-lg font-medium">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium">Delete Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;