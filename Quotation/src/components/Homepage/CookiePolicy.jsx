import React from 'react';
import { useNavigate } from 'react-router-dom';

const CookiePolicy = () => {
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
          <h1 className="text-4xl font-bold">Cookie Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit our website 
              or use our application. They help us recognize you and remember your preferences, enabling us to provide a better user experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Essential Cookies</h3>
                <p className="text-gray-700">
                  These are necessary for the Service to function properly. They enable authentication, session management, 
                  and security functions. You cannot disable these cookies as the Service will not work without them.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Cookies</h3>
                <p className="text-gray-700">
                  These cookies collect information about how you use our Service, such as pages visited, links clicked, 
                  and errors encountered. This helps us improve Service performance and user experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Functional Cookies</h3>
                <p className="text-gray-700">
                  These cookies remember your preferences and settings, such as language, theme, and layout preferences, 
                  to personalize your experience.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Marketing Cookies</h3>
                <p className="text-gray-700">
                  These cookies track your browsing habits to display relevant advertising and marketing content. 
                  You can control these through your browser settings or our cookie preferences.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Specific Cookies Used</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">Cookie Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-slate-900">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">sessionId</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Essential</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">User session management</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">empId</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Essential</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Employee identification</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">userPreferences</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Functional</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Storing user settings and preferences</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">analytics</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Performance</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">Usage analytics and site improvements</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may use third-party services that place cookies on your device for analytics, advertising, and functionality purposes, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Google Analytics for usage tracking and insights</li>
              <li>Advertising networks for targeted campaigns</li>
              <li>Social media platforms for integration features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to control and delete cookies. Most browsers allow you to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>View cookies stored on your device</li>
              <li>Block all cookies or specific types of cookies</li>
              <li>Delete cookies after your browsing session</li>
              <li>Receive warnings when cookies are being set</li>
            </ul>
            <p className="text-gray-700 mt-4 leading-relaxed">
              Note: Disabling essential cookies may affect the Service's functionality. For detailed instructions, 
              visit your browser's help documentation or privacy settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Do Not Track (DNT)</h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers include a "Do Not Track" feature. Our Service recognizes DNT signals and will limit tracking 
              and data collection accordingly when enabled. However, please note that not all features may work optimally 
              when DNT is enabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Changes to This Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy periodically to reflect changes in our practices, technology, legal requirements, 
              or other factors. We will notify you of significant changes via email or prominent notice on our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For questions about our cookie practices or to manage your preferences, please contact us at:
            </p>
            <div className="bg-gray-100 rounded p-4">
              <p className="text-gray-800"><strong>Email:</strong> privacy@quotationsoftware.com</p>
              <p className="text-gray-800"><strong>Phone:</strong> +91 9112108484</p>
              <p className="text-gray-800"><strong>Address:</strong> Office No. 102-B, First Floor, Ganesham Commercial -A, Survey No. 21/18-21/24, BRTS Road, Pimple Saudagar, Pune- 411027</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
