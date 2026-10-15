import React, { useState } from "react";
import { Trash2, Trash, BellOff } from "lucide-react";
//commit
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
    if (!id || id === "undefined") {
      console.error("Cannot delete: ID is invalid", id);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/notifications/delete/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  // ================= DELETE ALL =================
  const deleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setIsDeletingAll(true);
    const empId = localStorage.getItem("empId") || "ADMIN";
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
          <h2 className="text-3xl font-bold text-gray-800">
            All Notifications
            <span className="ml-3 text-sm font-medium bg-gray-200 text-blue-600 px-2.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage system activity and recent alerts</p>
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

      {/* Main Card Container */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <BellOff className="text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No notifications available at the moment.</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={n.id || `notif-${i}`}>
              {/* Row - Same layout as Employee page */}
              <div className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-colors group">
                {/* Left Side: Message & Time */}
                <div className="flex flex-col">
                  <div className={`text-base font-semibold ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                    {n.message}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {n.timestamp ? new Date(n.timestamp).toLocaleString() : ""}
                  </div>
                </div>

                {/* Right Side: Badges & Delete Button */}
                <div className="flex items-center gap-4 ml-10 shrink-0">
                  {/* Type Badge */}
                  <span className={`px-3 py-1 text-xs rounded-full font-semibold uppercase tracking-wider ${getTypeStyle(n.type)}`}>
                    {n.type?.replace("QUOTATION_", "") || "INFO"}
                  </span>

                  {/* Delete Action - Only visible clearly on hover or for Admin */}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Notification"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>

              {/* Subtle separator - Matches Employee style */}
              {i !== notifications.length - 1 && (
                <div className="mx-8 h-px bg-gray-100"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllNotifications;