import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mainlogo from "../../assets/mainlogo.webp";
import signatureImg from "../../assets/Smartmatrix_CEO.png";
import stampImg from "../../assets/Smartmatrix_stamp.png";
import watermark from "../../assets/Smartmatrix_watermark.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Invoice = () => {
  const navigate = useNavigate();
  const [signature, setSignature] = useState(signatureImg);
  const [stamp, setStamp] = useState(stampImg);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();
  

  // ✅ Dynamic State for Backend Data
  const [approvedQuotations, setApprovedQuotations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [previouslyPaid, setPreviouslyPaid] = useState(0);
  const [quotationPayments, setQuotationPayments] = useState({});
  const [invoicedCount, setInvoicedCount] = useState(0);
  const [availableInstallments, setAvailableInstallments] = useState([]);
  const [selectedInstallmentIdx, setSelectedInstallmentIdx] = useState(0);

  // ✅ Get Employee ID
  const currentEmpId = localStorage.getItem("empId") || "EMP-001";
  const [currentEmpName, setCurrentEmpName] = useState("");

  // ✅ Adjustment Bucket State (Carry-Forward Amount)
  // adjustmentAmount: Total unpaid amount carried from previous invoices
  // currentUnpaid: Unpaid amount from current installment (if user pays less than planned)
  // totalAdjustment: adjustmentAmount + currentUnpaid
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [quotationAdjustmentAmount, setQuotationAdjustmentAmount] = useState(0);
  
  // ✅ Real-time adjustment calculation states
  const [actualAmount, setActualAmount] = useState("");
  const [currentUnpaid, setCurrentUnpaid] = useState(0);
  const [totalAdjustmentBucket, setTotalAdjustmentBucket] = useState(0);

  // ✅ Payment Mode State (amount or percentage)
  const [paymentMode, setPaymentMode] = useState('amount');
  
  // ✅ Direct percentage input state
  const [percentageInput, setPercentageInput] = useState("");


  const numberToWords = (num) => {
  const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim().toUpperCase();
};

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    invoiceDate: new Date().toLocaleDateString('en-IN'),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
    quotationId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    projectName: '',
    totalAmount: 0,
    taxRate: '18',
    taxAmount: 0,
    finalAmount: 0,
    paymentTerms: '30 days from invoice date',
    advancePercentage: '0%',
    advancePaid: 0,
    midwayPercentage: '0%',
    midwayPaid: 0,
    finalPaymentPaid: 0,
    totalPaidAmount: 0,
    balanceAmount: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'UPI/Online',
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      accountHolder: 'Smartmatrix Digital Services'
    }
  });

  // ✅ Helper: Fetch adjustment bucket amount for a quotation
  const fetchAdjustmentBucket = async (quotationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/quotations/${encodeURIComponent(quotationId)}`
      );
      if (!response.ok) return 0;

      const text = await response.text();
      if (!text || text.trim() === "") return 0;

      const quotData = JSON.parse(text);
      return parseFloat(quotData.adjustmentAmount) || 0;
    } catch (err) {
      console.error("Error fetching adjustment bucket:", err);
      return 0;
    }
  };

  // ✅ Calculate planned amount for selected installment
  const getPlannedAmount = () => {
    if (!availableInstallments.length || selectedInstallmentIdx < 0) return 0;
    const term = availableInstallments[selectedInstallmentIdx];
    if (!term) return 0;
    const totalAmount = parseFloat(invoiceData.finalAmount) || 0;
    return Number(term.fixedAmount) || Math.round((totalAmount * parseFloat(term.percent)) / 100);
  };

  // ✅ Calculate unpaid amount from current installment
  const calculateCurrentUnpaid = (inputAmount) => {
    const plannedAmount = getPlannedAmount();
    const actualPaid = Number(inputAmount) || 0;
    
    // If actual paid is less than planned, the difference is unpaid (carry forward)
    return Math.max(0, plannedAmount - actualPaid);
  };

  // ✅ Update adjustment bucket (includes both previous + current unpaid)
  const updateAdjustmentBucket = (inputAmount) => {
    const currentUnpaidAmount = calculateCurrentUnpaid(inputAmount);
    const totalAdjustment = adjustmentAmount + currentUnpaidAmount;
    
    setCurrentUnpaid(currentUnpaidAmount);
    setTotalAdjustmentBucket(totalAdjustment);
    
    return { currentUnpaidAmount, totalAdjustment };
  };

  // ✅ Handle actual amount input
  const handleActualAmountChange = (e) => {
    let value = e.target.value;
    if (value < 0) value = 0;
    setActualAmount(value);
    updateAdjustmentBucket(value);
  };

  // ✅ Sync adjustment when quotation changes
  useEffect(() => {
    setTotalAdjustmentBucket(adjustmentAmount);
    setCurrentUnpaid(0);
  }, [adjustmentAmount]);

  // ✅ Recalculate adjustment when installment or amount changes
  useEffect(() => {
    if (actualAmount) {
      updateAdjustmentBucket(actualAmount);
    } else {
      setCurrentUnpaid(0);
      setTotalAdjustmentBucket(adjustmentAmount);
    }
  }, [selectedInstallmentIdx, invoiceData.finalAmount]);

  // ✅ Auto-calculate totals when amounts change
  useEffect(() => {
    if (!availableInstallments.length) return;
    const term = availableInstallments[selectedInstallmentIdx];
    if (!term) return;

    const quotationTotal = parseFloat(invoiceData.finalAmount) || 0;
    const plannedAmount = getPlannedAmount();
    const actualPaidAmount = actualAmount ? Number(actualAmount) : plannedAmount;
    
    // Final payable = actual amount + previous adjustment (carried forward)
    const finalPaidAmount = actualPaidAmount + adjustmentAmount;
    const balanceAfterThis = remainingBalance - finalPaidAmount;

    const overallPaid = previouslyPaid + finalPaidAmount;
    let status = 'Pending';
    if (overallPaid >= quotationTotal && quotationTotal > 0) {
      status = 'Paid';
    } else if (overallPaid > 0) {
      status = 'Partially Paid';
    }

    setInvoiceData(prev => ({
      ...prev,
      advancePaid: finalPaidAmount,
      advancePercentage: actualAmount ? `${((actualPaidAmount / quotationTotal) * 100).toFixed(2)}%` : term.percent + '%',
      totalPaidAmount: finalPaidAmount.toFixed(2),
      balanceAmount: balanceAfterThis.toFixed(2),
      paymentStatus: status,
    }));
  }, [selectedInstallmentIdx, availableInstallments, remainingBalance, previouslyPaid, invoiceData.finalAmount, actualAmount, adjustmentAmount]);

  // ✅ Handle custom percentage calculation
  const handlePaymentModeChange = (mode) => {
    setPaymentMode(mode);
    setActualAmount("");
  };

  // ✅ Fetch Approved Quotations
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const empResponse = await fetch(`http://localhost:8080/api/admin/employees/id/${currentEmpId}`);
        if (empResponse.ok) {
          const empData = await empResponse.json();
          if (empData.name) {
            setCurrentEmpName(empData.name);
            localStorage.setItem("empName", empData.name);
          }
        }

        const quotResponse = await fetch(`http://localhost:8080/api/quotations/employee/id/${currentEmpId}`);
        if (quotResponse.ok) {
          const quotData = await quotResponse.json();
          const approved = quotData
            .filter(q => q.status === 'Approved')
            .sort((a, b) => {
              // Try multiple date fields: createdAt, date, createdDate
              const dateA = new Date(a.createdAt || a.date || a.createdDate || 0).getTime();
              const dateB = new Date(b.createdAt || b.date || b.createdDate || 0).getTime();
              return dateB - dateA; // Newest first (descending)
            });
          setApprovedQuotations(approved);

          const quotationIds = approved.map(q => q.quotationNumber || q.id);
          if (quotationIds.length > 0) {
            const summaryResponse = await fetch('http://localhost:8080/api/invoices/payment-summaries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(quotationIds)
            });
            if (summaryResponse.ok) {
              const summaries = await summaryResponse.json();
              setQuotationPayments(summaries);
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentEmpId) fetchData();
  }, [currentEmpId]);

  const filteredQuotations = approvedQuotations
    .filter((quotation) => {
      const search = searchTerm.toLowerCase();
      return (
        quotation.quotationNumber?.toLowerCase().includes(search) ||
        quotation.client?.toLowerCase().includes(search) ||
        quotation.project?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      // Sort by date descending (newest first)
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

 const generateInvoice = async (quotation) => {
  const quotationId = quotation.quotationNumber || quotation.id;

  // Parse amounts
  const rawAmount =
    typeof quotation.totalCost === "string"
      ? parseFloat(quotation.totalCost.replace(/[₹,]/g, ""))
      : quotation.totalCost || 0;

  const gstPercent = quotation.gstPercent || 0;
  const gstAmount = quotation.gstAmount || 0;
  const finalTotal = quotation.finalAmount || rawAmount + gstAmount;

  // ✅ Fetch adjustment bucket (from quotation or backend)
  let adjustmentBucketAmount = quotation.adjustmentAmount 
    ? parseFloat(quotation.adjustmentAmount) || 0 
    : await fetchAdjustmentBucket(quotationId);

  // ✅ Fetch existing invoices and calculate totals
  let totalAlreadyPaid = 0;
  let invoicesCount = 0;
  try {
    const res = await fetch(`http://localhost:8080/api/invoices/by-quotation/${encodeURIComponent(quotationId)}`);
    if (res.ok) {
      const existingInvoices = await res.json();
      invoicesCount = existingInvoices.length;
      totalAlreadyPaid = existingInvoices.reduce((sum, inv) => sum + (parseFloat(inv.totalPaidAmount) || 0), 0);
    }
  } catch (err) {
    console.error("Error fetching existing invoices:", err);
  }

  const remaining = finalTotal - totalAlreadyPaid;

  if (remaining <= 0) {
    toast.warning("This quotation is fully paid. No more invoices can be generated.");
    return;
  }

  // ✅ Determine payment terms based on quotation amount
  const fallbackTerms = (finalTotal < 10000)
    ? [
        { percent: 40, label: 'Advance upon contract signing' },
        { percent: 60, label: 'Final delivery and deployment' }
      ]
    : [
        { percent: 25, label: 'Advance upon contract signing' },
        { percent: 30, label: 'Midpoint milestone' },
        { percent: 25, label: 'UAT approval' },
        { percent: 20, label: 'Final delivery and deployment' }
      ];

  // ✅ Normalize payment terms
  const normalizedTerms = (Array.isArray(quotation.paymentTerms) && quotation.paymentTerms.length > 0
    ? quotation.paymentTerms
    : fallbackTerms
  )
    .map(t => ({ percent: parseFloat(t.percent) || 0, label: t.label || 'Installment' }))
    .filter(t => t.percent > 0);

  // ✅ Calculate remaining installments
  const safeInvoicedCount = Math.min(invoicesCount, normalizedTerms.length);
  let remainingTerms = normalizedTerms.slice(safeInvoicedCount);

  if (remainingTerms.length === 0 && remaining > 0) {
    remainingTerms = [{ percent: 100, label: 'Remaining balance', fixedAmount: remaining }];
  }

  // ✅ Set state for invoice generation
  setPreviouslyPaid(totalAlreadyPaid);
  setRemainingBalance(remaining);
  setInvoicedCount(safeInvoicedCount);
  setAvailableInstallments(remainingTerms);
  setSelectedInstallmentIdx(0);
  
  // ✅ Initialize adjustment states
  setAdjustmentAmount(adjustmentBucketAmount);
  setQuotationAdjustmentAmount(adjustmentBucketAmount);
  setTotalAdjustmentBucket(adjustmentBucketAmount);
  setCurrentUnpaid(0);
  setActualAmount("");
  setPaymentMode('amount');

  // ✅ Initialize invoice data
  setInvoiceData((prev) => ({
    ...prev,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    quotationId: quotationId,
    clientName: quotation.client || "",
    clientEmail: quotation.clientEmail || "",
    clientPhone: quotation.clientPhone || "",
    clientAddress: quotation.clientAddress || "",
    projectName: quotation.project || "",
    totalAmount: finalTotal,
    taxRate: gstPercent,
    taxAmount: gstAmount,
    finalAmount: finalTotal,
    advancePercentage: '0%',
    advancePaid: adjustmentBucketAmount,
    totalPaidAmount: adjustmentBucketAmount.toFixed(2),
    balanceAmount: remaining.toFixed(2),
    paymentStatus: 'Pending',
  }));

  setSelectedQuotation(quotation);
  setShowForm(true);
};

  const handleSaveInvoice = async () => {
    try {
      const savedName = localStorage.getItem("empName") || currentEmpName;
      const empId = localStorage.getItem("empId") || currentEmpId;

      const payload = {
        ...invoiceData,
        employeeId: empId,
        employeeName: savedName,
        status: 'Sent', 
        date: new Date().toLocaleDateString('en-IN'),
        // Include current unpaid as carry forward for next invoice
        carryForwardAmount: currentUnpaid,
        carryForwardPercentage: 0,
        // Total adjustment includes both previous + current unpaid
        adjustmentAmount: totalAdjustmentBucket,
        actualPaidAmount: actualAmount || getPlannedAmount()
      };

      const response = await fetch(`http://localhost:8080/api/invoices/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

    if (response.ok) {
  toast.success("Invoice generated and saved successfully! ✅");

  setShowPreview(true); // 👈 opens preview after save

} else {
        const errorData = await response.json();
        toast.error(`Failed to save invoice: ${errorData.message || 'Server Error'}`);
      }
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Server connection error ❌");
    }
  };

const handleInvoicePrint = () => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const content = printRef.current.innerHTML;
  const styles = Array.from(document.styleSheets)
    .map(sheet => {
      try {
        return Array.from(sheet.cssRules).map(rule => rule.cssText).join('');
      } catch (e) { return ""; }
    }).join("");

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <html>
      <head>
        <style>
          ${styles}
          @page { 
            size: A4; 
            margin: 10mm;
          }
          body { 
            -webkit-print-color-adjust: exact; 
            margin: 0;
            padding: 0;
          }
          .print-wrapper {
            border: 2px solid black; 
            min-height: 277mm;
            padding: 20px;
            box-sizing: border-box;
          }
            img {
            -webkit-print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div class="print-wrapper">
          ${content}
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => { window.frameElement.remove(); }, 100);
          };
        </script>
      </body>
    </html>
  `);
  doc.close();
};

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Invoice Management
          </h2>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base">Generate invoices from approved quotations</p>
        </div>
        <div className="relative">
          <input
          type="text"
          placeholder="Search invoices..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {!showForm ? (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
              <span className="mr-2">✅</span>
              <span>Approved Quotations Ready for Invoice</span>
            </h3>
          </div>
          
          <div className="p-4 sm:p-6">
            {isLoading ? (
                <div className="text-center py-6 text-gray-500">Loading approved projects...</div>
            ) : approvedQuotations.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {filteredQuotations.map((quotation) => {
                  const qId = quotation.quotationNumber || quotation.id;
                  const qTotal = quotation.finalAmount || quotation.totalCost || 0;
                  const paidSoFar = quotationPayments[qId] || 0;
                  const qRemaining = qTotal - paidSoFar;
                  const isFullyPaid = qRemaining <= 0;

                  return (
                  <div key={quotation.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors gap-3">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{quotation.quotationNumber || quotation.id}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{quotation.client} - {quotation.project}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-green-600">₹{(quotation.finalAmount || quotation.totalCost + (quotation.gstAmount || 0))?.toLocaleString('en-IN')}</p>
                          {paidSoFar > 0 && (
                            <p className="text-xs text-blue-600 font-medium">Paid: ₹{paidSoFar.toLocaleString('en-IN')} | Remaining: ₹{Math.max(0, qRemaining).toLocaleString('en-IN')}</p>
                          )}
                          <p className="text-xs text-gray-500">Approved: {quotation.date}</p>
                        </div>
                      </div>
                    </div>
                    {isFullyPaid ? (
                      <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold text-sm">
                        ✅ Fully Paid
                      </span>
                    ) : (
                      <button 
                        onClick={() => generateInvoice(quotation)}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors font-medium text-sm"
                      >
                        Generate Invoice
                      </button>
                    )}
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">📋</div>
                <h3 className="text-lg font-semibold text-gray-800">No Approved Quotations</h3>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-emerald-600 px-4 py-4">
            <h3 className="text-lg font-bold text-white">Generate Invoice - {invoiceData.quotationId}</h3>
              <p className="text-green-100 text-sm mt-1">
                Remaining Balance: ₹{remainingBalance.toLocaleString('en-IN')}
              </p>
          </div>
          
          <div className="p-4 sm:p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Invoice Number:</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={invoiceData.invoiceNumber} onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Invoice Date:</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={invoiceData.invoiceDate} onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date:</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={invoiceData.dueDate} onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})} />
              </div>
            </div>

           {/* Client Information Section */}
              <div className="bg-[#f0f7ff] p-4 sm:p-6 rounded-xl border border-blue-100 shadow-sm">
                <h4 className="text-gray-700 font-bold mb-4 text-base">Client Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Client Name:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email:</label>
                    <input 
                      type="email"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({...invoiceData, clientEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Phone:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={invoiceData.clientPhone}
                      onChange={(e) => setInvoiceData({...invoiceData, clientPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Project Name:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                      value={invoiceData.projectName}
                      onChange={(e) => setInvoiceData({...invoiceData, projectName: e.target.value})}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Address:</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                      rows="2"
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})}
                    />
                  </div>
                </div>
              </div>

            {/* Payment Breakdown Section */}
            <div className="bg-[#fdfaff] p-5 rounded-xl border border-purple-100 shadow-sm">
              <div className="font-bold text-gray-700 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🗓️</span> Payment Details
                </div>
                <div className="text-sm font-bold text-indigo-600">
                  Available Balance: ₹{remainingBalance.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Payment Mode Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Mode:</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handlePaymentModeChange('amount')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      paymentMode === 'amount'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white border-2 border-blue-400 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    💰 Pay by Amount
                  </button>
                  <button
                    onClick={() => handlePaymentModeChange('percentage')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                      paymentMode === 'percentage'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white border-2 border-emerald-400 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    📊 Pay by Percentage
                  </button>
                </div>
              </div>

              {/* Installment Selection - Sequential/Fixed Order */}
              <div className="space-y-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Select Installment:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableInstallments.map((term, i) => {
                    const globalIdx = invoicedCount + i + 1;
                    const ordinal = getOrdinal(globalIdx);
                    const quotationTotal = parseFloat(invoiceData.finalAmount) || 0;
                    const plannedAmount = Number(term.fixedAmount) || Math.round((quotationTotal * parseFloat(term.percent)) / 100);
                    const isSelected = selectedInstallmentIdx === i;
                    const isCurrentInstallment = i === 0; // Only first installment should be clickable

                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (isCurrentInstallment) {
                            setSelectedInstallmentIdx(i);
                            setActualAmount("");
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all shadow-sm space-y-2 ${
                          !isCurrentInstallment
                            ? 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-purple-500 ring-2 ring-purple-200 cursor-pointer bg-white'
                            : 'border-gray-100 hover:border-purple-300 cursor-pointer bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-500 uppercase pointer-events-none">
                            ({ordinal} Installment)
                          </label>
                          {isSelected && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                              CURRENT
                            </span>
                          )}
                          {!isCurrentInstallment && (
                            <span className="text-[10px] bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                              NOT DUE YET
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{term.label}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-gray-700">{term.percent}%</span>
                          <span className="text-lg font-bold text-purple-600">₹{plannedAmount.toLocaleString('en-IN')}</span>
                        </div>

                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                            {paymentMode === 'amount' ? (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  Enter Payment Amount (₹)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="Enter amount to pay"
                                  value={actualAmount}
                                  onChange={handleActualAmountChange}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Planned Amount: ₹{plannedAmount.toLocaleString('en-IN')}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-2">
                                  Enter Payment Percentage (%)
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter percentage"
                                  value={percentageInput}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    // Allow only numbers and one decimal point
                                    if (value === '') {
                                      setPercentageInput('');
                                      setActualAmount('');
                                      return;
                                    }
                                    
                                    value = value.replace(/[^0-9.]/g, '');
                                    const parts = value.split('.');
                                    if (parts.length > 2) {
                                      value = parts[0] + '.' + parts.slice(1).join('');
                                    }
                                    
                                    setPercentageInput(value);
                                    
                                    const percentage = parseFloat(value) || 0;
                                    const amount = Math.round((quotationTotal * percentage) / 100);
                                    setActualAmount(amount > 0 ? amount : '');
                                  }}
                                  style={{
                                    WebkitAppearance: 'textfield',
                                    MozAppearance: 'textfield',
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Planned: {term.percent}% (₹{plannedAmount.toLocaleString('en-IN')})
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ ADJUSTMENT BUCKET CARD - Shows carry-forward amounts */}
              <div className="mt-4">
                <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-300 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-bold text-gray-700 uppercase">📦 Adjustment Bucket (Carry Forward)</label>
                  </div>
                  
                  {/* Previous unpaid amount */}
                  {adjustmentAmount > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-yellow-200">
                      <span className="text-sm font-semibold text-gray-600">Previous Unpaid:</span>
                      <span className="text-base font-bold text-amber-700">
                        ₹{adjustmentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  {/* Current unpaid from this installment */}
                  {currentUnpaid > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-yellow-200">
                      <span className="text-sm font-semibold text-gray-600">Current Unpaid:</span>
                      <span className="text-base font-bold text-orange-600">
                        ₹{currentUnpaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  {/* Total adjustment */}
                  {totalAdjustmentBucket > 0 && (
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm font-bold text-gray-700">Total to Carry Forward:</span>
                      <span className="text-lg font-bold text-red-700">
                        ₹{totalAdjustmentBucket.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-xs font-normal text-gray-600 ml-2">
                          ({((totalAdjustmentBucket / (parseFloat(invoiceData.finalAmount) || 1)) * 100).toFixed(2)}%)
                        </span>
                      </span>
                    </div>
                  )}
                  
                  {/* Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 mt-3">
                    <p className="text-xs text-blue-700">
                      <strong>ℹ️ How it works:</strong>{' '}
                      {totalAdjustmentBucket > 0 ? (
                        "This unpaid amount will be automatically added to the client's outstanding balance and carried forward to the next invoice."
                      ) : (
                        "No unpaid amounts to carry forward. Payment is on track."
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {availableInstallments.length > 0 && (
                <div className="mt-4 bg-linear-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-100 shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-orange-600 uppercase">Pending Balance (after this invoice)</label>
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">DUE LATER</span>
                  </div>
                  <div className="text-2xl font-black text-orange-700 mt-2">
                    ₹{Math.max(0, remainingBalance - (parseFloat(invoiceData.advancePaid) || 0)).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                💳 Payment Method
              </label>
              <select 
                className="w-full p-3 bg-white border border-gray-300 rounded-lg font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                value={invoiceData.paymentMethod}
                onChange={(e) => setInvoiceData({...invoiceData, paymentMethod: e.target.value})}
              >
                <option value="UPI/Online">UPI / Online Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">NEFT / Bank Transfer</option>
              </select>
            </div>


            <div className="bg-[#f0f7ff] p-4 sm:p-6 rounded-xl border border-blue-100 shadow-sm mt-4">
              <h4 className="text-gray-700 font-bold mb-4 text-base">
                Authorization Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Authorized Signature
                  </label>

                  <div className="relative w-full h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden">
                    {signature ? (
                      <img 
                        src={signature} 
                        alt="Signature" 
                        className="h-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Upload Signature
                      </span>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setSignature(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Company Stamp
                  </label>

                  <div className="relative w-full h-24 border border-gray-300 rounded-lg bg-white flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden">
                    {stamp ? (
                      <img 
                        src={stamp} 
                        alt="Stamp" 
                        className="h-full object-contain opacity-90"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Upload Stamp
                      </span>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) setStamp(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={handleSaveInvoice} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow">Save Invoice</button>
              <button onClick={() => setShowPreview(true)} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow">Preview</button>
              <button onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-8 py-3 rounded-lg font-bold shadow">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-black/40 overflow-y-auto z-50 p-10 flex flex-col items-center">
          <div className="bg-white w-198.5 min-h-225 p-8 shadow-xl">
            <div ref={printRef} className="relative border-2 border-black h-full p-6 text-[14px] flex flex-col overflow-hidden">
              {/* WATERMARK */}
                <img
                  src={watermark}
                  alt="watermark"
                  className="absolute top-1/2 left-1/2 w-[450px] opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-2"
                />

              {/* CONTENT */}
                <div className="relative z-8">

              {/* Header Section */}
              <div className="flex justify-between items-start border-b border-gray-400 pb-4">
                <div className="flex gap-4">
                  <img src={mainlogo} alt="Logo" className="w-30 border p-1" />
                  <div>
                    <h1 className="text-lg font-bold">SMARTMATRIX Digital Services</h1>
                    <p className="text-[13px] leading-tight">First Floor, Survey No. 21, Ganesham Commercial-A, Office No 102-A,
                      Aundh-Ravet BRTS Rd, Pimple Saudagar, Pune 411027</p>
                    <p className="text-[13px]">Phone: 9112108484</p>
                    <p className="text-[13px]">GSTIN: 27ABCDE1234F1Z5</p>
                  </div>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter">INVOICE</h1>
              </div>

              <div className="text-center text-gray-500 font-bold text-base py-3 border-b">
              TAX INVOICE
              </div>

              <div className="grid grid-cols-2 border-b border-gray-400">
                <div className="p-3 border-r border-gray-400 space-y-1">
                  <h3 className="font-bold text-sm">BILL TO:</h3>
                  <p><span className="font-bold">Client Name:</span> {invoiceData.clientName}</p>
                  <p><span className="font-bold">Phone:</span> {invoiceData.clientPhone}</p>
                  <p><span className="font-bold">Email:</span> {invoiceData.clientEmail}</p>
                  <p><span  className="font-bold">Address:</span> {invoiceData.clientAddress}</p>
                </div>
                <div className="p-3 text-sm flex flex-col justify-between">
                  <div className="flex justify-between border-b border-gray-300 py-1"><span>Invoice No:</span><span className="font-medium">{invoiceData.invoiceNumber}</span></div>
                  <div className="flex justify-between border-b border-gray-300 py-1"><span>Invoice Date:</span><span className="font-medium">{invoiceData.invoiceDate}</span></div>
                  <div className="flex justify-between border-b border-gray-300 py-1"><span>Employee:</span><span className="font-medium">{currentEmpName}</span></div>
                <div className="flex justify-between border-b border-gray-300 py-1">
                  <span>Payment Method:</span>
                  <span className="font-bold text-green-600">
                    {invoiceData.paymentMethod}
                  </span>
                </div>
                  <div className="flex justify-between py-1">
                    <span>Payment Status:</span>
                    <span className={`font-bold ${invoiceData.paymentStatus === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
                      {invoiceData.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse mt-4">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-400">
                    <th className="border border-gray-400 p-2 w-16 text-gray-700">Sr No.</th>
                    <th className="border border-gray-400 p-2 text-left text-gray-700">Name of Project/Service</th>
                    <th className="border border-gray-400 p-2 w-24 text-gray-700">Price</th>
                    <th className="border border-gray-400 p-2 w-32 text-gray-700">Total</th>
                   </tr>
                </thead>
                <tbody>
                  <tr className="h-10">
                    <td className="border border-gray-400 text-center pt-2 align-top">1</td>
                    <td className="border border-gray-400 p-2 align-top font-medium">{invoiceData.projectName}</td>
                    <td className="border border-gray-400 text-center pt-2 align-top">₹{Number(invoiceData.totalAmount).toLocaleString("en-IN")}</td>
                    <td className="border border-gray-400 text-center p-2 align-top font-bold text-gray-800">₹{Number(invoiceData.finalAmount).toLocaleString("en-IN")}</td>
                   </tr>
                </tbody>
              </table>

            <div className="grid grid-cols-2 border border-gray-400 mt-4">
                
                <div className="p-4 border-r border-gray-300 bg-gray-50">
                  <p className="text-[11px] font-semibold uppercase text-gray-600 tracking-wide mb-2">
                    Amount in Words
                  </p>
                  <p 
                    style={{ fontSize: '15px' }} 
                    className="uppercase leading-snug text-gray-900 tracking-wide font-medium"
                  >
                    {numberToWords(Math.round(invoiceData.finalAmount))} Rupees Only
                  </p>
                </div>

                <div className="text-sm">
                  
                  <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                    <span className="text-gray-600">Total Project Amount</span>
                    <span className="font-medium text-gray-900">
                      ₹{Number(invoiceData.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {invoiceData.taxRate > 0 && (
                    <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                      <span className="text-gray-600">GST ({invoiceData.taxRate}%)</span>
                      <span className="font-medium text-gray-900">
                        ₹{Number(invoiceData.taxAmount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between px-3 py-2 border-b border-gray-300 bg-gray-50">
                    <span className="font-semibold text-gray-800">Final Amount</span>
                    <span className="font-bold text-base text-gray-900">
                      ₹{Number(invoiceData.finalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold text-gray-900">
                      ₹{Number(invoiceData.totalPaidAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between px-3 py-2">
                    <span className="font-semibold text-gray-800">Balance Due</span>
                    <span className="font-bold text-base text-gray-900">
                      ₹{Number(invoiceData.balanceAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                </div>
              </div>

              <div className="flex justify-end items-end gap-10 mt-13">

              <div className="text-center">
                {stamp ? (
                  <img 
                    src={stamp} 
                    alt="Stamp" 
                    className="h-27 mx-auto mb-1 opacity-90 -mt-6"
                  />
                ) : (
                  <div className="h-25"></div>
                )}
              </div>

              <div className="text-center">
                {signature ? (
                  <img 
                    src={signature} 
                    alt="Signature" 
                    className="h-20 mx-auto mb-1"
                  />
                ) : (
                  <div className="h-12"></div>
                )}
                <div className="w-48 border-t border-black"></div>
                <p className="text-[11px] font-bold uppercase mt-1">
                  Authorized Signature
                </p>
              </div>
            </div>
            </div>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button onClick={handleInvoicePrint} className="bg-blue-600 text-white px-10 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700">Print Invoice</button>
            <button onClick={() => setShowPreview(false)} className="bg-white text-gray-800 px-10 py-2 rounded-full font-bold border hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
      <ToastContainer 
  position="top-right" 
  autoClose={3000} 
  style={{ zIndex: 99999 }} 
/>
    </div> 
    
  );
};

export default Invoice;