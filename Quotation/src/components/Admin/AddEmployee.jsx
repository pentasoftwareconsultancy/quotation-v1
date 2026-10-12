import React, { useState, useEffect } from 'react';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    joinDate: '',
    password: '',
    department: '',
    photo: ''
  });

  const [employees, setEmployees] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const generateEmpId = () => {
      const randomNum = Math.floor(Math.random() * 999) + 1;
      return `EMP${randomNum.toString().padStart(3, '0')}`;
    };

    setFormData(prev => ({
      ...prev,
      empId: generateEmpId(),
      joinDate: new Date().toISOString().split('T')[0]
    }));

    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEmployee = { ...formData, id: Date.now() };
    const updatedEmployees = [...employees, newEmployee];

    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    setEmployees(updatedEmployees);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);

    setFormData({
      name: '',
      email: '',
      phone: '',
      empId: `EMP${(Math.floor(Math.random() * 999) + 1).toString().padStart(3, '0')}`,
      joinDate: new Date().toISOString().split('T')[0],
      password: '',
      department: '',
      photo: ''
    });
  };

  const deleteEmployee = (id) => {
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    setEmployees(updatedEmployees);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="w-full max-w-4xl">
        
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          👤 Add Employee
        </h2>

        {/* SUCCESS */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Employee added successfully!
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PHOTO SECTION */}
            <div className="md:col-span-2 flex flex-col items-center gap-3">
              <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500 text-sm">Upload Photo</span>
                )}
              </div>

              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                Choose Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* INPUTS */}
            <div>
              <label className="block text-sm font-medium mb-1">Employee Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Employee ID</label>
              <input
                type="text"
                value={formData.empId}
                readOnly
                className="w-full p-3 border rounded-lg bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Join Date</label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>

            {/* BUTTON */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
              >
                ➕ Add Employee
              </button>
            </div>

          </form>
        </div>

        {/* EMPLOYEE LIST */}
        <h3 className="text-2xl font-bold mb-4">Employee List</h3>

        <div className="grid gap-4">
          {employees.map(emp => (
            <div key={emp.id} className="bg-white rounded-lg shadow p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden">
                {emp.photo ? (
                  <img src={emp.photo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">
                    {emp.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <p className="font-semibold">{emp.name}</p>
                <p className="text-sm text-gray-600">{emp.empId}</p>
              </div>

              <button
                onClick={() => deleteEmployee(emp.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AddEmployee;
