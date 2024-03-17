import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from '../auth/AuthService';

function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const user = AuthService.getCurrentUser();
      if (!user || !user.token) {
        alert("You must be logged in as an admin.");
        return;
      }

      try {
        const response = await axios.get('http://localhost:3000/admin/products/all', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // When selectedProductId changes, update the productQuantity to reflect the current quantity
    const selectedProduct = products.find(product => product._id === selectedProductId);
    if (selectedProduct) {
      setProductQuantity(selectedProduct.productQuantity);
    }
  }, [selectedProductId, products]);

  const updateInventory = async (e) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    if (!user || !user.token) {
      alert("You must be logged in as an admin to update inventory.");
      return;
    }

    try {
      await axios.put(`http://localhost:3000/admin/products/inventory/${selectedProductId}`, 
        { productQuantity: parseInt(productQuantity, 10) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert('Inventory updated successfully');
      setSelectedProductId('');
      setProductQuantity('');
    } catch (error) {
      console.error("Failed to update inventory:", error.response?.data?.message || error.message);
      alert("Failed to update inventory.");
    }
  };

  return (
    <div>
      <h2>Update Product Inventory</h2>
      <form onSubmit={updateInventory}>
        <div>
          <label>Product:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>{`${product.name} (Current Quantity: ${product.productQuantity})`}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            min="0"
            required
          />
        </div>
        <button type="submit">Update Inventory</button>
      </form>
    </div>
  );
}

export default AdminInventory;
