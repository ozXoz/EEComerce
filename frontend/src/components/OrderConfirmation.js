import React from 'react';
import { useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
  const location = useLocation();
  const { orderId } = location.state || {};

  return (
    <div>
      <h1>Order Confirmation</h1>
      {orderId ? (
        <p>Your order has been placed successfully. Your order ID is: {orderId}</p>
      ) : (
        <p>Order information is missing.</p>
      )}
    </div>
  );
};

export default OrderConfirmation;
