import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";
import "../css/ProductStyles.css";

const API_BASE_URL = "http://localhost:3000/admin";

function Product() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productDescription, setProductDescription] = useState(""); // Added for product description
  const [imageUrls, setImageUrls] = useState([""]); // Changed for handling multiple image URLs
  const [productAttributes, setProductAttributes] = useState([{ key: "", value: "" }]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchAllCategories();
    fetchAllAttributes();
    fetchAllProducts();
  }, []);

  const handleImageUrlsChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value;
    setImageUrls(updatedUrls);
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const removeImageField = (index) => {
    const updatedUrls = imageUrls.filter((_, idx) => idx !== index);
    setImageUrls(updatedUrls);
  };

  const fetchAllCategories = async () => {
    const response = await axios.get(`${API_BASE_URL}/categories/all`, { headers: getAuthHeader() });
    setCategories(response.data);
  };

  const fetchAllAttributes = async () => {
    const response = await axios.get(`${API_BASE_URL}/attributes/all`, { headers: getAuthHeader() });
    setAttributes(response.data);
  };

  const fetchAllProducts = async () => {
    const response = await axios.get(`${API_BASE_URL}/products/all`, { headers: getAuthHeader() });
    setProducts(response.data);
  };

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...productAttributes];
    updatedAttributes[index][field] = value;
    setProductAttributes(updatedAttributes);
  };

  const addAttributeField = () => {
    setProductAttributes([...productAttributes, { key: "", value: "" }]);
  };

  const removeAttributeField = (index) => {
    setProductAttributes(productAttributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      categoryName: selectedCategory,
      name: productName,
      price: parseFloat(productPrice),
      brand: productBrand,
      productQuantity: parseInt(productQuantity, 10),
      description: productDescription, // Added for product description
      images: imageUrls.filter(url => url.trim() !== ''), // Filter out empty strings
      attributes: productAttributes.filter(attr => attr.key && attr.value),
    };

    try {
      if (editingProduct) {
        await axios.put(`${API_BASE_URL}/products/${editingProduct}`, payload, { headers: getAuthHeader() });
      } else {
        await axios.post(`${API_BASE_URL}/products/add`, payload, { headers: getAuthHeader() });
      }
      resetForm();
      fetchAllProducts();
    } catch (error) {
      console.error("Failed to add/update product:", error.response?.data.message || error.message);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product._id);
    setSelectedCategory(product.categoryName._id || product.categoryName);
    setProductName(product.name);
    setProductPrice(product.price);
    setProductBrand(product.brand);
    setProductQuantity(product.productQuantity);
    setProductDescription(product.description || ""); // Set the description for editing
    setImageUrls(product.images.length > 0 ? product.images : [""]); // Set image URLs or default empty string
    setProductAttributes(product.attributes || [{ key: "", value: "" }]);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}`, { headers: getAuthHeader() });
      fetchAllProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setProductName("");
    setProductPrice("");
    setProductBrand("");
    setProductQuantity("");
    setProductDescription(""); // Reset the description field
    setImageUrls([""]); // Reset to single empty string for image URLs
    setProductAttributes([{ key: "", value: "" }]);
    setEditingProduct(null);
  };

  const getAuthHeader = () => {
    const user = AuthService.getCurrentUser();
    return user ? { Authorization: `Bearer ${user.token}` } : {};
  };
  

  return (
    <div>
      <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <div>
          <label>Product Name:</label>
          <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} required />
        </div>
  
        {/* Price */}
        <div>
          <label>Price:</label>
          <input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} required />
        </div>
  
        {/* Brand */}
        <div>
          <label>Brand:</label>
          <input type="text" value={productBrand} onChange={(e) => setProductBrand(e.target.value)} />
        </div>
  
        {/* Quantity */}
        <div>
          <label>Quantity:</label>
          <input type="number" value={productQuantity} onChange={(e) => setProductQuantity(e.target.value)} required />
        </div>
  
        {/* Category */}
        <div>
          <label>Category:</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
      <div>
        <label>Description:</label>
        <textarea value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required></textarea>
      </div>

  
        {/* Attributes */}
        <div>
          <label>Attributes:</label>
          {productAttributes.map((attr, index) => (
            <div key={index} className="attribute-section">
              <select value={attr.key} onChange={(e) => handleAttributeChange(index, "key", e.target.value)} required>
                <option value="">Select an attribute</option>
                {attributes.map((attribute) => (
                  <option key={attribute._id} value={attribute.key}>{attribute.key}</option>
                ))}
              </select>
              <input type="text" value={attr.value} onChange={(e) => handleAttributeChange(index, "value", e.target.value)} required />
              {index > 0 && (
                <button type="button" onClick={() => removeAttributeField(index)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAttributeField}>Add another attribute</button>
        </div>
  
        {/* Images */}
        <div>
          <label>Images:</label>
          {imageUrls.map((url, index) => (
            <div key={index}>
              <input type="text" value={url} onChange={(e) => handleImageUrlsChange(index, e.target.value)} placeholder="Image URL" />
              {imageUrls.length > 1 && (
                <button type="button" onClick={() => removeImageField(index)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addImageField}>Add another image</button>
        </div>
  
        <button type="submit">{editingProduct ? "Update Product" : "Add Product"}</button>
      </form>
  
      <h3>Products List</h3>
      <div className="products-container">
        {products.map((product) => (
          <div key={product._id} className="product-item">
            <p>{product.name} - {product.brand} - Price: ${product.price} - Qty: {product.productQuantity}</p>
            <p>Category: {product.categoryName ? categories.find(category => category._id === (product.categoryName._id || product.categoryName))?.name || "No category" : "No category"}</p>
            <p>Attributes: {product.attributes.map((a) => `${a.key}: ${a.value}`).join(", ")}</p>
            <div className="product-images">
              {product.images.map((image, index) => (
                <img key={index} src={image} alt={product.name} className="product-image" />
              ))}
            </div>
            <div className="product-actions">
              <button onClick={() => handleEditProduct(product)}>Edit</button>
              <button onClick={() => handleDeleteProduct(product._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
}

export default Product;
