import React, { useEffect, useState } from "react";

const EmployeeQuotationList = () => {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      const empId = localStorage.getItem("empId");

      const res = await fetch(
        `http://localhost:8080/api/quotations/employee/${empId}`
      );

      const data = await res.json();
      setQuotations(data);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">My Quotations</h2>

      <table className="border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th>Quotation No</th>
            <th>Client</th>
            <th>Project</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map(q => (
            <tr key={q.id}>
              <td>{q.quotationNumber}</td>
              <td>{q.client}</td>
              <td>{q.project}</td>
              <td>₹ {q.totalCost}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeQuotationList;
