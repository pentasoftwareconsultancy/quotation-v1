import React, { useState } from 'react';

const UserManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [users] = useState([
    { id: 1, name: 'John Admin', email: 'john@company.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Manager', email: 'jane@company.com', role: 'Manager', status: 'Active' },
    { id: 3, name: 'Bob User', email: 'bob@company.com', role: 'User', status: 'Inactive' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          User Management
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
        >
          + Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Add New User</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Full Name" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <select className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option>Select Role</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>User</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium">
              Save
            </button>
            <button 
              onClick={() => setShowForm(false)}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 text-lg">{user.name}</h3>
                <p className="text-gray-600 text-sm break-all">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:shadow-md transition-all duration-300 font-medium">
                Edit
              </button>
              <button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-3 rounded-lg text-sm hover:shadow-md transition-all duration-300 font-medium">
                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
              </button>
              <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-3 rounded-lg text-sm hover:shadow-md transition-all duration-300 font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold">{user.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                        Edit
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-800 font-medium transition-colors duration-200">
                        {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="text-red-600 hover:text-red-800 font-medium transition-colors duration-200">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;