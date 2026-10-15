import React, { useState, useEffect } from 'react';

const AdminClientInfoModal = ({ client, onClose }) => {
  const [clientQuotations, setClientQuotations] = useState([]);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('🔍 [Admin] Fetching data for client:', client);
        
        // ✅ Fetch ALL quotations
        let allQuotations = [];
        try {
          const quotResponse = await fetch('http://localhost:8080/api/quotations');
          if (quotResponse.ok) {
            const text = await quotResponse.text();
            if (text && text.trim() !== '') {
              allQuotations = JSON.parse(text);
            }
          }
        } catch (err) {
          console.error('❌ Error fetching quotations:', err);
        }
        
        // ✅ Filter quotations by client
        const filteredQuotations = allQuotations.filter(q => 
          q.client === client.name || 
          q.clientId === client.clientId || 
          q.clientId === client.id ||
          q.client?.toLowerCase() === client.name?.toLowerCase()
        );
        console.log('✅ Filtered quotations:', filteredQuotations.length);
        setClientQuotations(filteredQuotations);

        // ✅ Fetch invoices by client ID (most direct)
        let allInvoices = [];
        const clientIdToUse = client.clientId || client.id;
        console.log('💰 Fetching invoices for clientId:', clientIdToUse);
        
        try {
          // Try direct client invoice endpoint first
          const invResponse = await fetch(`http://localhost:8080/api/invoices/by-client/${clientIdToUse}`);
          if (invResponse.ok) {
            const text = await invResponse.text();
            if (text && text.trim() !== '') {
              allInvoices = JSON.parse(text);
              console.log('✅ Invoices fetched via /by-client endpoint:', allInvoices.length);
            }
          }
        } catch (err) {
          console.warn('⚠️ /by-client endpoint failed, trying /all-invoices');
        }
        
        // Fallback: Fetch all invoices using /all-invoices endpoint
        if (allInvoices.length === 0) {
          try {
            const invResponse = await fetch('http://localhost:8080/api/invoices/all-invoices');
            if (invResponse.ok) {
              const text = await invResponse.text();
              if (text && text.trim() !== '') {
                allInvoices = JSON.parse(text);
                console.log('✅ All invoices fetched from /all-invoices endpoint:', allInvoices.length);
              }
            }
          } catch (err) {
            console.error('❌ Error fetching invoices:', err);
          }
        }

        console.log('📊 Total invoices fetched:', allInvoices.length);
        
        // ✅ Filter invoices - use quotationId as primary filter
        const filteredInvoices = allInvoices.filter(inv => {
          // Strategy 1: Match by quotationId from filtered quotations
          const matchByQuotationId = inv.quotationId && 
            filteredQuotations.some(q => q.id === inv.quotationId || q.quotationNumber === inv.quotationId);
          
          // Strategy 2: Match by clientName
          const matchByClientName = inv.clientName && 
            inv.clientName.trim().toLowerCase() === (client.name || '').trim().toLowerCase();
          
          // Strategy 3: Match by clientId
          const matchByClientId = inv.clientId === client.id || inv.clientId === client.clientId;
          
          if (matchByQuotationId || matchByClientName || matchByClientId) {
            console.log('✓ Invoice match:', inv.invoiceNumber, {matchByQuotationId, matchByClientName, matchByClientId});
            return true;
          }
          return false;
        });
        
        console.log('✅ Filtered invoices:', filteredInvoices.length);
        setClientInvoices(filteredInvoices);
      } catch (error) {
        console.error('❌ Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [client.id, client.name, client.clientId]);

  // ✅ Group data by project
  useEffect(() => {
    if (clientInvoices.length > 0 && clientQuotations.length === 0) {
      const projectsFromInvoices = {};
      clientInvoices.forEach(inv => {
        const projName = inv.projectName || inv.project || 'Unnamed Project';
        if (!projectsFromInvoices[projName]) {
          projectsFromInvoices[projName] = {
            projectName: projName,
            quotations: [],
            invoices: []
          };
        }
        projectsFromInvoices[projName].invoices.push(inv);
      });
      setProjectsData(Object.values(projectsFromInvoices));
      return;
    }
    
    if (clientQuotations.length > 0) {
      const uniqueProjectNames = [...new Set(
        clientQuotations
          .map(q => q.project || q.projectName)
          .filter(Boolean)
      )];
      
      const projects = uniqueProjectNames.map(projectName => {
        const quotationsForProject = clientQuotations.filter(q => 
          (q.project || q.projectName) === projectName
        );
        
        const quotationIdsInProject = quotationsForProject.map(q => q.id);
        
        const invoicesForProject = clientInvoices.filter(inv => {
          if (inv.quotationId && quotationIdsInProject.includes(inv.quotationId)) {
            return true;
          }
          if (inv.projectName === projectName || inv.project === projectName) {
            return true;
          }
          if (inv.quotationNumber && quotationsForProject.some(q => q.quotationNumber === inv.quotationNumber)) {
            return true;
          }
          return false;
        });
        
        return {
          projectName,
          quotations: quotationsForProject,
          invoices: invoicesForProject
        };
      });
      
      const assignedInvoiceIds = new Set();
      projects.forEach(p => p.invoices.forEach(inv => assignedInvoiceIds.add(inv.id)));
      
      const orphanedInvoices = clientInvoices.filter(inv => !assignedInvoiceIds.has(inv.id));
      if (orphanedInvoices.length > 0) {
        const orphanedProjects = {};
        orphanedInvoices.forEach(inv => {
          const projName = inv.projectName || inv.project || 'Other Projects';
          if (!orphanedProjects[projName]) {
            orphanedProjects[projName] = {
              projectName: projName,
              quotations: [],
              invoices: []
            };
          }
          orphanedProjects[projName].invoices.push(inv);
        });
        projects.push(...Object.values(orphanedProjects));
      }
      
      setProjectsData(projects);
    } else {
      setProjectsData([]);
    }
  }, [clientQuotations, clientInvoices]);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
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

  const getStatusClasses = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'partially paid': return 'bg-purple-100 text-purple-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6" style={{ maxHeight: '80vh' }}>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading client information...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 flex flex-col" style={{ maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4 shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">
            &times;
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* CLIENT INFORMATION */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">Name</p>
                <p className="text-gray-900 font-bold text-base mt-1">{client.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">Email</p>
                <p className="text-gray-700 mt-1">{client.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">Phone</p>
                <p className="text-gray-700 mt-1">{client.phone || 'N/A'}</p>
              </div>
              {client.organization && (
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wide">Organization</p>
                  <p className="text-gray-700 mt-1">{client.organization}</p>
                </div>
              )}
            </div>
          </div>

          {/* PROJECTS */}
          {projectsData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No projects or quotations found for this client.</p>
            </div>
          ) : (
            projectsData.map((project, projectIdx) => (
              <div key={projectIdx} className="mb-8">
                {/* Project Header */}
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Project: {project.projectName}</h3>
                  <div className="flex-1 ml-4 border-t border-gray-300"></div>
                </div>

                {/* QUOTATIONS */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Quotations</h4>
                  {project.quotations.length === 0 ? (
                    <p className="text-gray-500 text-sm py-3">No quotations for this project.</p>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quotation No</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {project.quotations.map((quote) => (
                              <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
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
                                <td className="px-4 py-3 text-sm text-gray-900">{quote.client}</td>
                                <td className="px-4 py-3 text-sm font-semibold hidden sm:table-cell">
                                  ₹{(quote.finalAmount || quote.totalCost + (quote.gstAmount || 0))?.toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(quote.status)}`}>
                                    {quote.status || 'Draft'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                                  {quote.date || "--"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {quote.actionDate || "--"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* INVOICES */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Invoices</h4>
                  {project.invoices.length === 0 ? (
                    <p className="text-gray-500 text-sm py-3">No invoices for this project.</p>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice No</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Balance Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {project.invoices.map((invoice) => (
                              <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {invoice.invoiceNumber}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {invoice.invoiceDate}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusClasses(getDisplayStatus(invoice))}`}>
                                    {getDisplayStatus(invoice)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  ₹{Number(invoice.finalAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                                  ₹{Number(invoice.balanceAmount || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  <button
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className="text-teal-600 hover:text-teal-800 font-medium"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spacing */}
                {projectIdx < projectsData.length - 1 && <hr className="my-8 border-gray-300" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* INVOICE DETAIL MODAL */}
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
    </div>
  );
};

export default AdminClientInfoModal;
