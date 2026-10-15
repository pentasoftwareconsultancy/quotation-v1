import React, { useState } from "react";
import { Trash2, Trash, BellOff } from "lucide-react"; // Optional: npm install lucide-react

const AllNotifications = ({ notifications, setNotifications }) => {
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  

  const getTypeStyle = (type) => {
    switch (type) {
      case "APPROVAL": return "bg-green-100 text-green-700";
      case "REJECTION": return "bg-red-100 text-red-700";
      case "EXPIRED": return "bg-gray-200 text-gray-700 border border-gray-400"; 
      case "DAILY_REMINDER": return "bg-yellow-100 text-yellow-700 border border-yellow-300"; 
      case "CREATION": return "bg-blue-100 text-blue-700";
      case "SENT": return "bg-purple-100 text-purple-700";
      case "INVOICE": return "bg-orange-100 text-orange-700"; // Add this line
      default: return "bg-indigo-100 text-indigo-700";
    }
  };

  

// ================= DELETE SINGLE =================

const deleteNotification = async (id) => {
  if (!id) return;

  try {
    // 1. Log the ID to your console to see if it's a string or an object
    console.log("Attempting to delete ID:", id); 

    const res = await fetch(`http://localhost:8080/api/notifications/delete/${id}`, {
      method: "DELETE",
    });
    
    if (res.ok) {
      // 2. Update local state so it disappears from UI immediately
      setNotifications(prev => prev.filter(n => n.id !== id));
    } else {
      console.error("Server refused deletion", res.status);
    }
  } catch (e) {
    console.error("Network error during delete", e);
  }
};

  // ================= DELETE ALL =================
  const deleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    
    setIsDeletingAll(true);
    const empId = localStorage.getItem("empId");
    
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/delete-all/${empId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (e) {
      console.error("Delete all failed", e);
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="w-full max-w-8xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
           All  Notifications
            <span className="text-sm font-medium bg-gray-200 text-blue-600 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage your recent activity and alerts</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={deleteAllNotifications}
            disabled={isDeletingAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition-all font-semibold text-sm disabled:opacity-50"
          >
            <Trash2 size={16} />
            {isDeletingAll ? "Clearing..." : "Clear All"}
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <BellOff className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No notifications available at the moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n, i) => (
              <div 
                key={n.id || `notif-${i}`}
                className={`group flex items-center justify-between px-6 py-5 hover:bg-blue-50/30 transition-colors ${!n.read ? 'bg-indigo-50/20' : ''}`}
              >
                {/* Left: Message Info */}
                <div className="flex flex-col pr-4">
                  <div className={`text-sm sm:text-base ${!n.read ? 'font-bold text-black-980' : 'text-gray-900'}`}>
                    {n.message}
                  </div>
                  <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-2">
                    {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`hidden sm:inline-block px-3 py-1  text-[11px] uppercase tracking-wider rounded-full  font-bold ${getTypeStyle(n.type)}`}>
                    {n.type || "INFO"}
                  </span>


               <button
                  onClick={() => {
                    // We trust AdminPanel gave us a clean n.id
                    if (!n.id) {
                      console.error("Critical: No ID found on object", n);
                      return;
                    }
                    deleteNotification(n.id);
                  }}
                  className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                  <Trash size={18} />
                </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllNotifications;