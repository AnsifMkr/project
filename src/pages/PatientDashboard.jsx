import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch patient details and prescriptions from the backend
  const fetchPatientDetails = async () => {
    try {
      const loggedInPatientUID = 'PatientUID'; // Replace with logic to get the logged-in patient's UID
      const patientResponse = await axios.get(`http://localhost:5000/user/${loggedInPatientUID}`);
      const prescriptionResponse = await axios.get(`http://localhost:5000/prescriptions/${loggedInPatientUID}`);

      setPatientData(patientResponse.data);
      setPrescriptions(prescriptionResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch patient details or prescriptions.');
      navigate('/register/patient');
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Patient Dashboard</h2>

        {error && <p className="text-red-500">{error}</p>}

        {/* Personal Details Section */}
        {patientData ? (
          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Personal Details</h3>
            <div className="space-y-2">
              <p><strong className="text-gray-500">UID:</strong> {patientData.uid}</p>
              <p><strong className="text-gray-500">Username:</strong> {patientData.username}</p>
              <p><strong className="text-gray-500">Age:</strong> {patientData.age}</p>
              <p><strong className="text-gray-500">Gender:</strong> {patientData.gender}</p>
              <p><strong className="text-gray-500">Address:</strong> {patientData.address}</p>
              <p><strong className="text-gray-500">Phone:</strong> {patientData.phone}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">No personal details available. Please register first.</p>
        )}

        {/* Prescriptions Section */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Recent Prescriptions</h3>
          {prescriptions.length > 0 ? (
            <ul className="space-y-4">
              {prescriptions.map((prescription, index) => (
                <li key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
                  <p><strong className="text-gray-600">Doctor:</strong> {prescription.doctor}</p>
                  <p><strong className="text-gray-600">Medication:</strong> {prescription.details}</p>
                  <p><strong className="text-gray-600">Date:</strong> {new Date(prescription.date).toLocaleDateString()}</p>
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

export default PatientDashboard;
