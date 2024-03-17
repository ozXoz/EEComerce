import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService"; // Make sure to import AuthService
import { useParams } from "react-router-dom";

function ProductDetails() {
  const [product, setProduct] = useState({ images: [] }); // Initialize images as an empty array
  const [quantity, setQuantity] = useState(1);
  const { productId } = useParams(); // Using React Router's useParams

  useEffect(() => {
    // Fetch product details from the backend
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/admin/products/${productId}`
        );
        setProduct(response.data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const addToCart = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) {
        alert("Please log in to add items to the cart");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/cart/add",
        {
          productId: productId,
          quantity: quantity,
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

  return (
    <div>
      <h2>{product.name}</h2>
      {/* Display product price */}
      <p>Price: ${product.price}</p>
      {/* Display product images */}
      <div>
        {product.images.map((image, index) => (
          <img key={index} src={image} alt={`Product ${index}`} style={{ maxWidth: '100px', marginRight: '10px' }} />
        ))}
      </div>
      {/* Display product description */}
      {product.description && (
        <p>Description: {product.description}</p>
      )}
      {/* Quantity adjustment */}
      <div>
        <button onClick={() => setQuantity(quantity - 1)} disabled={quantity <= 1}>-</button>
        {quantity}
        <button onClick={() => setQuantity(quantity + 1)}>+</button>
      </div>
      {/* Display total price based on quantity */}
      <p>Total Price: ${(product.price * quantity).toFixed(2)}</p>
      <button onClick={addToCart}>Add to Cart</button>
    </div>
  );
}

export default ProductDetails;
