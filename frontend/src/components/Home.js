// src/components/Home.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../auth/AuthService';
import '../css/Home.css'; // Ensure the path matches your file structure

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/admin/products/public/display');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };

    // Attempt to fetch cart from local storage or set a default empty cart
    const localCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalPrice: 0 };
    setCart(localCart);

    fetchProducts();
  }, []);

  const addToCart = async (product) => {
    const user = AuthService.getCurrentUser();
    if (user) {
      // User is authenticated, send a request to backend to add the product to the cart
      try {
        const response = await axios.post(
          'http://localhost:3000/api/cart/add',
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setCart(response.data); // Assuming the backend returns the updated cart
      } catch (error) {
        console.error('Error adding item to cart:', error.response?.data || error);
      }
    } else {
      // Unauthenticated user, manage cart in local storage
      let storedCart = JSON.parse(localStorage.getItem('cart')) || { items: [], totalPrice: 0 };
      const productIndex = storedCart.items.findIndex(item => item.productId === product._id);
      if (productIndex !== -1) {
        storedCart.items[productIndex].quantity += 1; // If the product exists, increase the quantity
      } else {
        storedCart.items.push({ productId: product._id, name: product.name, price: product.price, quantity: 1 }); // Add new product to the cart
      }

      // Recalculate totalPrice
      storedCart.totalPrice = storedCart.items.reduce((total, currentItem) => total + currentItem.price * currentItem.quantity, 0);

      setCart(storedCart); // Update local state
      localStorage.setItem('cart', JSON.stringify(storedCart)); // Update local storage
    }
  };

  const handleProceed = () => {
    if (AuthService.getCurrentUser()) {
      navigate('/login');
    } else {
      navigate('/login'); // Redirect to login if not authenticated
    }
  };

  return (
    <div className="home-container">
      <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
      <div>
        <h4>Cart Summary</h4>
        <p>Items: {cart.items.reduce((total, item) => total + item.quantity, 0)}</p>
        <p>Total: ${cart.totalPrice.toFixed(2)}</p>
        <button onClick={handleProceed}>Proceed to Checkout</button>
      </div>
      <h2>Our Products</h2>
      <div className="products-list">
        {products.map((product) => (
          <div key={product._id} className="product-item">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Brand: {product.brand}</p>
            {product.images && product.images[0] && (
              <img src={product.images[0]} alt={product.name} style={{ width: 100, height: 100 }} />
            )}
            <button onClick={() => addToCart(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
