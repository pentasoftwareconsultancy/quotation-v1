import React, { useState } from 'react';

const ProductManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [products] = useState([
    { id: 1, name: 'Web Development', category: 'Service', price: 5000, unit: 'Project' },
    { id: 2, name: 'Mobile App Development', category: 'Service', price: 8000, unit: 'Project' },
    { id: 3, name: 'UI/UX Design', category: 'Service', price: 2500, unit: 'Project' },
    { id: 4, name: 'Hosting Service', category: 'Product', price: 100, unit: 'Monthly' }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Product Management
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
        >
          + Add Product/Service
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Add New Product/Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Product/Service Name" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <select className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option>Select Category</option>
              <option>Product</option>
              <option>Service</option>
            </select>
            <input 
              type="number" 
              placeholder="Price" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <input 
              type="text" 
              placeholder="Unit (e.g., Project, Monthly)" 
              className="border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
            />
            <textarea 
              placeholder="Description" 
              className="border border-gray-300 p-3 rounded-xl sm:col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              rows="3"
            ></textarea>
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
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
              <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                product.category === 'Service' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {product.category}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Price:</span> ${product.price.toLocaleString()}
              </p>
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Unit:</span> {product.unit}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:shadow-md transition-all duration-300 font-medium">
                Edit
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      product.category === 'Service' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">${product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{product.unit}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                        Edit
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

export default ProductManagement;