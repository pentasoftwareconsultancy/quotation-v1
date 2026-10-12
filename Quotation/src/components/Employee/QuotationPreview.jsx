import React, { useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getCompany } from "../../config/quotation/companyConfig";
import {
  calculateGST,
  calculateFinalAmount,
  calculatePayment,
  calculateTimelineWeeks,
  calculateMaintenanceRange,
  formatIndianCurrency,
} from "../../utils/quotation/quotationCalculations";

const QuotationPreview = ({ formData, onClose }) => {
  const fileInputRef = useRef(null);

  // ── loading state for Send for Approval ──
  const [isSending, setIsSending] = useState(false);

  console.log("Preview formData:", formData);
  if (!formData || Object.keys(formData).length === 0) {
    return <div className="p-6 text-center">No data available</div>;
  }

  const company = getCompany(formData.companyKey);
  const currentHeader = company.assets.header;
  const currentFooter = company.assets.footer;

  // Uploaded signature/stamp takes priority; otherwise fall back to the
  // selected company's default.
  const signatureSrc = formData.signature || company.assets.signature;
  const stampSrc = formData.companyStamp || company.assets.stamp;

  // GST calculation for preview
  const gstPercent = formData.gstPercent || 0;

  const gstAmount = calculateGST(formData.totalCost, gstPercent);

  const finalAmount = calculateFinalAmount(formData.totalCost, gstAmount);

  const handlePrint = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const original = document.querySelector("#print-section").cloneNode(true);

    // ❌ Remove header & footer from clone
    original.querySelector(".header")?.remove();
    original.querySelector(".footer")?.remove();
    original.querySelector("img[alt='watermark']")?.remove(); // 🔥 IMPORTANT

    const printContent = original.innerHTML;
    const headerURL = new URL(currentHeader, window.location.href).href;
    const footerURL = new URL(currentFooter, window.location.href).href;
    const watermarkURL = new URL(company.assets.watermark, window.location.href).href;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules)
            .map((rule) => rule.cssText)
            .join("");
        } catch {
          return "";
        }
      })
      .join("");

    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
<html>
<head>
<style>
  ${styles}

  @page {
    size: A4;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
  }

  /* HEADER REPEAT */
  thead {
    display: table-header-group;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  /* HEADER */
  .page-header img {
  width: 100%;
  display: block;
}

/* control spacing properly */
.page-header td {
  padding-bottom: 7px;
}

  /* CONTENT */
  .page-content {
  padding: 0px 20px;
  vertical-align: top;
}

  /* FIXED FOOTER (REAL FIX) */
  .footer-fixed {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
  }

  .footer-fixed img {
    width: 100%;
  }

  /* WATERMARK */
  .watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 300px;
    opacity: 0.30;
    transform: translate(-50%, -50%);
    z-index: 0;
  }

  img {
    -webkit-print-color-adjust: exact;
  }

  tr {
    page-break-inside: avoid;
  }

  tfoot {
  display: table-footer-group;
}

.footer-spacer {
  height: 60px; /* match your footer height */
}
</style>
</head>

<body>

<img src="${watermarkURL}" class="watermark" />

<table>

  <!-- HEADER -->
  <thead class="page-header">
    <tr>
      <td>
        <img src="${headerURL}" />
      </td>
    </tr>
  </thead>

  <!-- CONTENT -->
  <tbody>
    <tr>
      <td class="page-content">
        ${printContent}
      </td>
    </tr>
  </tbody>

  <tfoot>
  <tr>
    <td class="footer-spacer"></td>
  </tr>
</tfoot>

</table>

<!-- ✅ FOOTER (FIXED, ALWAYS BOTTOM) -->
<div class="footer-fixed">
  <img src="${footerURL}" />
</div>

<script>
  window.onload = function() {
    window.print();
    setTimeout(() => {
      window.frameElement.remove();
    }, 100);
  };
</script>

</body>
</html>
`);
    doc.close();
  };

  // ✅ NEW: Direct submission to admin (no file upload)
  const handleSendToAdminForApproval = async () => {
    if (!formData.id) {
      toast.error("Quotation ID is missing. Please save the quotation first.");
      return;
    }

    try {
      setIsSending(true);

      const response = await fetch(
        `https://quotation-v1-y2m6.onrender.com/api/quotations/${formData.id}/send-to-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const message = await response.text();
        toast.success(message || "Quotation successfully sent to admin for approval! ✅");
        
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorMsg = await response.text();
        toast.error(errorMsg || "Failed to send quotation to admin ❌");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      toast.error("Server connection error. Please try again ⚠️");
    } finally {
      setIsSending(false);
    }
  };

  // ⚠️ KEPT FOR CLIENT APPROVAL WORKFLOW (Send PDF to client via email)
  const handleSendForApprovalClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setIsSending(true);

      const response = await fetch(
        `https://quotation-v1-y2m6.onrender.com/api/quotations/${formData.id}/send-approval-pdf`,
        {
          method: "POST",
          body: data,
        }
      );

      if (response.ok) {
        toast.success("PDF uploaded & email sent to client successfully 🚀");

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error("Failed to send email to client ❌");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Server connection error ⚠️");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto p-6 print:static print:bg-white print:p-0">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ⚠️ HIDDEN FILE INPUT - Only used for "Send PDF to Client" workflow (not currently exposed in UI) */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {/* ── Glassmorphism Loading Overlay ── */}
      {isSending && (
        <>
          <style>{`
            @keyframes fadeInScale {
              from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
              to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            .approval-loader {
              animation: fadeInScale 0.3s ease-in-out forwards;
            }
          `}</style>

          {/* Frosted-glass shield — no black, just a soft blur over the preview */}
          <div className="fixed inset-0 z-[60] backdrop-blur-sm bg-white/10" />

          {/* Centered floating card */}
          <div
            className="approval-loader fixed z-[70] top-1/2 left-1/2
                        bg-white/40 backdrop-blur-xl border border-white/50
                        rounded-2xl px-10 py-8 shadow-2xl
                        flex flex-col items-center gap-4"
          >
            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />

            {/* Primary text */}
            <p className="text-lg font-semibold text-gray-800">
              Submitting to Admin...
            </p>

            {/* Sub text */}
            <p className="text-sm text-gray-600">
              Please wait while we process your request
            </p>
          </div>
        </>
      )}

      <div
        id="print-section"
        className="bg-white w-full max-w-6xl mx-auto rounded-xl shadow-2xl print:shadow-none print:rounded-none"
      >

        {/* HEADER */}
        <div className="header">
          <img src={currentHeader} alt="Header" className="w-full" />
        </div>

        {/* BODY */}
        <div className="content relative p-8 space-y-6 text-gray-800 overflow-hidden">
          {/* WATERMARK */}
          <img
            src={company.assets.watermark}
            alt="watermark"
            className="absolute top-1/2 left-1/2 w-[280px] opacity-25 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          />
          {/* Quotation Info */}
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p><strong>Quotation No:</strong> {formData.quotationNumber}</p>
              <p><strong>Date:</strong> {formData.date}</p>
              <p><strong>Valid Until:</strong> {formData.validUntil}</p>
            </div>
            <div>
              <p><strong>Client:</strong> {formData.client}</p>
              {formData.clientOrganization && (
                <p className="text-sm text-gray-700"><strong>Organization:</strong> {formData.clientOrganization}</p>
              )}
              <p><strong>Email:</strong> {formData.clientEmail}</p>
              <p><strong>Phone:</strong> {formData.clientPhone}</p>
              <p><strong>Address:</strong> {formData.clientAddress}</p>
            </div>
          </div>

          {/* Project Info */}
          <div className=" border border-gray-500 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-orange-700 mb-4">
              Project Details
            </h3>
            <p><strong>Project:</strong> {formData.project}</p>
            <p><strong>Version:</strong> {formData.version}</p>
            <p><strong>Currency:</strong> {formData.currency}</p>
            <p className="text-lg font-bold text-orange-700 mt-2">
              Final Amount: {formatIndianCurrency(gstPercent > 0 ? finalAmount : formData.totalCost)}
            </p>
          </div>

          {/* About Project */}
          {formData.aboutProject && (
            <div className=" rounded-lg print:bg-transparent print:border-none print:p-0">
              <h3 className="text-xl font-bold mb-4">1. About Project</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed print:text-black">
                {formData.aboutProject}
              </p>
            </div>
          )}

          {/* Scope of Work */}
          {formData.scopeOfWork && (
            <div className=" rounded-lg print:bg-transparent print:border-none print:p-0">
              <h3 className="text-xl font-bold mb-4">2. Scope of Work</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed print:text-black">
                {formData.scopeOfWork}
              </p>
            </div>
          )}

          {/* Technology Stack */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              3. Technology Stack
            </h3>
            <table className="w-full border border-black-500 border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-left font-semibold">Component</th>
                  <th className="p-3 text-left font-semibold">Technology</th>
                  <th className="p-3 text-left font-semibold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {formData.techStack
                  ?.filter(
                    (tech) =>
                      tech.component?.trim() ||
                      tech.technology?.trim() ||
                      tech.rationale?.trim()
                  )
                  ?.map((tech, index) => {
                    const isLast =
                      index ===
                      formData.techStack.filter(
                        (t) =>
                          t.component?.trim() ||
                          t.technology?.trim() ||
                          t.rationale?.trim()
                      ).length - 1;

                    return (
                      <tr
                        key={index}
                        className={!isLast ? "border-b border-gray-200" : ""}
                      >
                        <td className="p-3">{tech.component}</td>
                        <td className="p-3">{tech.technology}</td>
                        <td className="p-3">{tech.rationale}</td>
                      </tr>
                    );
                  })}

                {!formData.techStack?.some(
                  (tech) =>
                    tech.component?.trim() ||
                    tech.technology?.trim() ||
                    tech.rationale?.trim()
                ) && (
                    <tr>
                      <td colSpan="3" className="p-3 text-center text-gray-500">
                        No technology stack defined
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-xl font-bold mb-4">4. Cost Breakdown</h3>
            <table className="w-full border border-black-500 border-collapse text-sm table-fixed">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 w-[8%] text-left">Sr</th>
                  <th className="p-3 w-[30%] text-left">Development Area</th>
                  <th className="p-3 w-[40%] text-left">Resources Assigned</th>
                  <th className="p-3 w-[22%] text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.costBreakdown?.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="p-3 text-center">{item.srNo}</td>
                    <td className="p-3">{item.area}</td>
                    <td className="p-3 whitespace-pre-wrap break-words">{item.resources || item.scope}</td>
                    <td className="p-3 text-left font-semibold text-black">{item.amount}</td>
                  </tr>
                ))}

                <tr className="font-bold border-t border-black">
                  <td colSpan="3" className="p-3 text-right">TOTAL PROJECT COST</td>
                  <td className="p-3 text-left text-black">{formatIndianCurrency(formData.totalCost)}</td>
                </tr>

                {gstPercent > 0 && (
                  <tr className="border-b border-gray-200">
                    <td colSpan="3" className="p-3 text-right font-semibold">
                      GST ({gstPercent}%)
                    </td>
                    <td className="p-3 text-left text-black">{formatIndianCurrency(gstAmount)}</td>
                  </tr>
                )}

                {gstPercent > 0 && (
                  <tr className="font-bold border-t border-black">
                    <td colSpan="3" className="p-3 text-right">FINAL AMOUNT</td>
                    <td className="p-3 text-left text-lg text-black">{formatIndianCurrency(finalAmount)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">5. Project Timeline</h3>
            <table className="w-full border border-black border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-left">Phase</th>
                  <th className="p-3 text-left">Duration</th>
                  <th className="p-3 text-left">Deliverables</th>
                </tr>
              </thead>
              <tbody>
                {formData.timeline?.map((phase, index) => (
                  <tr
                    key={index}
                    className={`border-gray-200 ${index !== formData.timeline.length - 1 ? "border-b" : ""
                      }`}
                  >
                    <td className="p-3">{phase.phase}</td>
                    <td className="p-3">{phase.duration}</td>
                    <td className="p-3">{phase.deliverables}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-semibold">
              Total Timeline: {calculateTimelineWeeks(formData.timeline)} Weeks
            </p>
          </div>

          {/* Payment Terms */}
          <div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              6. Payment Terms (Net 30 Days Invoicing)
            </h3>
            <ul className="space-y-1 text-sm">
              {formData.paymentTerms
                ?.filter((term) => term.percent && term.label)
                ?.map((term, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 text-lg font-bold">✔</span>
                    <span>
                      {term.percent}% ({formatIndianCurrency(calculatePayment(formData.totalCost, term.percent))}) – {term.label}
                    </span>
                  </li>
                ))}
              <li className="flex items-start gap-2">
                <span className="text-green-600 text-lg font-bold">✔</span>
                <span>GST @ {gstPercent}% extra as applicable</span>
              </li>
            </ul>
          </div>

          {/* Post Launch Maintenance */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              7. Post-Launch Maintenance (Optional, 12-Month Contract)
            </h3>
            <table className="w-full border border-black border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-left">Plan</th>
                  <th className="p-3 text-left">Coverage</th>
                  <th className="p-3 text-left">Monthly (₹)</th>
                </tr>
              </thead>
              <tbody>
                {formData.maintenancePlans?.map((plan, index) => (
                  <tr
                    key={index}
                    className={`border-gray-200 ${index !== formData.maintenancePlans.length - 1 ? "border-b" : ""
                      }`}
                  >
                    <td className="p-3 font-medium">{plan.plan}</td>
                    <td className="p-3">{plan.coverage}</td>
                    <td className="p-3">₹{Number(plan.monthly).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 font-semibold">
              Total Range: {calculateMaintenanceRange(formData.maintenancePlans)}{" "}
              <span className="font-normal">(per year, Excl. GST)</span>
            </p>
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-semibold">Note:</span> Usage-based recurring costs excluded from development quote per industry norms. Client manages billing directly with providers.
            </p>
          </div>

          {/* Assumptions, Exclusions & Warranty */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              9. Assumptions, Exclusions & Warranty
            </h3>

            {formData.assumptions?.included?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">INCLUDED:</h4>
                <ul className="space-y-1 text-sm">
                  {formData.assumptions.included.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formData.assumptions?.excluded?.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">EXCLUDED:</h4>
                <ul className="space-y-1 text-sm">
                  {formData.assumptions.excluded.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {formData.assumptions?.warranty?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">WARRANTY & SUPPORT:</h4>
                <ul className="space-y-1 text-sm">
                  {formData.assumptions.warranty.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Total Investment */}
          <div className="mt-8">
            <p className="text-lg font-semibold text-gray-800">
              Total Investment:{" "}
              {formatIndianCurrency(formData.totalCost)} +{" "}
              {formatIndianCurrency(gstAmount)} ({gstPercent}% GST Applicable)
            </p>
            <p className="text-xl font-bold text-gray-900 mt-2">
              Final Project Investment: {formatIndianCurrency(finalAmount)}
            </p>
          </div>

          {/* Authorized Signature Preview */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold text-gray-800 mb-3">
              Authorized Signature:
            </h3>

            {(signatureSrc || stampSrc) && (
              <div className="flex items-end gap-6 mb-4">
                {signatureSrc && (
                  <img
                    src={signatureSrc}
                    alt="Signature"
                    className="w-28 h-auto object-contain"
                  />
                )}
                {stampSrc && (
                  <img
                    src={stampSrc}
                    alt="Company Stamp"
                    className="w-30 h-30 object-contain"
                  />
                )}
              </div>
            )}

            <div className="text-sm text-gray-800">
              <p className="font-semibold">{formData.authorizedName}</p>
              <p>{formData.authorizedRole}</p>
              <p className="font-semibold">{formData.companyName}</p>
              <p>
                Contact: {formData.contactNumber} |{" "}
                <span className="text-blue-600 underline">{formData.contactEmail}</span>{" "}
                | {formData.location}
              </p>
              <p className="mt-2">
                <span className="font-semibold">Note:</span> {formData.signatureNote}
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <img src={currentFooter} alt="Footer" className="w-full" />
        </div>

        {/* BUTTONS */}
        <div className="bg-gray-100 border-t p-4 flex justify-center gap-6 print:hidden">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            Print / Save PDF
          </button>

          {/* ── Send to Admin for Approval: disabled + dimmed while uploading ── */}
          <button
            onClick={handleSendToAdminForApproval}
            disabled={isSending}
            className={`bg-green-600 text-white px-6 py-2 rounded transition-opacity duration-200 ${isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
              }`}
          >
            Send to Admin for Approval
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreview;
