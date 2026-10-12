import React, { useState, useEffect, useMemo } from 'react';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [quotations, setQuotations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);

  // ✅ Optimized Fetching with cleanup and error handling
  useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const [qRes, eRes, cRes, iRes] = await Promise.all([
        fetch('http://localhost:8080/api/quotations'),
        fetch('http://localhost:8080/api/admin/employees'),
        fetch('http://localhost:8080/api/clients'),
        fetch('http://localhost:8080/api/invoices/all-invoices') // ✅ NEW
      ]);

      const qData = await qRes.json();
      const eData = await eRes.json();
      const cData = await cRes.json();
      const iData = await iRes.json(); // ✅ NEW

      if (isMounted) {
        const extractArray = (data) => {
  if (Array.isArray(data)) return data;

  if (data && typeof data === 'object') {
    return (
      data.content ||
      data.data ||
      data.invoices ||
      data.results ||
      data.items ||
      []
    );
  }

  return [];
};

        setQuotations(extractArray(qData));
        setEmployees(extractArray(eData));
        setClients(extractArray(cData));
        setInvoices(extractArray(iData)); // ✅ NEW
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      if (isMounted) setLoading(false);
    }
  };

  fetchData();
  return () => { isMounted = false; };
}, []);

useEffect(() => {
  console.log("Invoices Data:", invoices);
}, [invoices]);

    // ✅ STATS.
  const stats = useMemo(() => {
    const parseAmount = (val) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      return parseFloat(String(val).replace(/[₹$,\s]/g, '')) || 0;
    };
    

    const formatRupees = (num) => 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(num);


    const total = quotations.length;
    const approvedList = quotations.filter(q => q.status?.toLowerCase() === 'approved');
    const pendingCount = quotations.filter(q => q.status?.toLowerCase() === 'pending').length;
    const draftCount = quotations.filter(q => q.status?.toLowerCase() === 'draft' || !q.status).length;
    const rejectedCount = quotations.filter(q => q.status?.toLowerCase() === 'rejected').length;

    const totalValue = quotations.reduce((sum, q) => 
      sum + parseAmount(q.totalCost || q.amount || q.totalAmount), 0);

    const approvedValue = approvedList.reduce((sum, q) => 
      sum + parseAmount(q.totalCost || q.amount || q.totalAmount), 0);

    return {
      total,
      approved: approvedList.length,
      pending: pendingCount,
      draft: draftCount,
      rejected: rejectedCount,
      totalValueFormatted: formatRupees(totalValue),
      approvedValueFormatted: formatRupees(approvedValue),
      conversionRate: total > 0 ? ((approvedList.length / total) * 100).toFixed(1) : "0.0"
    };
  }, [quotations]);


const getCombinedCSVData = () => {
  return quotations.map((q) => {

    // ✅ GET ALL INVOICES (instead of find)
    const relatedInvoices = invoices.filter(
      (inv) =>
        inv.quotationId === q.quotationNumber ||
        inv.quotationId === q.quotationId ||
        inv.quotationId === q.id
    );

    // ✅ SORT BY DATE (important for order)
    const sortedInvoices = relatedInvoices.sort(
      (a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate)
    );

    // ✅ EXTRACT PAYMENTS
    const payments = sortedInvoices
      .filter(inv => inv.totalPaidAmount > 0)
      .map(inv => inv.totalPaidAmount);

    // ✅ GET LAST INVOICE (latest)
    const latestInvoice =
      sortedInvoices.length > 0
        ? sortedInvoices[sortedInvoices.length - 1]
        : {};

    return {
      // ✅ KEEP QUOTATION DATA
      ...q,

      // 🟢 BASIC INVOICE INFO (latest)
      InvoiceNumber: latestInvoice.invoiceNumber || "",
      InvoiceDate: latestInvoice.invoiceDate || "",
      DueDate: latestInvoice.dueDate || "",

      TotalAmount: latestInvoice.totalAmount || "",
      TaxRate: latestInvoice.taxRate || "",
      TaxAmount: latestInvoice.taxAmount || "",
      FinalAmount: latestInvoice.finalAmount || "",

      // 🟢 INSTALLMENT PAYMENTS
      Payment1: payments[0] || 0,
      Payment2: payments[1] || 0,
      Payment3: payments[2] || 0,
      FinalPayment: payments[3] || 0,

      // 🟢 EXTRA FIELDS (YOU WANTED THIS 👇)
      TotalPaidAmount: payments.reduce((sum, val) => sum + val, 0),
      BalanceAmount: latestInvoice.balanceAmount || 0,
      PaymentMethod: latestInvoice.paymentMethod || "",
      PaymentStatus: Number(latestInvoice.balanceAmount) === 0 ? "Paid" : (latestInvoice.paymentStatus || "") 
    };
  });
};

  // ✅ IMPROVED CSV EXPORT: Handles commas and quotes in data
  const exportToCSV = (data, filename) => {
  if (!data.length) {
    alert("No data available to export");
    return;
  }

  const headers = Object.keys(data[0]).join(",");

  const csvRows = data.map(row =>
    Object.values(row).map(value => {
      const escaped = ('' + value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(",")
  );

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...csvRows].join("\n");

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const reportTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' }
  ];

  
  const invoiceStats = useMemo(() => {
  const totalInvoices = invoices.length;

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (parseFloat(String(inv.finalAmount).replace(/[₹,]/g, '')) || 0),
    0
  );

  return {
    totalInvoices,
    totalRevenueFormatted: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(totalRevenue)
  };
}, [invoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

    // ✅ PIE CHART CALCULATION (ADD HERE)
      const total = stats.total || 1;

      const approvedPercent = stats.approved / total;
      const pendingPercent = stats.pending / total;
      const draftPercent = stats.draft / total;
      const rejectedPercent = 1 - (approvedPercent + pendingPercent + draftPercent);

      const CIRCUMFERENCE = 251.2;


  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Reports & Analytics
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisQuarter">This Quarter</option>
            <option value="thisYear">This Year</option>
          </select>
          <button 
            onClick={() => exportToCSV(getCombinedCSVData(), 'reports.csv')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:shadow-lg active:scale-95 transition-all duration-300 font-medium text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 sm:space-x-4 px-3 sm:px-6 overflow-x-auto">
            {reportTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors duration-200 flex items-center space-x-1 sm:space-x-2 ${
                  activeReport === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          <div className="space-y-6">
            {/* KPI Grid */}
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 gap-2 sm:gap-4 min-w-[900px]">
                
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-200">
                  <h3 className="text-xs sm:text-sm text-blue-600 mb-1 font-medium">Total Quotations</h3>
                  <p className="text-lg sm:text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-green-200">
                  <h3 className="text-xs sm:text-sm text-green-600 mb-1 font-medium">Approved</h3>
                  <p className="text-lg sm:text-2xl font-bold text-green-800">{stats.approved}</p>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-yellow-200">
                  <h3 className="text-xs sm:text-sm text-yellow-600 mb-1 font-medium">Pending</h3>
                  <p className="text-lg sm:text-2xl font-bold text-yellow-800">{stats.pending}</p>
                </div>

                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-teal-200">
                  <h3 className="text-xs sm:text-sm text-teal-600 mb-1 font-medium">Total Invoices</h3>
                  <p className="text-lg sm:text-2xl font-bold text-teal-800">{invoiceStats.totalInvoices}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200">
                  <h3 className="text-xs sm:text-sm text-purple-600 mb-1 font-medium">Conversion Rate</h3>
                  <p className="text-lg sm:text-2xl font-bold text-purple-800">{stats.conversionRate}%</p>
                </div>

              </div>
            </div>

            
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Status Distribution Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  Status Distribution
                  </h3>
                  <p className="text-indigo-100 text-xs sm:text-sm mt-1">  Quotation breakdown</p>
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-6">
                    
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8"/>

                    {/* Approved */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="8"
                      strokeDasharray={`${approvedPercent * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeLinecap="round"
                    />

                    {/* Pending */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="8"
                      strokeDasharray={`${pendingPercent * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={`-${approvedPercent * CIRCUMFERENCE}`}
                      strokeLinecap="round"
                    />

                    {/* Draft */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="8"
                      strokeDasharray={`${draftPercent * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={`-${(approvedPercent + pendingPercent) * CIRCUMFERENCE}`}
                      strokeLinecap="round"
                    />

                    {/* Rejected (fills remaining perfectly) */}
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeDasharray={`${rejectedPercent * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                      strokeDashoffset={`-${(approvedPercent + pendingPercent + draftPercent) * CIRCUMFERENCE}`}
                      strokeLinecap="round"
                    />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="text-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Approved</span>
                      <p className="font-bold text-sm">{stats.approved}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Pending</span>
                      <p className="font-bold text-sm">{stats.pending}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Draft</span>
                      <p className="font-bold text-sm">{stats.draft}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Rejected</span>
                      <p className="font-bold text-sm">{stats.rejected}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Trend Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  Revenue Analytics
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">6-month trend</p>
                </div>
                <div className="p-6">
                  <div className="h-48 relative">
                    <svg className="w-full h-full" viewBox="0 0 300 120">
                      <defs>
                        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1="30" y1={20 + i * 20} x2="270" y2={20 + i * 20} stroke="#f3f4f6" strokeWidth="1"/>
                      ))}
                      <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points="50,80 90,65 130,55 170,45 210,35 250,25"
                      />
                      <polygon
                        fill="url(#lineGrad)"
                        points="50,80 90,65 130,55 170,45 210,35 250,25 250,100 50,100"
                      />
                      {[50, 90, 130, 170, 210, 250].map((x, i) => (
                        <circle key={i} cx={x} cy={[80, 65, 55, 45, 35, 25][i]} r="4" fill="#3b82f6" className="hover:scale-125 transition-transform cursor-pointer" />
                      ))}
                    </svg>
                    <div className="flex justify-between mt-2 px-4 text-xs text-gray-500">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(month => <span key={month}>{month}</span>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  System Summary
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">System overview</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600 text-sm font-medium">Total Employees</span>
                    <span className="font-bold text-gray-800">{employees.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600 text-sm font-medium">Total Clients</span>
                    <span className="font-bold text-gray-800">{clients.length}</span>
                  </div>
                    
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600 text-sm font-medium">Active Clients</span>
                    <span className="font-bold text-green-600">{clients.filter(c => c.status === 'Active').length}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600 text-sm font-medium">Total Invoices</span>
                    <span className="font-bold text-blue-600">{invoiceStats.totalInvoices}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-gray-600 text-sm font-medium">Total Quote Value</span>
                    <span className="font-bold text-gray-900">{stats.totalValueFormatted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm font-medium">Approved Value</span>
                    <span className="font-bold text-green-600">{stats.approvedValueFormatted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;