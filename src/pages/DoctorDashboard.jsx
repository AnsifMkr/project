import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
  const [uid, setUid] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [diabetesPrescription, setDiabetesPrescription] = useState('');
  const [generalPrescription, setGeneralPrescription] = useState('');
  const [error, setError] = useState('');
  const [doctorUsername, setDoctorUsername] = useState(''); // State for doctor's username

  const navigate = useNavigate();

  // Fetch logged-in doctor's data
  useEffect(() => {
    try {
      const loggedInDoctor = JSON.parse(localStorage.getItem('loggedInDoctor'));
      if (loggedInDoctor && loggedInDoctor.username) {
        setDoctorUsername(loggedInDoctor.username);
      } else {
        navigate('/login'); // Redirect to login if no doctor is logged in
      }
    } catch (err) {
      console.error('Error retrieving doctor data:', err);
      navigate('/login');
    }
  }, [navigate]);

  // Fetch patient details by UID
  const fetchPatientDetails = async () => {
    try {
      const patientResponse = await axios.get(`http://localhost:5000/user/${uid}`);
      const prescriptionResponse = await axios.get(`http://localhost:5000/prescriptions/${uid}`);
  
      setPatientData(patientResponse.data);
      setRecentPrescriptions(prescriptionResponse.data); // Update recentPrescriptions
      setError('');
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Patient not found. Please check the UID.');
      setPatientData(null);
      setRecentPrescriptions([]); // Clear recentPrescriptions if patient not found
    }
  };
  

  // Save prescription to the backend
  const savePrescription = async (type) => {
    try {
      if (!diabetesPrescription && !generalPrescription) {
        setError('Please fill in the prescription details before saving.');
        return;
      }
  
      const newPrescription = {
        uid,
        type,
        details: type === 'diabetes' ? diabetesPrescription : generalPrescription,
        doctor: doctorUsername,
      };
  
      await axios.post('http://localhost:5000/prescription', newPrescription);
  
      // Refresh recent prescriptions after adding a new one
      fetchPatientDetails();
  
      if (type === 'diabetes') setDiabetesPrescription('');
      if (type === 'general') setGeneralPrescription('');
      setError('');
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError('Failed to save prescription.');
    }
  };
  

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Doctor Dashboard - {doctorUsername}
        </h2>

        {/* UID Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="uid">
            Enter Patient UID
          </label>
          <input
            type="text"
            id="uid"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchPatientDetails}
            className="mt-4 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Fetch Details
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        {/* Patient Details */}
        {patientData && (
          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Patient Details</h3>
            <p><strong className="text-gray-500">UID:</strong> {patientData.uid}</p>
            <p><strong className="text-gray-500">Name:</strong> {patientData.username}</p>
            <p><strong className="text-gray-500">Age:</strong> {patientData.age}</p>
            <p><strong className="text-gray-500">Gender:</strong> {patientData.gender}</p>
            <p><strong className="text-gray-500">Phone:</strong> {patientData.phone}</p>
          </div>
        )}

        {/* Prescription Forms */}
        {patientData && (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">Add Prescription</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diabetes Prescription */}
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="diabetesPrescription">
                  Prescription (for Diabetes)
                </label>
                <textarea
                  id="diabetesPrescription"
                  value={diabetesPrescription}
                  onChange={(e) => setDiabetesPrescription(e.target.value)}
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button
                  onClick={() => savePrescription('diabetes')}
                  className="mt-4 px-6 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
                >
                  Save Diabetes Prescription
                </button>
              </div>

              {/* General Prescription */}
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="generalPrescription">
                  General Prescription
                </label>
                <textarea
                  id="generalPrescription"
                  value={generalPrescription}
                  onChange={(e) => setGeneralPrescription(e.target.value)}
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                <button
                  onClick={() => savePrescription('general')}
                  className="mt-4 px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 transition"
                >
                  Save General Prescription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
