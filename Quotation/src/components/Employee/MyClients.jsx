import React, { useState, useEffect } from 'react';
import ClientInfoModal from './ClientInfoModal';

const MyClients = ({ onCreateQuotation }) => {
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',  
    organization: '',
    address: '',
    status: 'Active'
  });

  // ✅ Fetch ALL clients added by Admin
  useEffect(() => {
    fetch("http://localhost:8080/api/clients")
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(err => console.error(err));
  }, []);

  // ✅ Add client (Employee can also add)
  const handleAddClient = async () => {
    console.log("Sending to Backend:", newClient);
    const response = await fetch("http://localhost:8080/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient)
    });

    const savedClient = await response.json();
    setClients([...clients, savedClient]);

    setNewClient({
      name: '',
      email: '',
      phone: '',
      organization: '',
      address: '',
      status: 'Active'
    });

    setShowForm(false);
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search) ||
      client.phone?.toLowerCase().includes(search) ||
      client.organization?.toLowerCase().includes(search) ||
      client.clientId?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">My Clients</h2>
          <p className="text-gray-500 mt-1 text-sm">Total Clients: {clients.length}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm sm:text-base"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Add Client Form */}
      {showForm && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Add New Client</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Client Name"
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              className="border p-2 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              className="border p-2 rounded-lg"
            />
            <input
              type="tel"
              placeholder="Phone No"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              className="border p-2 rounded-lg"
            />
            {/* 2. ADDED ORGANIZATION INPUT FIELD */}
            <input
              type="text"
              placeholder="Organization Name (Optional)"
              value={newClient.organization}
              onChange={(e) => setNewClient({ ...newClient, organization: e.target.value })}
              className="border p-2 rounded-lg"
            />
            <textarea
              placeholder="Address"
              value={newClient.address}
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
              className="border p-2 rounded-lg md:col-span-2"
              rows="2"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddClient}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Clients List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white p-4 rounded-lg shadow-sm border relative">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                {client.clientId}
              </span>
              <button
                onClick={() => setSelectedClient(client)}
                title="View client information"
                className="text-xl text-gray-500 hover:text-blue-600 transition-colors font-bold leading-none bg-gray-100 hover:bg-blue-100 rounded-full w-7 h-7 flex items-center justify-center"
              >
                ℹ️
              </button>
            </div>
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-semibold">{client.name}</h3>
            </div>
            {/* CONDITIONAL RENDERING: ONLY SHOWS IF ORGANIZATION EXISTS */}
            {client.organization && (
              <p className="text-xs  text-black-600 mb-2  tracking-wide">
                Organization: {client.organization}
              </p>
            )}
            <p className="text-sm text-gray-600">Email: {client.email}</p>
            <p className="text-sm text-gray-600">Phone No: {client.phone}</p>

            <button
              onClick={() => onCreateQuotation?.(client)}
              className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
            >
              Create Quote
            </button>
          </div>
        ))}
      </div>

      {/* Client Info Modal */}
      {selectedClient && (
        <ClientInfoModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};

export default MyClients;
