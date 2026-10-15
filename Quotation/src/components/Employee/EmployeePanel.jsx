import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeSidebar from './EmployeeSidebar';
import EmployeeDashboard from './EmployeeDashboard';
import MyQuotations from './MyQuotations';
import MyClients from './MyClients';
import CreateQuotation from './CreateQuotation';
import Invoice from './Invoice';
import MyInvoice from './MyInvoice';
import MyProfile from './MyProfile';
import AllNotifications from "./AllNotifications";
import QuotationPreview from './QuotationPreview';

const EmployeePanel = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);
  
  // ✅ 1. ADDED: Session shield to prevent unread count from jumping back during polling
  const readInSession = useRef(new Set());

 useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const empId = localStorage.getItem("empId");
      if (!empId) return;

      // STEP 1: Trigger the generation of reminder notifications on the server
      // This MUST happen before we fetch the list below
      await fetch(`http://localhost:8080/api/quotations/trigger-reminders/${empId}`, {
        method: 'GET' // or POST depending on your backend
      });

      // STEP 2: Fetch the actual notification list
      const res = await fetch(`http://localhost:8080/api/notifications/employee/${empId}`);
      if (!res.ok) return;

      const incoming = await res.json();

      const formatted = incoming.map((n, index) => {
        const id = n.id || n._id || `notif-${index}`;
        return {
          id: id,
          message: n.message,
          timestamp: n.timestamp,
          type: n.type || "INFO",
          read: n.read === true || n.isRead === true || readInSession.current.has(id)
        };
      });
      
      setNotifications(formatted);
    } catch (e) {
      console.error("Employee Notification fetch error", e);
    }
  };

  fetchNotifications();
  const interval = setInterval(fetchNotifications, 30000); 
  return () => clearInterval(interval);
}, []);
  // ================= TOGGLE & MARK READ LOGIC =================
  const markAllAsRead = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount === 0) return;

    // ✅ 3. UPDATED: Add unread IDs to shield and update state immediately
    notifications.forEach(n => {
      if (!n.read) readInSession.current.add(n.id);
    });

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    const empId = localStorage.getItem("empId");
    if (empId) {
      fetch(`http://localhost:8080/api/notifications/mark-read/${empId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }).catch((err) => console.error("Backend update failed", err));
    }
  };

  const toggleNotifications = () => {
    if (showNotifications) {
      markAllAsRead();
      setShowNotifications(false);
    } else {
      setShowNotifications(true);
    }
  };

  // ================= CLOSE ON OUTSIDE CLICK =================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        if (showNotifications) {
          setShowNotifications(false);
          markAllAsRead(); // ✅ Works when clicking outside
        }
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // ✅ 4. UPDATED: Added notifications to dependency array
  }, [showNotifications, notifications]); 

  // ================= NAVIGATION =================
  const handleCreateQuotation = (client = null) => {
    setPreviewData(null); 
    setSelectedClient(client);
    setActiveModule('create');
  };

  const handleProfile = () => {
    setActiveModule('profile');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard': return <EmployeeDashboard onCreateQuotation={() => setActiveModule('create')} />;
      case 'clients': return <MyClients onCreateQuotation={handleCreateQuotation} />;
      case 'create': return <CreateQuotation selectedClient={selectedClient} editData={previewData}  />;
      case 'quotations':
        return (
          <MyQuotations 
            onEdit={(quote) => {
              setSelectedClient(null); // optional
              setPreviewData(quote);   // reuse this state
              setActiveModule('create'); // 🔥 OPEN CREATE PAGE
            }}
          />
        );
      case 'preview':
  if (!previewData) {
    return <div className="p-6 text-center">Loading preview...</div>;
  }

  return (
    <QuotationPreview 
      formData={previewData} 
      onClose={() => setActiveModule('quotations')} 
    />
  );
      case 'invoice': return <Invoice />;
      case 'myinvoice': return <MyInvoice />;
      case 'profile': return <MyProfile />;
      case "allNotifications": return <AllNotifications notifications={notifications} setNotifications={setNotifications} />;
      default: return <EmployeeDashboard />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-50">
            <EmployeeSidebar 
  activeModule={activeModule} 
  setActiveModule={(module) => {
    if (module !== 'create') {
      setPreviewData(null);
    }
    setActiveModule(module);
    setSidebarOpen(false);
  }} 
/>
          </div>
        </div>
      )}

      <div className="hidden sm:block">
        <EmployeeSidebar 
          activeModule={activeModule} 
          setActiveModule={(module) => {
            if (module !== 'create') {
              setPreviewData(null);
            }
            setActiveModule(module);
            setSidebarOpen(false);
          }} 
        />
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 px-3 sm:px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="sm:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Quotation Management System</span>
                  <span className="sm:hidden">QMS</span>
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">Professional Business Solutions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* 🔔 BELL & NOTIFICATIONS */}
              <div className="relative" ref={bellRef}>
                <button
                  onClick={toggleNotifications}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2a7 7 0 00-7 7v4.586l-.707.707A1 1 0 005 17h14a1 1 0 00.707-1.707L19 13.586V9a7 7 0 00-7-7zm0 20a3 3 0 003-3H9a3 3 0 003 3z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 z-50">
                    <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-md"></div>
                    <div className="bg-white border rounded-2xl shadow-2xl overflow-hidden">
                      <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                        Notifications
                      </div>
                      <div className="max-h-80 overflow-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-sm text-gray-500 text-center">No notifications</div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 border-b border-gray-200 ${!n.read ? "bg-indigo-100" : "bg-white hover:bg-gray-50"}`}
                            >
                              <div className={`text-sm ${!n.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                                {n.message}
                              </div>
                              {n.timestamp && (
                                <div className="text-[11px] mt-1 text-gray-500">
                                  {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div
                        onClick={() => { 
                          // ✅ 5. UPDATED: Call markAllAsRead when clicking "View All"
                          markAllAsRead(); 
                          setActiveModule("allNotifications"); 
                          setShowNotifications(false); 
                        }}
                        className="px-4 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                      >
                        View All Notifications →
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 👤 EMPLOYEE PANEL DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 flex items-center justify-center rounded-full 
                             bg-gradient-to-r from-blue-500 to-purple-600
                            text-white shadow-lg hover:scale-105 transition-transform"
                            >
                  {/* User Icon */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"/>
                  </svg>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border z-50">
                    <button onClick={handleProfile} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"> Profile</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"> Logout</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeePanel;