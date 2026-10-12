import React from 'react';
import { LayoutDashboard, Users, PlusCircle, FileText, IndianRupee, FileCheck, User } from "lucide-react";
import mainlogo from "../../assets/mainlogo.webp";

const EmployeeSidebar = ({ activeModule, setActiveModule, onClose }) => {
  const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-blue-600' },
  { id: 'clients', label: 'Clients', icon: Users, gradient: 'from-purple-500 to-purple-600' },
  { id: 'create', label: 'Create Quotation', icon: PlusCircle, gradient: 'from-orange-500 to-orange-600' },
  { id: 'quotations', label: 'My Quotation', icon: FileText, gradient: 'from-green-500 to-green-600' },
  { id: 'invoice', label: 'Invoice', icon: IndianRupee, gradient: 'from-indigo-500 to-indigo-600' },
  { id: 'myinvoice', label: 'My Invoice', icon: FileCheck, gradient: 'from-teal-500 to-teal-600' },
  { id: 'profile', label: 'Profile', icon: User, gradient: 'from-pink-500 to-pink-600' }
];

  return (
<div className="w-64 bg-gradient-to-b from-[#171b4d] via-[#370b3b] to-[#a82d55] text-white shadow-2xl h-full">  
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
           <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 shadow-inner">
                <img 
                src={mainlogo} 
                alt="Main Logo" 
                className="w-18 h-18 object-contain" />
               </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                QuoteEmployee
              </h2>
              <p className="text-xs text-gray-400">Employee Portal</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <button 
              onClick={onClose}
              className="sm:hidden p-1 rounded-lg hover:bg-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <nav className="mt-4 sm:mt-6 px-2 sm:px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveModule(item.id);
              onClose && onClose();
            }}
            className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 mb-2 rounded-xl text-left transition-all duration-300 group ${
              activeModule === item.id
                ? `bg-gradient-to-r ${item.gradient} shadow-lg transform scale-105`
                : 'hover:bg-gray-700/50 hover:transform hover:scale-105'
            }`}
          >
            <span className="text-lg sm:text-2xl mr-2 sm:mr-4 group-hover:animate-pulse">
  {React.createElement(item.icon)}
</span>
            <span className="font-medium text-sm sm:text-base">{item.label}</span>
            {activeModule === item.id && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

    </div>
  );
};

export default EmployeeSidebar;