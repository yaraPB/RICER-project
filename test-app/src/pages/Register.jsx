import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    address: '',
    phone: '', // corrected from phoneNumber to phone for input name match
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted successfully!", formData);
    // Add actual submit logic here
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[ur(`./assets/logo.png`)] p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg"
      >
        <div className="flex flex-col space-y-6">
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Set a password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="text"
            name="address"
            placeholder="What is your address?"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-3 rounded-md hover:bg-green-700 transition-colors text-lg"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
