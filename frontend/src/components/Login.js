import React, { useState } from 'react';
import AuthService from '../auth/AuthService';
import axios from 'axios'; // Make sure axios is imported
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Define the mergeCarts function here for clarity
  const mergeCarts = async (token) => {
    const guestCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalPrice: 0 };
    if (guestCart.items.length > 0) {
      try {
        // Adjust the URL as needed
        await axios.post('/api/cart/merge', guestCart, {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.removeItem('cart'); // Clear the guest cart after merging
      } catch (error) {
        console.error("Error merging carts:", error.response?.data || error);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await AuthService.login(email, password); // Implement login logic as per your AuthService
      await mergeCarts(user.token); // Ensure you get the token from your AuthService

      // After successful login and cart merge, navigate accordingly
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
