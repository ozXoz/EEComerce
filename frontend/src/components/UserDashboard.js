import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import AuthService from "../auth/AuthService"; // Ensure this is correctly importedimport { Link } from 'react-router-dom';

function UserDashboard() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Adjust the URL based on your environment and the route you've set up
        const response = await axios.get(
          "http://localhost:3000/admin/products/public/display"
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to add items to the cart");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/cart/add",
        {
          productId,
          quantity: 1, // Default quantity to 1, adjust as needed
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      alert("Product added to cart!");
    } catch (error) {
      console.error("Error adding product to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  const addToFavorites = async (productId) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to add items to favorites");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/favorites/add",
        {
          productId,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      alert("Product added to favorites!");
    } catch (error) {
      console.error("Error adding product to favorites:", error);
      alert("Failed to add product to favorites.");
    }
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      <a href="#" onClick={() => AuthService.logout()}>
        Logout
      </a>
      <Link to="/api/cart">View Cart</Link>
      <Link to="/shopping-info">View Shopping Information</Link>{" "}
      {/* Add this link */}
      <Link to="/order-history">Order History</Link> {/* Add this link */}
      {/* Ensure you have a route for '/cart' */}
      <p>
        Welcome to your dashboard. Here, you can view your profile and explore
        products.
      </p>
      <div className="products-list">
        {products.map((product, index) => (
          <div key={index} className="product-item">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Brand: {product.brand}</p>
            {product.images && product.images[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                style={{ width: "100px", height: "100px" }}
              />
            )}
            <button onClick={() => addToCart(product._id)}>Add to Cart</button>{" "}
            {/* Add to Cart button */}
            <button onClick={() => addToFavorites(product._id)}>
              Add to Favorites
            </button>
            <Link to="/favorites">View Favorites</Link>
            <Link to="/tracking">View Tracker</Link>
            <Link to={`/product/${product._id}`}>
  <h3>Product Details</h3>
</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;
