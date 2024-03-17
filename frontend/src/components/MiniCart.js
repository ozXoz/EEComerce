import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../auth/AuthService';

function MiniCart({ cart }) {
  const navigate = useNavigate();

  const handleProceed = () => {
    if (AuthService.getCurrentUser()) {
      navigate('/cart'); // Update to navigate to cart instead of payment
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };

  return (
    <div className="mini-cart">
      <h4>Your Cart</h4>
      <p>Items: {cart.items.length}</p>
      <p>Total: ${cart.totalPrice.toFixed(2)}</p>
      <button onClick={handleProceed}>Proceed</button>
    </div>
  );
}

export default MiniCart;
