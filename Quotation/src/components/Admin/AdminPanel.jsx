    import React, { useState, useEffect, useRef } from "react";
    import { useNavigate } from "react-router-dom";
    import Sidebar from "./Sidebar";
    import Dashboard from "./Dashboard";
    import QuotationManagement from "./QuotationManagement";
    import InvoiceGenerator from "./InvoiceGenerator";
    import ClientManagement from "./ClientManagement";
    import EmployeeManagement from "./EmployeeManagement";
    import Reports from "./Reports";
    import EditProfile from "./EditProfile";
    import AllNotifications from "./AllNotifications";

    const AdminPanel = () => {
      const [notifications, setNotifications] = useState([]);
      const [showNotifications, setShowNotifications] = useState(false);
      const [showAllNotifications, setShowAllNotifications] = useState(false);
      const [activeModule, setActiveModule] = useState("dashboard");
      const [sidebarOpen, setSidebarOpen] = useState(false);
      const [showDropdown, setShowDropdown] = useState(false);
      const [pendingQuotationsCount, setPendingQuotationsCount] = useState(0);

      const bellRef = useRef(null);
      const dropdownRef = useRef(null);
      const navigate = useNavigate();
      const readInSession = useRef(new Set());

      // ================= FETCH NOTIFICATIONS ================
  // Locate your existing useEffect for notifications and update it like this:
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // FORCE "ADMIN" here so the backend knows to fetch ALL quotations
        const triggerId = "ADMIN"; 

        // 1. Trigger backend for ALL reminders
        await fetch(`https://quotation-v1-y2m6.onrender.com/api/quotations/trigger-reminders/${triggerId}`);

        // 2. Fetch notifications for Admin
        const res = await fetch(`https://quotation-v1-y2m6.onrender.com/api/notifications/admin`);
        if (!res.ok) return;
        const incoming = await res.json();

        const formatted = incoming.map((n) => {
          // Normalize ID handling for MongoDB or SQL
          let actualId = n.id || (n._id && (typeof n._id === 'object' ? n._id.$oid : n._id));
          return {
            id: actualId,
            message: n.message,
            timestamp: n.timestamp,
            type: n.type,
            // Check both DB status and local session status
            read: n.read === true || n.isRead === true || readInSession.current.has(actualId)
          };
        });

        setNotifications(formatted);
      } catch (e) {
        console.error("Admin Notification fetch error", e);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s is healthy
    return () => clearInterval(interval);
  }, []);

      // ================= FETCH PENDING QUOTATIONS COUNT ================
      useEffect(() => {
        const fetchPendingCount = async () => {
          try {
            const res = await fetch("https://quotation-v1-y2m6.onrender.com/api/quotations");
            if (!res.ok) return;
            const quotations = await res.json();
            const pendingCount = quotations.filter(q => q.status === "Pending").length;
            setPendingQuotationsCount(pendingCount);
          } catch (e) {
            console.error("Error fetching pending quotations count", e);
          }
        };

        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 30000); // Refresh every 30s
        return () => clearInterval(interval);
      }, [activeModule]); // Refresh when switching modules

      // ================= TOGGLE NOTIFICATIONS =================
      const toggleNotifications = () => {
  if (showNotifications) {
    // If it's currently open and we are CLOSING it:
    markAllAsRead();
    setShowNotifications(false);
  } else {
    // Opening it
    setShowNotifications(true);
  }
};

// Helper function to handle the API call and local state update
const markAllAsRead = () => {
  if (unreadCount === 0) return; // Don't call API if nothing is unread

  // Add current unread IDs to the session shield
  notifications.forEach(n => {
    const id = n.id || n._id;
    if (id) readInSession.current.add(id);
  });

  // Update UI immediately
  setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  // Persist to database
  fetch("https://quotation-v1-y2m6.onrender.com/api/notifications/mark-read/ADMIN", {
    method: "POST",
  }).catch((err) => console.error("Failed to mark read", err));
};

      // ================= CLOSE ON OUTSIDE CLICK =================
     useEffect(() => {
  const handleClickOutside = (e) => {
    if (bellRef.current && !bellRef.current.contains(e.target)) {
      if (showNotifications) {
        markAllAsRead(); // ✅ This handles marking read when clicking outside
        setShowNotifications(false);
      }
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [showNotifications, notifications]); // 👈 Added notifications here

      // ================= NAVIGATION =================
      const handleProfile = () => {
        setActiveModule("profile");
        setShowDropdown(false);
      };

      const handleLogout = () => {
        localStorage.clear();
        navigate("/");
      };

      const renderContent = () => {
        switch (activeModule) {
          case "dashboard":
            return <Dashboard />;
          case "quotations":
            return <QuotationManagement />;
          case "invoices":
            return <InvoiceGenerator />;
          case "clients":
            return <ClientManagement />;
          case "employees":
            return <EmployeeManagement />;
          case "reports":
            return <Reports />;
          case "profile":
            return <EditProfile />;
          case "allNotifications":
          return <AllNotifications notifications={notifications} setNotifications={setNotifications} />;
          default:
            return <Dashboard />;
        }
      };

      const unreadNotifications = notifications.filter(n => !n.read);
      const unreadCount = unreadNotifications.length;

      return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
          <Sidebar
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            pendingQuotationsCount={pendingQuotationsCount}
          />

          <div className="flex-1 overflow-auto">
            <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 px-3 sm:px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden mr-3 p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>

                  <div>
                    <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      <span className="hidden sm:inline">Quotation Management System</span>
                      <span className="sm:hidden">QMS</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
                      Professional Business Solutions
                    </p>
                  </div>
                </div>

                {/* ================= RIGHT SIDE ================= */}
                <div className="flex items-center gap-3">
                  {/* 🔔 NOTIFICATION */}
                  {/* 🔔 BELL */}
                  <div className="relative" ref={bellRef}>
                    <button
                      onClick={toggleNotifications}
                      className="w-10 h-10 flex items-center justify-center rounded-full 
                                bg-gradient-to-r from-indigo-500 to-purple-600
                                text-white shadow-lg hover:scale-105 transition-transform"
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

                    {/* ===== DROPDOWN ===== */}
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 z-50">
                        <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 shadow-md"></div>

                        <div className="bg-white border rounded-2xl shadow-2xl overflow-hidden">
                          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold">
                            Notifications
                          </div>

                          <div className="max-h-80 overflow-auto no-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-6 text-sm text-gray-500 text-center">
                                No notifications
                              </div>
                            ) : (
                              notifications.slice(0, 8).map((n) => (
                                <div
                                key={n.id || n._id || Math.random()}
                                className={`px-4 py-3 border-b border-gray-200 ${
                                  !n.read ? "bg-indigo-100" : "bg-white hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`text-sm ${
                                    !n.read ? "font-semibold text-gray-900" : "text-gray-700"
                                  }`}
                                >
                                  {n.message}
                                </div>
                                {n.timestamp && (
                                  <div className="text-[11px] mt-1 text-gray-500">
                                    {new Date(n.timestamp).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                              </div>
                              ))
                            )}
                          </div>

                          {/* VIEW ALL */}
                          <div
                            onClick={() => {
                              markAllAsRead(); // 👈 Add this call here
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

                    {/* ===== FULL PANEL ===== */}
                    {showAllNotifications && (
                      <div className="fixed inset-0 z-[60] flex justify-end">
                        <div
                          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                          onClick={() => setShowAllNotifications(false)}
                        />

                        <div className="relative w-[420px] h-full bg-white shadow-2xl border-l flex flex-col animate-slideIn">
                          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
                            <div className="text-lg font-semibold">
                              All Notifications
                            </div>
                            <button
                              onClick={() => setShowAllNotifications(false)}
                              className="text-xl"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex-1 overflow-auto">
                            {notifications.map((n) => (
                              <div
                                key={n.id || n._id}
                                className={`px-6 py-4 border-b hover:bg-indigo-50 ${
                                  !n.read ? "bg-indigo-50/40" : ""
                                }`}
                              >
                                <div className="text-sm font-medium">
                                  {n.message}
                                </div>
                                {n.timestamp && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(n.timestamp).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 👤 ADMIN */}
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
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
                    </div>

                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border z-50">
                        <button
                          onClick={handleProfile}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                          Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* ================= MAIN ================= */}
            <main className="p-6">
              <div className="max-w-7xl mx-auto">{renderContent()}</div>
            </main>
          </div>
        </div>
      );
    };

    export default AdminPanel;