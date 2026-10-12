import React, { useState } from 'react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'quotation', label: 'Quotation Settings' },
    { id: 'email', label: 'Email Templates' },
    { id: 'security', label: 'Security' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        Settings
      </h2>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Mobile Tab Selector */}
        <div className="block sm:hidden border-b border-gray-200 p-4">
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:block border-b border-gray-200">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Company Name</label>
                <input 
                  type="text" 
                  defaultValue="Your Company Name" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Company Address</label>
                <textarea 
                  defaultValue="123 Business St, City, State 12345" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                  <input 
                    type="tel" 
                    defaultValue="+1-555-0123" 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                  <input 
                    type="email" 
                    defaultValue="info@company.com" 
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quotation' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Default Tax Rate (%)</label>
                <input 
                  type="number" 
                  defaultValue="10" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Quotation Validity (Days)</label>
                <input 
                  type="number" 
                  defaultValue="30" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Auto-numbering Format</label>
                <select className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                  <option>Q-YYYY-NNN</option>
                  <option>QUOTE-YYYY-NNN</option>
                  <option>QT-YYYYMM-NNN</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Quotation Email Subject</label>
                <input 
                  type="text" 
                  defaultValue="Your Quotation - {QUOTE_ID}" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Email Template</label>
                <textarea 
                  defaultValue="Dear {CLIENT_NAME},&#10;&#10;Please find attached your quotation {QUOTE_ID}.&#10;&#10;Best regards,&#10;{COMPANY_NAME}"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  rows="6"
                ></textarea>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                  <span className="text-sm sm:text-base text-gray-700">Require password change every 90 days</span>
                </label>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" defaultChecked />
                  <span className="text-sm sm:text-base text-gray-700">Enable two-factor authentication</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  defaultValue="60" 
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium">
              Save Changes
            </button>
            <button className="flex-1 sm:flex-none bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium">
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;