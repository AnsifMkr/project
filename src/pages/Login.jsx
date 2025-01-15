import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { role } = useParams(); // Get the role from the URL (patient, doctor, pharmacist)
  const navigate = useNavigate(); // Hook for redirection after successful login

  const [loginIdentifier, setLoginIdentifier] = useState(''); // For username or UID
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve registered users from localStorage (replace with actual API if needed)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};

    // Check if the login identifier (username or UID) matches any registered user for the specific role
    const user = Object.values(registeredUsers).find((user) => 
      (user.username === loginIdentifier || user.uid === loginIdentifier) && user.role === role
    );

    if (user && user.password === password) {
      // Login successful
      console.log('Login successful');
      setError(''); // Clear any previous error
      navigate(`/dashboard/${role}`);
    } else {
      // Show error message if login fails
      setError('Invalid username, UID, or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-green-100">
      <div className="bg-white p-10 rounded-lg shadow-xl max-w-lg w-full text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-10">Login as {role}</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username or UID"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          New user?{' '}
          <Link to={`/register/${role}`} className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;