import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate('/')}
            className="text-cyan-400 hover:text-cyan-300 text-sm mb-4 flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-4xl font-bold">Terms of Service</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the QuotationSoftware platform (the "Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Use License</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We grant you a limited, non-exclusive, revocable license to use the Service for your business operations, 
              subject to the restrictions outlined in this agreement. You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Reproduce, copy, or transmit any content</li>
              <li>Attempt to gain unauthorized access to the system</li>
              <li>Remove or obscure copyright or proprietary notices</li>
              <li>Use the Service for illegal or unauthorized purposes</li>
              <li>Transmit harmful code or malware</li>
              <li>Reverse engineer or decrypt any transmission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">User Account Responsibility</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your login credentials</li>
              <li>All activities occurring under your account</li>
              <li>Promptly informing us of any unauthorized access</li>
              <li>Ensuring information you provide is accurate and complete</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Quotations and Invoices</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All quotations, invoices, and documents generated through our Service are for business reference only. 
              The accuracy and completeness of such documents remain your responsibility. We are not liable for any 
              errors or omissions in documents you generate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Intellectual Property Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service and its content are owned by QuotationSoftware Digital Services Pvt. Ltd. or its content suppliers. 
              All intellectual property rights are reserved. You retain ownership of your business data and documents created through the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Limitations of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To the fullest extent permitted by law, QuotationSoftware and its officers, directors, and employees shall not be liable for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Any indirect, incidental, or consequential damages</li>
              <li>Loss of business, revenue, or profit</li>
              <li>Data loss or corruption</li>
              <li>Service interruptions or downtime</li>
              <li>Unauthorized access to user information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Disclaimer of Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either 
              express or implied. We disclaim all warranties, including but not limited to, merchantability, fitness 
              for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Modifications</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue the Service or any portion thereof at any time. 
              We are not liable to you or any third party for any modifications or discontinuance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate your access to the Service at any time for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Non-payment of fees or charges</li>
              <li>Illegal or unauthorized use</li>
              <li>Business or operational reasons</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold harmless QuotationSoftware Digital Services Pvt. Ltd., its officers, 
              directors, and employees from any claim, damage, or loss arising from your use of the Service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-100 rounded p-4">
              <p className="text-gray-800"><strong>Email:</strong> legal@quotationsoftware.com</p>
              <p className="text-gray-800"><strong>Phone:</strong> +91 9112108484</p>
              <p className="text-gray-800"><strong>Address:</strong> Office No. 102-B, First Floor, Ganesham Commercial -A, Survey No. 21/18-21/24, BRTS Road, Pimple Saudagar, Pune- 411027</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
