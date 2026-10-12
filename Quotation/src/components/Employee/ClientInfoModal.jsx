import React, { useState, useEffect } from 'react';

const ClientInfoModal = ({ client, onClose }) => {
  const [clientQuotations, setClientQuotations] = useState([]);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentEmpId = localStorage.getItem("empId") || "EMP-001";
        console.log('🔍 Fetching data for client:', client);
        console.log('📱 Employee ID:', currentEmpId);
        
        // Fetch ALL quotations for employee and filter by client
        console.log('📋 Fetching quotations from:', `http://localhost:8080/api/quotations/employee/id/${currentEmpId}`);
        let quotationsResponse = await fetch(`http://localhost:8080/api/quotations/employee/id/${currentEmpId}`);
        let allQuotations = [];
        
        if (quotationsResponse.ok) {
          allQuotations = await quotationsResponse.json();
          console.log('✅ All quotations fetched from employee endpoint:', allQuotations);
        } else {
          console.warn('⚠️ Employee quotations endpoint failed, trying all quotations');
          // Fallback: Get all quotations
          const fallbackResponse = await fetch('http://localhost:8080/api/quotations');
          if (fallbackResponse.ok) {
            allQuotations = await fallbackResponse.json();
            console.log('✅ All quotations fetched from general endpoint:', allQuotations);
          }
        }
        
        // Filter quotations by matching client name or clientId
        const filteredQuotations = allQuotations.filter(q => 
          q.client === client.name || q.clientId === client.clientId || q.clientId === client.id
        );
        console.log('✅ Filtered quotations:', filteredQuotations);
        setClientQuotations(filteredQuotations);

        // Fetch ALL invoices for employee and filter by client
        console.log('💰 Fetching invoices from:', `http://localhost:8080/api/invoices/employee/id/${currentEmpId}`);
        let invoicesResponse = await fetch(`http://localhost:8080/api/invoices/employee/id/${currentEmpId}`);
        let allInvoices = [];
        
        if (invoicesResponse.ok) {
          allInvoices = await invoicesResponse.json();
          console.log('✅ All invoices fetched from employee endpoint:', allInvoices);
        } else {
          console.warn('⚠️ Employee invoices endpoint failed, trying all invoices');
          // Fallback: Get all invoices
          const fallbackResponse = await fetch('http://localhost:8080/api/invoices');
          if (fallbackResponse.ok) {
            allInvoices = await fallbackResponse.json();
            console.log('✅ All invoices fetched from general endpoint:', allInvoices);
          }
        }
        
        // Try to fetch invoices directly by client ID (if API supports it)
        console.log('🔄 Attempting to fetch invoices by client ID...');
        try {
          const clientInvoicesResponse = await fetch(`http://localhost:8080/api/invoices/by-client/${client.id}`);
          if (clientInvoicesResponse.ok) {
            const clientSpecificInvoices = await clientInvoicesResponse.json();
            console.log('✅ Invoices fetched by client ID directly:', clientSpecificInvoices);
            allInvoices = clientSpecificInvoices;
          }
        } catch (err) {
          console.log('ℹ️ Direct client invoice endpoint not available, using filtered results');
        }
        
        // Filter invoices with multiple strategies
        console.log('🔗 Filtering invoices for client:', client.name, client.id, client.clientId);
        
        const filteredInvoices = allInvoices.filter(inv => {
          // Strategy 1: Match by quotationId from filtered quotations (most reliable)
          const matchByQuotationId = inv.quotationId && filteredQuotations.some(q => q.id === inv.quotationId);
          
          // Strategy 2: Match by exact clientName
          const matchByClientName = inv.clientName && inv.clientName.trim().toLowerCase() === (client.name || '').trim().toLowerCase();
          
          // Strategy 3: Match by clientId
          const matchByClientId = inv.clientId === client.id || inv.clientId === client.clientId;
          
          // Strategy 4: Check if invoice client field exists and matches
          const matchByInvoiceClient = inv.client && inv.client.trim().toLowerCase() === (client.name || '').trim().toLowerCase();
          
          const isMatch = matchByQuotationId || matchByClientName || matchByClientId || matchByInvoiceClient;
          
          if (isMatch) {
            const reasons = [];
            if (matchByQuotationId) reasons.push('quotationId');
            if (matchByClientName) reasons.push('clientName');
            if (matchByClientId) reasons.push('clientId');
            if (matchByInvoiceClient) reasons.push('client');
            console.log(`  ✓ Invoice ${inv.invoiceNumber} matched by: ${reasons.join(', ')}`);
          }
          
          return isMatch;
        });
        
        console.log('✅ Total invoices found for client:', filteredInvoices.length);
        console.log('✅ Filtered invoices details:', filteredInvoices);
        setClientInvoices(filteredInvoices);
      } catch (error) {
        console.error('❌ Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [client.id, client.name, client.clientId]);

  // Group data by project
  useEffect(() => {
    console.log('🔄 Grouping data - clientQuotations:', clientQuotations);
    console.log('🔄 Grouping data - clientInvoices:', clientInvoices);
    
    // If we have invoices but no quotations, create a virtual project from invoices
    if (clientInvoices.length > 0 && clientQuotations.length === 0) {
      console.log('⚠️ No quotations found, but invoices exist. Creating virtual projects from invoices.');
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
      
      const projects = Object.values(projectsFromInvoices);
      console.log('✅ Projects data from invoices:', projects);
      setProjectsData(projects);
      return;
    }
    
    if (clientQuotations.length > 0) {
      // Get unique projects from quotations (use 'project' field)
      const uniqueProjectNames = [...new Set(
        clientQuotations
          .map(q => q.project || q.projectName)  // Try both 'project' and 'projectName'
          .filter(Boolean)
      )];
      console.log('📦 Unique projects from quotations:', uniqueProjectNames);
      
      // Build project data structure
      const projects = uniqueProjectNames.map(projectName => {
        // Get quotations for this project
        const quotationsForProject = clientQuotations.filter(q => 
          (q.project || q.projectName) === projectName
        );
        
        // Get invoices for this project using multiple strategies
        const quotationIdsInProject = quotationsForProject.map(q => q.id);
        
        const invoicesForProject = clientInvoices.filter(inv => {
          // Strategy 1: Match by quotationId (most reliable)
          if (inv.quotationId && quotationIdsInProject.includes(inv.quotationId)) {
            return true;
          }
          
          // Strategy 2: Match by projectName if invoice has it
          if (inv.projectName === projectName || inv.project === projectName) {
            return true;
          }
          
          // Strategy 3: Match by quotation number if invoice stores it
          if (inv.quotationNumber && quotationsForProject.some(q => q.quotationNumber === inv.quotationNumber)) {
            return true;
          }
          
          return false;
        });
        
        console.log(`📂 Project "${projectName}" - Quotations: ${quotationsForProject.length}, Invoices by matching: ${invoicesForProject.length}`);
        
        return {
          projectName,
          quotations: quotationsForProject,
          invoices: invoicesForProject
        };
      });
      
      // Also add any orphaned invoices that don't match to projects
      const assignedInvoiceIds = new Set();
      projects.forEach(p => p.invoices.forEach(inv => assignedInvoiceIds.add(inv.id)));
      
      const orphanedInvoices = clientInvoices.filter(inv => !assignedInvoiceIds.has(inv.id));
      if (orphanedInvoices.length > 0) {
        console.log('⚠️ Found orphaned invoices not assigned to projects:', orphanedInvoices);
        
        // Group orphaned invoices by their project
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
        
        // Add orphaned projects to the list
        projects.push(...Object.values(orphanedProjects));
      }
      
      console.log('✅ Final projects data:', projects);
      setProjectsData(projects);
    } else {
      console.log('⚠️ No quotations or invoices found');
      setProjectsData([]);
    }
  }, [clientQuotations, clientInvoices]);

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'partially paid':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
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
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      case 'partially paid':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-blue-100 text-blue-700';
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
        {/* Header with close button - STICKY */}
        <div className="flex justify-between items-center border-b pb-4 mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Client Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none">
            &times;
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto flex-1">
          {/* CLIENT INFORMATION SECTION */}
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

          {/* PROJECT-WISE DATA SECTIONS */}
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

                {/* QUOTATIONS TABLE FOR THIS PROJECT */}
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
                                <td className="px-4 py-3 text-sm text-gray-900">
                                  {quote.client}
                                </td>
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

                {/* INVOICES TABLE FOR THIS PROJECT */}
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

                {/* Spacing between projects */}
                {projectIdx < projectsData.length - 1 && <hr className="my-8 border-gray-300" />}
              </div>
            ))
          )}
        </div>
      </div>

      {/* INVOICE DETAIL MODAL - Same as in MyInvoice.jsx */}
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

export default ClientInfoModal;
