import React, { useState, useEffect } from 'react';


const EmployeeManagement = () => {
 const [isFocused, setIsFocused] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [currentView, setCurrentView] = useState('list');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    joinDate: '',
    password: '',
    status: 'Active',
    department: 'Sales',
    photo: ''

  });

  // ✅ FETCH FROM BACKEND (NO localStorage)
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/admin/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const generateEmpId = () => {
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `EMP${randomNum.toString().padStart(3, '0')}`;
  };

    const handleAddEmployee = () => {
    setSelectedEmployee(null);   // ✅ clear edit state
    setCurrentView('add');

    setFormData({
      name: '',
      email: '',
      phone: '',
      empId: generateEmpId(),
      joinDate: new Date().toISOString().split('T')[0],
      password: '',
      status: 'Active',
      department: 'Sales',
      photo: ''
    });
  };


const handleEditEmployee = (employee) => {
  setCurrentView('edit');
  setSelectedEmployee(employee);

  setFormData({
    name: employee.name ?? '',
    email: employee.email ?? '',
    phone: employee.phone ?? '',
    empId: employee.empId ?? '',
    joinDate: employee.joinDate ?? '',
    password: employee.password ?? '',
    status: employee.status ?? 'Active',
    department: employee.department ?? 'Sales', 
    photo: employee.photo ?? ''
  });
};



  const handleViewEmployee = async (employee) => {
    setCurrentView('view');
    setSelectedEmployee(employee);

    setHistoryLoading(true);
    setPasswordHistory([]);

    try {
      const response = await fetch(`http://localhost:8080/api/admin/employees/${employee.id}/password-history`);
      if (response.ok) {
        const data = await response.json();
        setPasswordHistory(Array.isArray(data) ? data : []);
      } else {
        setPasswordHistory([]);
      }
    } catch (error) {
      console.error('Failed to load password history:', error);
      setPasswordHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // ✅ ADD + UPDATE (POST / PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 Stop submission if password invalid
   if (!isPasswordValid) return;

  const isEdit = currentView === "edit";

    const url = isEdit
      ? `http://localhost:8080/api/admin/employees/${selectedEmployee.id}`
      : "http://localhost:8080/api/admin/employees";

    const method = isEdit ? "PUT" : "POST";

    // In edit mode, exclude password from the update (employees must use email-based password reset)
    const dataToSend = isEdit 
      ? { ...formData, password: selectedEmployee.password }
      : formData;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (isEdit) {
        setEmployees(employees.map(emp => emp.id === data.id ? data : emp));
      } else {
        setEmployees([...employees, data]);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setCurrentView("list");
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhoneChange = (e) => {
    // Allow only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      phone: value
    });
  };

  // ✅ DELETE FROM BACKEND
const deleteEmployee = async (id) => {
  try {
    await fetch(`http://localhost:8080/api/admin/employees/${id}`, {
      method: "DELETE"
    });

    setEmployees(prev => prev.filter(emp => emp.id !== id));
    setCurrentView("list");
    setShowDeleteModal(false);   // 👈 close modal
  } catch (err) {
    console.error("Delete failed", err);
  }
};



  const backToList = () => {
    setCurrentView('list');
    setSelectedEmployee(null);
  };

  const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setFormData(prev => ({
      ...prev,
      photo: reader.result // base64
    }));
  };
  reader.readAsDataURL(file);
};

// 🔐 Password Validation
const password = formData.password || "";

const passwordRules = {
  length: password.length >= 8,
  capital: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
};

const validCount = Object.values(passwordRules).filter(Boolean).length;
// In edit mode, skip password validation since password field is read-only
// In add mode, password must be valid
const isPasswordValid = currentView === 'edit' ? true : validCount === 4;



const getStrength = () => {
  if (validCount <= 1) return { text: "Weak", color: "bg-red-500", width: "25%" };
  if (validCount === 2 || validCount === 3)
    return { text: "Medium", color: "bg-yellow-500", width: "60%" };
  return { text: "Strong", color: "bg-green-500", width: "100%" };
};

const formatHistoryDate = (isoDate) => {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  // Add/Edit Form View
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              {currentView === 'add' ? '✨ Add Employee' : '✏️ Edit Employee'}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">Fill in the details below</p>
          </div>
          <button
            onClick={backToList}
            className="bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          {showSuccess && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-500 text-white rounded-lg text-xs sm:text-sm">
              🎉 Employee {currentView === 'add' ? 'added' : 'updated'} successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 overflow-visible">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">👤 Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                placeholder="Enter full name"
                required
              />   
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">📧 Email</label>
              <input
                type="email"
                name="email"
                autoComplete="new-email"
                value={formData.email}
                onChange=  {handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                placeholder="employee@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">📱 Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                placeholder="Enter numbers only"
                required
              />
            </div>

             <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">🏢 Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                required
              >
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="HR">Human Resources</option>
                <option value="IT">Information Technology</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">🆔 Employee ID</label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-xs sm:text-sm"
                readOnly
              />
            </div>

          
          <div className="relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              🔐 Password
            </label>

            <input
              type="password"
              name="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={currentView === 'edit' ? undefined : handleChange}
              onFocus={() => currentView !== 'edit' && setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              readOnly={currentView === 'edit'}
              className={`w-full p-2 rounded-lg text-xs sm:text-sm border transition-all duration-300 ${
                currentView === 'edit' 
                  ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                  : (isFocused && isPasswordValid
                    ? "border-green-500 bg-green-50 focus:ring-2 focus:ring-green-500"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-500")
              }`}
              placeholder={currentView === 'edit' ? "Password is secured" : "Enter strong password"}
              required
            />

            {currentView === 'edit' && (
              <p className="text-xs text-gray-500 mt-1.5">Passwords cannot be edited here. Employees must securely reset their password using the email-based password reset system.</p>
            )}

            {isFocused && formData.password.length > 0 && !isPasswordValid && currentView !== 'edit' && (
              <div
                className="absolute left-0 top-full mt-2 w-full z-20 
                          bg-red-50 border border-red-300 text-red-600 
                          text-xs px-3 py-2 rounded-lg shadow-lg animate-slideFade 
                          flex items-start gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86l-7.2 12.48A1 1 0 004 18h16a1 1 0 00.91-1.66l-7.2-12.48a1 1 0 00-1.72 0z"
                  />
                </svg>

                <span>
                  Password must be at least 8 characters and include an uppercase letter, number and special character.
                </span>
              </div>
            )}

          </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">📅 Join Date</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                required
              />
            </div>
            


            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">✅ Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
             
             <div className="col-span-1 sm:col-span-2 flex items-center justify-between gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
  
            {/* Photo Preview */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-blue-400 overflow-hidden flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Employee"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-blue-600 font-bold text-sm">IMG</span>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-500">PNG / JPG up to 2MB</p>
              </div>
            </div>

            {/* Upload Button */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <span className="bg-green-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-medium">
                Upload
              </span>
            </label>

          </div>

            <div className="col-span-1 sm:col-span-2 pt-3 sm:pt-4">
             <button
                type="submit"
                disabled={!isPasswordValid}
                className={`w-full py-2.5 rounded-md text-sm font-medium transition-all duration-200
                  ${isPasswordValid
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
              >
                {currentView === 'add' ? 'Add Employee' : 'Update Employee'}
              </button>


            </div>
          </form>
        </div>
      </div>
    );
  }

  // View Employee Details
  if (currentView === 'view') {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">👤 Employee Profile</h2>
            <p className="text-gray-600 text-xs sm:text-sm">Detailed information</p>
          </div>
          <button
            onClick={backToList}
            className="bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm"
          >
            ← Back
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-100">
                <label className="text-xs font-semibold text-gray-600 uppercase">Full Name</label>
                <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1">{selectedEmployee.name}</p>
              </div>
              
              <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-100">
                <label className="text-xs font-semibold text-gray-600 uppercase">Employee ID</label>
                <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1">{selectedEmployee.empId}</p>
              </div>
              
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-100">
                <label className="text-xs font-semibold text-gray-600 uppercase">Join Date</label>
                <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1">{selectedEmployee.joinDate}</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-orange-50 p-2 sm:p-3 rounded-lg border border-orange-100">
                <label className="text-xs font-semibold text-gray-600 uppercase">Email Address</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1 break-all">{selectedEmployee.email}</p>
              </div>
              
              <div className="bg-teal-50 p-2 sm:p-3 rounded-lg border border-teal-100">
                <label className="text-xs font-semibold text-gray-600 uppercase">Phone Number</label>
                <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">{selectedEmployee.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg border border-gray-200 bg-slate-50">
            <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2"> Password Change History</h3>

            {historyLoading ? (
              <p className="text-xs sm:text-sm text-gray-500">Loading password history...</p>
            ) : passwordHistory.length === 0 ? (
              <p className="text-xs sm:text-sm text-gray-500">No password reset history available for this employee.</p>
            ) : (
              <div className="space-y-2">
                {passwordHistory.map((entry, index) => (
                  <div key={`${entry.changedAt}-${index}`} className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm font-semibold text-gray-800">Changed: {formatHistoryDate(entry.changedAt)}</p>
                    <p className="text-xs text-gray-500 mt-1">Requested: {formatHistoryDate(entry.requestedAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              onClick={() => handleEditEmployee(selectedEmployee)}
              className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm"
            >
               Edit Employee
            </button>
            <button
              onClick={() => deleteEmployee(selectedEmployee.id)}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm"
            >
               Delete Employee
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Employee List View
  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800"> Employee Management</h2>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={ handleAddEmployee}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {employees.filter(emp => 
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empId?.toLowerCase().includes(searchTerm.toLowerCase())
      ).length === 0 ? (
        <div className="text-center py-8 sm:py-12 bg-white rounded-lg">
          <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">👥</div>
          <h3 className="text-base sm:text-lg font-bold text-gray-600 mb-2">No Employees Found</h3>
          <p className="text-gray-500 mb-3 sm:mb-4 text-sm">{searchTerm ? 'Try adjusting your search' : 'Start building your team'}</p>
          {!searchTerm && (
            <button
              onClick={handleAddEmployee}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium text-sm"
            >
              + Add First Employee
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {employees.filter(emp => 
            emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.empId?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((employee, index) => (
            <div key={employee.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                      {employee.photo ? (
                      <img
                        src={employee.photo}
                        alt={employee.name}
                        className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-white font-bold text-xs sm:text-sm md:text-lg bg-blue-500 w-full h-full flex items-center justify-center">
      {employee.name?.charAt(0).toUpperCase()}
    </span>
  )}
</div>

                <div className="ml-3 flex-1 min-w-0">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base md:text-lg truncate">{employee.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{employee.empId}</p>
                </div>
              </div>
              
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                <div className="flex items-center text-gray-600">
                  
                  <span className="ml-2 truncate flex-1">{employee.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  
                  <span className="ml-2">{employee.phone}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewEmployee(employee)}
                  className="flex-1 bg-green-500 text-white py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-green-600"
                >
                   View
                </button>
                <button
                  onClick={() => handleEditEmployee(employee)}
                  className="flex-1 bg-blue-500 text-white py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {setSelectedEmployee(employee); setShowDeleteModal(true); }}
                  className="flex-1 bg-red-500 text-white py-2 px-2 sm:px-3 rounded text-xs sm:text-sm font-medium hover:bg-red-600"
                >
                   Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[350px] p-5 animate-in fade-in zoom-in">

            <h3 className="text-lg font-bold text-gray-800 mb-3">
              Delete Employee
            </h3>

            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedEmployee.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => deleteEmployee(selectedEmployee.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Delete
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
};

export default EmployeeManagement;