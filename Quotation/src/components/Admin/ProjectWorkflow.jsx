import React, { useState } from 'react';

const ProjectWorkflow = () => {
  const [projects, setProjects] = useState([
    {
      id: 'PRJ-001',
      client: 'ABC Corp',
      quotationId: 'Q-2024-001',
      totalAmount: 15000,
      currentStage: 'In Progress',
      workProgress: 60,
      payments: [
        { type: 'Advance', amount: 5000, date: '2024-01-15', invoiceId: 'INV-001' },
        { type: 'Progress Payment', amount: 4000, date: '2024-02-01', invoiceId: 'INV-002' }
      ],
      totalPaid: 9000,
      nextPaymentDue: 3000,
      stages: [
        { name: 'Client Created', status: 'completed', date: '2024-01-10' },
        { name: 'Quotation Created', status: 'completed', date: '2024-01-12' },
        { name: 'Quotation Approved', status: 'completed', date: '2024-01-14' },
        { name: 'Advance Payment', status: 'completed', date: '2024-01-15' },
        { name: 'Work Started', status: 'completed', date: '2024-01-16' },
        { name: 'Progress Payment (50%)', status: 'completed', date: '2024-02-01' },
        { name: 'Final Payment', status: 'pending', date: null },
        { name: 'Project Completed', status: 'pending', date: null }
      ]
    },
    {
      id: 'PRJ-002',
      client: 'XYZ Ltd',
      quotationId: 'Q-2024-002',
      totalAmount: 8500,
      currentStage: 'Completed',
      workProgress: 100,
      payments: [
        { type: 'Advance', amount: 3000, date: '2024-01-05', invoiceId: 'INV-003' },
        { type: 'Progress Payment', amount: 3000, date: '2024-01-20', invoiceId: 'INV-004' },
        { type: 'Final Payment', amount: 2500, date: '2024-02-05', invoiceId: 'INV-005' }
      ],
      totalPaid: 8500,
      nextPaymentDue: 0,
      stages: [
        { name: 'Client Created', status: 'completed', date: '2024-01-01' },
        { name: 'Quotation Created', status: 'completed', date: '2024-01-02' },
        { name: 'Quotation Approved', status: 'completed', date: '2024-01-04' },
        { name: 'Advance Payment', status: 'completed', date: '2024-01-05' },
        { name: 'Work Started', status: 'completed', date: '2024-01-06' },
        { name: 'Progress Payment (70%)', status: 'completed', date: '2024-01-20' },
        { name: 'Final Payment', status: 'completed', date: '2024-02-05' },
        { name: 'Project Completed', status: 'completed', date: '2024-02-06' }
      ]
    }
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);

  const handleViewWorkflow = (project) => {
    setSelectedProject(project);
    setShowWorkflowModal(true);
  };

  const getStageIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'current': return '🔄';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getStageColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'current': return 'text-blue-600 bg-blue-50';
      case 'pending': return 'text-gray-400 bg-gray-50';
      default: return 'text-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Project Workflow Management
        </h2>
      </div>

      {/* Workflow Overview */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-bold mb-4">Standard Project Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">👤</div>
            <h4 className="font-semibold">1. Client Creation</h4>
            <p className="text-sm text-gray-600">Register new client details</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-semibold">2. Quotation</h4>
            <p className="text-sm text-gray-600">Create & get approval</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <h4 className="font-semibold">3. Payment & Work</h4>
            <p className="text-sm text-gray-600">Advance → Progress → Final</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">🧾</div>
            <h4 className="font-semibold">4. Invoice Generation</h4>
            <p className="text-sm text-gray-600">Auto-generate invoices</p>
          </div>
        </div>
      </div>

      {/* Active Projects */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-bold">Active Projects</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{project.client}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${project.workProgress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{project.workProgress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <div className="font-semibold">${project.totalPaid.toLocaleString()} / ${project.totalAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">
                        {project.nextPaymentDue > 0 ? `$${project.nextPaymentDue.toLocaleString()} due` : 'Fully paid'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      project.currentStage === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.currentStage === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.currentStage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button 
                      onClick={() => handleViewWorkflow(project)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Workflow
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Detail Modal */}
      {showWorkflowModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Project Workflow - {selectedProject.client}</h3>
              <button 
                onClick={() => setShowWorkflowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Workflow Stages */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Project Stages</h4>
                  <div className="space-y-3">
                    {selectedProject.stages.map((stage, index) => (
                      <div key={index} className={`flex items-center p-3 rounded-lg ${getStageColor(stage.status)}`}>
                        <span className="text-xl mr-3">{getStageIcon(stage.status)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{stage.name}</div>
                          {stage.date && <div className="text-xs text-gray-500">{stage.date}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Payment History</h4>
                  <div className="space-y-3">
                    {selectedProject.payments.map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{payment.type}</div>
                          <div className="text-sm text-gray-500">{payment.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">${payment.amount.toLocaleString()}</div>
                          <div className="text-xs text-blue-600">{payment.invoiceId}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Project Summary */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-semibold mb-2">Project Summary</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">${selectedProject.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Paid:</span>
                        <span className="font-medium text-green-600">${selectedProject.totalPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span className="font-medium text-red-600">${(selectedProject.totalAmount - selectedProject.totalPaid).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Work Progress:</span>
                        <span className="font-medium">{selectedProject.workProgress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectWorkflow;