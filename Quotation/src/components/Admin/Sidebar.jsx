  import React from 'react';
  import { LayoutDashboard, FileText, IndianRupee, Users, UserCog, BarChart3, User } from "lucide-react";
  import mainlogo from "../../assets/mainlogo.webp";

  const Sidebar = ({ activeModule, setActiveModule, sidebarOpen, setSidebarOpen, pendingQuotationsCount = 0 }) => {
    const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, gradient: 'from-blue-500 to-blue-600' },
    { id: 'quotations', label: 'Quotations', icon: FileText, gradient: 'from-green-500 to-green-600' },
    { id: 'invoices', label: 'Invoices', icon: IndianRupee, gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'clients', label: 'Clients', icon: Users, gradient: 'from-purple-500 to-purple-600' },
    { id: 'employees', label: 'Employee', icon: UserCog, gradient: 'from-orange-500 to-orange-600' },
    { id: 'reports', label: 'Reports', icon: BarChart3, gradient: 'from-indigo-500 to-indigo-600' },
    { id: 'profile', label: 'Profile', icon: User, gradient: 'from-teal-500 to-teal-600' }
  ];
    return (
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 
          bg-gradient-to-b from-[#171b4d] via-[#370b3b] to-[#a82d55] 
          text-white shadow-2xl transition-transform duration-300 ease-in-out`}>
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden p-0.5 shadow-inner">
                    <img 
                      src={mainlogo} 
                      alt="Main Logo" 
                      className="w-18 h-18 object-contain" 
                    />
                  </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    QuoteAdmin
                  </h2>
                  <p className="text-xs text-gray-400 hidden sm:block">Admin Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="mt-6 px-3">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveModule(item.id);
                  setSidebarOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center px-3 sm:px-4 py-3 mb-2 rounded-xl text-left transition-all duration-300 group ${
                  activeModule === item.id
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg transform scale-105`
                    : 'hover:bg-gray-700/50 hover:transform hover:scale-105'
                }`}>

                <span className="text-xl sm:text-2xl mr-3 sm:mr-4 group-hover:animate-pulse">
                  {React.createElement(item.icon)}
                </span> 
               <span className="font-medium text-sm sm:text-base">{item.label}</span>
                
                {/* Show pending count badge on Quotations menu */}
                {item.id === 'quotations' && pendingQuotationsCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                    {pendingQuotationsCount}
                  </span>
                )}
                
                {activeModule === item.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>

        </div>
      </>
    );
  };

  export default Sidebar;