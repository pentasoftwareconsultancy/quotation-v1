import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              QuotationSoftware Digital Services Pvt. Ltd. ("Company," "we," "us," or "our") operates the QuotationSoftware platform. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Company name and business details</li>
                  <li>Login credentials and account information</li>
                  <li>Quotation and invoice data</li>
                  <li>Employee and client information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and activity logs</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Providing and maintaining our services</li>
              <li>Processing quotations and invoices</li>
              <li>Managing user accounts and authentication</li>
              <li>Sending transactional and promotional communications</li>
              <li>Improving user experience and service quality</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement comprehensive security measures including SSL encryption, secure authentication protocols, 
              and regular security audits to protect your information. However, no method of transmission over the Internet 
              is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain personal information as long as your account is active or as required for legal compliance. 
              You may request deletion of your data at any time, subject to certain legal and operational requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Sharing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Service providers and contractors assisting with operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners for integrated services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability and transfer</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For privacy concerns or data requests, please contact us at:
            </p>
            <div className="bg-gray-100 rounded p-4">
              <p className="text-gray-800"><strong>Email:</strong> privacy@quotationsoftware.com</p>
              <p className="text-gray-800"><strong>Phone:</strong> +91 9112108484</p>
              <p className="text-gray-800"><strong>Address:</strong> Office No. 102-B, First Floor, Ganesham Commercial -A, Survey No. 21/18-21/24, BRTS Road, Pimple Saudagar, Pune- 411027</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy periodically. Continued use of our services after changes constitutes 
              acceptance of the updated policy. We will notify you of significant changes via email or prominent notice on our platform.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
