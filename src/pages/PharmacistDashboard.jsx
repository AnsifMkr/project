import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');

  // Fetch prescriptions from the backend
  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pharmacist/prescriptions');
      setPrescriptions(response.data);
    } catch (err) {
      setError('Failed to fetch prescriptions');
      console.error(err);
    }
  };

  // Mark prescription as fulfilled
  const markAsFulfilled = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/pharmacist/prescription/${id}`, { fulfilled: true });
      fetchPrescriptions(); // Refresh the list after marking fulfilled
    } catch (err) {
      setError('Failed to mark prescription as fulfilled');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Pharmacist Dashboard</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Recent Prescriptions</h3>
          {prescriptions.length > 0 ? (
            <ul className="space-y-4">
              {prescriptions.map((prescription) => (
                <li key={prescription._id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                  <p><strong className="text-gray-600">Patient UID:</strong> {prescription.uid}</p>
                  <p><strong className="text-gray-600">Medication:</strong> {prescription.details}</p>
                  <p><strong className="text-gray-600">Doctor:</strong> {prescription.doctor}</p>
                  <p><strong className="text-gray-600">Date:</strong> {new Date(prescription.date).toLocaleDateString()}</p>
                  <p><strong className="text-gray-600">Fulfilled:</strong> {prescription.fulfilled ? 'Yes' : 'No'}</p>
                  {!prescription.fulfilled && (
                    <button
                      onClick={() => markAsFulfilled(prescription._id)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Mark as Fulfilled
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No prescriptions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
