import React, { useState, useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    address: '',
    phone: '',
  });

  const [product, setProduct] = useState(null); // State to store product data

  useEffect(() => {
    fetch('https://fakestoreapi.com/products/1')
      .then(response => response.json())
      .then(data => setProduct(data))
      .catch(error => console.error('Error fetching product:', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Form submitted successfully!");
    console.log(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      {/* Product Display */}
      {product && (
        <div className="bg-red-300 shadow-md rounded-lg p-4 mb-6 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-2">{product.title}</h2>
          <img src={product.image} alt={product.title} className="w-32 h-32 object-contain mx-auto mb-2" />
          <p className="text-gray-700 mb-1">{product.description}</p>
          <p className="text-green-600 font-bold text-lg">${product.price}</p>
        </div>
      )}

      {/* Form */}
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
