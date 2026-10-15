import React, { useState, useEffect } from 'react';
// ✅ 1. Import Lucide icons
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  History 
} from 'lucide-react';

const EmployeeDashboard = ({ onCreateQuotation }) => {
  const [stats, setStats] = useState([]);
  const [recentQuotations, setRecentQuotations] = useState([]);
  const currentEmpId = localStorage.getItem("empId") || "EMP-001";

  const parseObjectIdTime = (id) => {
    if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id)) {
      return NaN;
    }

    return parseInt(id.slice(0, 8), 16) * 1000;
  };

  const parseDateValue = (dateValue) => {
    if (!dateValue || typeof dateValue !== 'string') {
      return NaN;
    }

    const normalized = dateValue.trim();
    const direct = new Date(normalized).getTime();
    if (!Number.isNaN(direct)) {
      return direct;
    }

    const parts = normalized.split(/[/-]/);
    if (parts.length === 3) {
      const [dayPart, monthPart, yearPart] = parts;
      const day = Number(dayPart);
      const month = Number(monthPart);
      const year = Number(yearPart);
      if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
        return new Date(year, month - 1, day).getTime();
      }
    }

    return NaN;
  };

  const parseQuotationTimestamp = (quote) => {
    const objectIdTime = parseObjectIdTime(quote.id);
    if (!Number.isNaN(objectIdTime)) {
      return objectIdTime;
    }

    const rawDate = quote.createdAt || quote.updatedAt || quote.date;
    const parsedDate = parseDateValue(rawDate);
    if (!Number.isNaN(parsedDate)) {
      return parsedDate;
    }

    const quotationNumberValue = Number((quote.quotationNumber || '').replace(/\D/g, ''));
    if (!Number.isNaN(quotationNumberValue)) {
      return quotationNumberValue;
    }

    return 0;
  };

  useEffect(() => {
    const loadEmployeeDashboard = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/quotations/employee/id/${currentEmpId}`);
        const quotations = await res.json();

        const clientRes = await fetch("http://localhost:8080/api/clients");
        let clients = [];
        if (clientRes.ok) {
          clients = await clientRes.json();
        }
        const totalClients = clients.length;

        const pending = quotations.filter(
          q => (q.status || "").toLowerCase() === "pending"
        ).length;

        const approvedThisMonth = quotations.filter(q => {
          if ((q.status || "").toLowerCase() !== "approved" || !q.date) return false;
          const parts = q.date.includes("/") ? q.date.split("/") : q.date.split("-");
          if (parts.length !== 3) return false;
          const [day, month, year] = parts;
          const d = new Date(`${year}-${month}-${day}`);
          const now = new Date();
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        }).length;

        const latestThree = [...quotations]
          .sort((a, b) => parseQuotationTimestamp(b) - parseQuotationTimestamp(a))
          .slice(0, 3);
        setRecentQuotations(latestThree);

        // ✅ 2. Update stats using component names (No quotes around the icons)
        setStats([
          { title: 'My Quotations', value: quotations.length.toString(), color: 'from-blue-500 to-blue-600', icon: FileText, change: '' },
          { title: 'Pending Approval', value: pending.toString(), color: 'from-yellow-500 to-orange-500', icon: Clock, change: '' },
          { title: 'Approved This Month', value: approvedThisMonth.toString(), color: 'from-green-500 to-emerald-500', icon: CheckCircle2, change: '' },
          { title: 'My Clients', value: totalClients.toString(), color: 'from-purple-500 to-pink-500', icon: Users, change: '' }
        ]);

      } catch (err) {
        console.error("Employee dashboard error:", err);
      }
    };

    loadEmployeeDashboard();
  }, [currentEmpId]);

  return (
    <div className="space-y-6 sm:space-y-8 mt-1 sm:mt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Welcome back! Here's what's happening with your work today.</p>
        </div>
        <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 self-start sm:self-auto">
          <span className="font-semibold text-sm sm:text-base">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          // ✅ 3. Assign icon to a Capitalized variable to render as a component
          const IconComponent = stat.icon;
          return (
            <div key={index} className="group relative">
              <div className="absolute inset-0 bg-linear-to-r from-white to-gray-50 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"></div>
              <div className="relative bg-white p-4 sm:p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-linear-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg text-white`}>
                    {/* ✅ 4. Render icon component */}
                    <IconComponent size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-linear-to-r from-blue-500 to-purple-600 p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
            {/* ✅ Updated Recent Quotations header icon */}
            <History className="mr-2" size={24} />
            Recent Quotations
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">Latest quotation activities</p>
        </div>
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {recentQuotations.map((quote) => (
            <div
              key={quote.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 gap-2 sm:gap-0"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    quote.status === "Approved"
                      ? "bg-green-400"
                      : quote.status === "Pending"
                      ? "bg-yellow-400"
                      : quote.status === "Rejected"
                      ? "bg-red-400"
                      : "bg-gray-400"
                  }`}
                ></div>

                <div>
                  <p className="font-semibold text-gray-800 text-sm sm:text-base">
                    {quote.quotationNumber}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {quote.client}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                <p className="font-bold text-gray-800 text-sm sm:text-base">
                  ₹{quote.totalCost?.toLocaleString()}
                </p>
                <span
                  className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
                    quote.status === "Approved"
                      ? "bg-green-100 text-green-700"
                      : quote.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {quote.status || "Draft"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;   