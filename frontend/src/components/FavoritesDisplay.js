// components/FavoritesDisplay.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";
import { Link } from "react-router-dom";
// Done
function FavoritesDisplay() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          const response = await axios.get(
            "http://localhost:3000/api/favorites",
            {
              headers: { Authorization: `Bearer ${user.token}` },
            }
          );
          setFavorites(response.data.items); // Assuming the API returns an object with an items array
        } else {
          alert("Please log in to view favorites");
        }
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  // Inside your FavoritesDisplay component

  const removeFromFavorites = async (productId) => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to remove items from favorites");
        return;
      }

      await axios.delete(
        `http://localhost:3000/api/favorites/item/${productId}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      alert("Product removed from favorites!");
      // Refresh the favorites list to reflect the change
      const response = await axios.get("http://localhost:3000/api/favorites", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFavorites(response.data.items);
    } catch (error) {
      console.error("Error removing product from favorites:", error);
      alert("Failed to remove product from favorites.");
    }
  };

  const moveFavoritesToCart = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to move favorites to cart");
        return;
      }
  
      await axios.post(
        `http://localhost:3000/api/favorites/moveToCart`, 
        {}, // Empty body
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
  
      alert("Favorites moved to cart successfully!");
      setFavorites([]); // Clear favorites in state
    } catch (error) {
      console.error("Error moving favorites to cart:", error);
      alert("Failed to move favorites to cart.");
    }
  };

  return (
    <div>
      <h1>Your Favorites</h1>
      <div className="favorites-list">
        {favorites.length > 0 ? (
          favorites.map((item, index) => (
            <div key={index} className="favorite-item">
              <h3>{item.productId.name}</h3>
              <p>Brand: {item.productId.brand}</p>
              {item.productId.images && item.productId.images[0] && (
                <img
                  src={item.productId.images[0]}
                  alt={item.productId.name}
                  style={{ width: "100px", height: "100px" }}
                />
              )}
              {/* Add more product details as needed */}
              
              <button onClick={() => removeFromFavorites(item.productId._id)}>Remove from Favorites</button>
              <button onClick={moveFavoritesToCart}>Move All Favorites to Cart</button>
            </div>
          ))
        ) : (
          <p>No favorites added yet.</p>
        )}
      </div>
    </div>
  );
}

export default FavoritesDisplay;
