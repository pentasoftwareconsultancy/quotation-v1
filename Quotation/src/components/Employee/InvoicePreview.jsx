import React, { useRef } from 'react';
import mainlogo from "../../assets/mainlogo.webp";
import signatureImg from "../../assets/Smartmatrix_CEO.png";
import stampImg from "../../assets/Smartmatrix_stamp.png";
import watermark from "../../assets/Smartmatrix_watermark.png";

const InvoicePreview = ({ invoiceData, onClose }) => {
  const printRef = useRef();
  
  // Use invoiceData and provide fallback
  const invoice = invoiceData || {};

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
        } catch (e) {
          return "";
        }
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

  // Parse amounts safely
  const finalAmount = parseFloat(invoice.finalAmount) || 0;
  const totalAmount = parseFloat(invoice.totalAmount) || 0;
  const taxAmount = parseFloat(invoice.taxAmount) || 0;
  const taxRate = parseFloat(invoice.taxRate) || 0;
  const totalPaidAmount = parseFloat(invoice.totalPaidAmount) || 0;
  const balanceAmount = parseFloat(invoice.balanceAmount) || 0;

  return (
    <div className="fixed inset-0 bg-black/40 overflow-y-auto z-50 p-4 sm:p-10 flex flex-col items-center">
      <div className="bg-white w-full max-w-4xl shadow-xl rounded-lg">
        <div ref={printRef} className="relative border-2 border-black p-4 sm:p-6 text-sm sm:text-base overflow-hidden">
          {/* WATERMARK */}
          <img
            src={watermark}
            alt="watermark"
            className="absolute top-1/2 left-1/2 w-64 sm:w-96 opacity-50 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
          />

          {/* CONTENT */}
          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-gray-400 pb-4 gap-4">
              <div className="flex gap-4">
                <img src={mainlogo} alt="Logo" className="w-20 sm:w-30 border p-1" />
                <div>
                  <h1 className="text-base sm:text-lg font-bold">SMARTMATRIX Digital Services</h1>
                  <p className="text-xs sm:text-sm leading-tight">
                    First Floor, Survey No. 21, Ganesham Commercial-A, Office No 102-A,
                    Aundh-Ravet BRTS Rd, Pimple Saudagar, Pune 411027
                  </p>
                  <p className="text-xs sm:text-sm">Phone: 9112108484</p>
                  <p className="text-xs sm:text-sm">GSTIN: 27ABCDE1234F1Z5</p>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter">INVOICE</h1>
            </div>

            <div className="text-center text-gray-500 font-bold text-sm sm:text-base py-3 border-b">
              TAX INVOICE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-gray-400">
              <div className="p-3 border-b sm:border-b-0 sm:border-r border-gray-400 space-y-1">
                <h3 className="font-bold text-sm">BILL TO:</h3>
                <p><span className="font-bold">Client Name:</span> {invoice.clientName}</p>
                <p><span className="font-bold">Phone:</span> {invoice.clientPhone}</p>
                <p><span className="font-bold">Email:</span> {invoice.clientEmail}</p>
                <p><span className="font-bold">Address:</span> {invoice.clientAddress}</p>
              </div>
              <div className="p-3 text-xs sm:text-sm flex flex-col justify-between space-y-2">
                <div className="flex justify-between border-b border-gray-300 py-1">
                  <span>Invoice No:</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-1">
                  <span>Invoice Date:</span>
                  <span className="font-medium">{invoice.invoiceDate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-1">
                  <span>Employee:</span>
                  <span className="font-medium">{invoice.employeeName || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-300 py-1">
                  <span>Payment Method:</span>
                  <span className="font-bold text-green-600">
                    {invoice.paymentMethod || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Payment Status:</span>
                  <span className={`font-bold ${
                    invoice.paymentStatus === 'Paid' 
                      ? 'text-green-600' 
                      : invoice.paymentStatus === 'Partially Paid'
                      ? 'text-orange-600'
                      : 'text-red-600'
                  }`}>
                    {invoice.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse mt-4">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-400">
                  <th className="border border-gray-400 p-2 w-12 sm:w-16 text-gray-700 text-xs sm:text-sm">Sr No.</th>
                  <th className="border border-gray-400 p-2 text-left text-gray-700 text-xs sm:text-sm">Name of Project/Service</th>
                  <th className="border border-gray-400 p-2 w-20 sm:w-24 text-gray-700 text-xs sm:text-sm">Price</th>
                  <th className="border border-gray-400 p-2 w-24 sm:w-32 text-gray-700 text-xs sm:text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="h-10">
                  <td className="border border-gray-400 text-center pt-2 align-top text-xs sm:text-sm">1</td>
                  <td className="border border-gray-400 p-2 align-top font-medium text-xs sm:text-sm">
                    {invoice.projectName}
                  </td>
                  <td className="border border-gray-400 text-center pt-2 align-top text-xs sm:text-sm">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="border border-gray-400 text-center p-2 align-top font-bold text-gray-800 text-xs sm:text-sm">
                    ₹{finalAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-400 mt-4">
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-gray-300 bg-gray-50">
                <p className="text-xs font-semibold uppercase text-gray-600 tracking-wide mb-2">
                  Amount in Words
                </p>
                <p className="text-sm sm:text-base uppercase leading-snug text-gray-900 tracking-wide font-medium">
                  {numberToWords(Math.round(finalAmount))} Rupees Only
                </p>
              </div>

              <div className="text-xs sm:text-sm">
                <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Project Amount</span>
                  <span className="font-medium text-gray-900">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {taxRate > 0 && (
                  <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                    <span className="text-gray-600">GST ({taxRate}%)</span>
                    <span className="font-medium text-gray-900">
                      ₹{taxAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex justify-between px-3 py-2 border-b border-gray-300 bg-gray-50">
                  <span className="font-semibold text-gray-800">Final Amount</span>
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    ₹{finalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between px-3 py-2 border-b border-gray-200">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-semibold text-gray-900">
                    ₹{totalPaidAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between px-3 py-2">
                  <span className="font-semibold text-gray-800">Balance Due</span>
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    ₹{balanceAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-end gap-6 sm:gap-10 mt-8 sm:mt-13">
              <div className="text-center">
                <img 
                  src={stampImg} 
                  alt="Stamp" 
                  className="h-20 sm:h-27 mx-auto mb-1 opacity-90 -mt-6"
                />
              </div>

              <div className="text-center">
                <img 
                  src={signatureImg} 
                  alt="Signature" 
                  className="h-16 sm:h-20 mx-auto mb-1"
                />
                <div className="w-40 sm:w-48 border-t border-black mx-auto"></div>
                <p className="text-xs font-bold uppercase mt-1">
                  Authorized Signature
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-6 print:hidden">
        <button 
          onClick={handleInvoicePrint} 
          className="bg-blue-600 text-white px-6 sm:px-10 py-2 sm:py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors"
        >
          Download PDF
        </button>
        <button 
          onClick={onClose} 
          className="bg-white text-gray-800 px-6 sm:px-10 py-2 sm:py-3 rounded-full font-bold border hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default InvoicePreview;
