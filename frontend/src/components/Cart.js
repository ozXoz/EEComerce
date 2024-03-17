import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const navigate = useNavigate();
  const [lastToken, setLastToken] = useState(() => {
    // Initialize lastToken with the current token at component mount
    const user = AuthService.getCurrentUser();
    return user ? user.token : null;
  });
  const checkStockAvailability = () => {
    return cart.items.every(item => item.quantity <= item.productId.productQuantity);
  };
  const stockUnavailable = !checkStockAvailability();

  // Define fetchCart outside of useEffect so it's accessible everywhere in this component
  const fetchCart = async (token) => {
    if (!token) {
      setCart({ items: [], totalPrice: 0 }); // Clear cart if not logged in
      return;
    }
    try {
      const response = await axios.get("http://localhost:3000/api/cart/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error.response?.data || error);
    }
  };

  // Define mergeCarts function
  const mergeCarts = async () => {
    const user = AuthService.getCurrentUser();
    if (user && localStorage.getItem("cart")) {
      try {
        const guestCart = JSON.parse(localStorage.getItem("cart"));
        await axios.post(
          "http://localhost:3000/api/cart/merge",
          { guestCart },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        localStorage.removeItem("cart"); // Clear the guest cart after merging
        // Optionally, re-fetch the merged cart to update the state
        fetchCart(user.token);
      } catch (error) {
        console.error("Error merging carts:", error);
        // Handle error (e.g., display a message to the user)
      }
    }
  };

  useEffect(() => {
    fetchCart(lastToken); // Initial fetch with the current or last known token

    // Set up an interval to check for token changes
    const intervalId = setInterval(() => {
      const currentUser = AuthService.getCurrentUser();
      const currentToken = currentUser ? currentUser.token : null;
      if (currentToken !== lastToken) {
        setLastToken(currentToken); // Update lastToken with the new token
        fetchCart(currentToken); // Re-fetch the cart with the new token
      }
    }, 1000); // Check every 1 second

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [lastToken]); // Correctly closed useEffect hook

  const updateQuantity = async (productId, newQuantity) => {
    try {
      const { token } = AuthService.getCurrentUser();
      // Find the existing quantity in the cart for comparison
      const existingItem = cart.items.find(item => item.productId._id === productId);
      const oldQuantity = existingItem ? existingItem.quantity : 0;
      const quantityChange = newQuantity - oldQuantity;
  
      // First, update the cart item quantity
      await axios.put(
        `http://localhost:3000/api/cart/item/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Then, adjust the inventory accordingly
      // Note: the quantityChange should be negative when increasing cart quantity
      // because it means we are reducing the inventory
      await axios.put(
        `http://localhost:3000/admin/products/inventory-adjust/${productId}`,
        { quantityChange: -quantityChange },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Refresh the cart to show updated quantities and ensure inventory is consistent
      fetchCart(token);
    } catch (error) {
      console.error(
        "Failed to update item quantity or adjust inventory:",
        error.response?.data || error
      );
    }
  };
  

  const removeFromCart = async (productId) => {
    try {
      const { token } = AuthService.getCurrentUser();
      await axios.delete(`http://localhost:3000/api/cart/item/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart(token); // Refresh the cart to reflect the item removal
    } catch (error) {
      console.error(
        "Failed to remove item from cart:",
        error.response?.data || error
      );
    }
  };

  const proceedToPayment = () => {
    navigate("/payment", { state: { totalPrice: cart.totalPrice } }); // Passing total price to payment page
  };

  // Call mergeCarts when the component mounts
  useEffect(() => {
    mergeCarts();
  }, []); // Empty dependency array to only run once when component mounts

  return (
    <div>
      <h2>Your Cart</h2>
      {cart.items.length > 0 ? (
        cart.items.map((item, index) => (
          <div key={index} className="cart-item">
            <h3>{item.productId.name}</h3>
            <img
              src={item.productId.images[0]}
              alt={item.productId.name}
              style={{ width: "100px", height: "100px" }}
            />
            <p>Price: ${item.productId.price.toFixed(2)}</p>
            <p>Quantity: {item.quantity}</p>
            {item.quantity > item.productId.productQuantity && (
              <p style={{ color: "red" }}>Stock not available for this quantity!</p>
            )}
            <button
              onClick={() =>
                updateQuantity(item.productId._id, item.quantity + 1)
              }
              disabled={item.quantity >= item.productId.productQuantity}
            >
              +
            </button>
            <button
              onClick={() =>
                item.quantity > 1 &&
                updateQuantity(item.productId._id, item.quantity - 1)
              }
            >
              -
            </button>
            <button onClick={() => removeFromCart(item.productId._id)}>
              Remove
            </button>
          </div>
        ))
      ) : (
        <p>Your cart is empty.</p>
      )}
      <p>Total Price: ${cart.totalPrice.toFixed(2)}</p>
      <button onClick={proceedToPayment} disabled={!checkStockAvailability()}>
        Proceed to Payment
      </button>
      {!checkStockAvailability() && (
        <p style={{ color: 'red' }}>Adjust quantities as some items exceed available stock.</p>
      )}
    </div>
  );
  
}

export default Cart;
