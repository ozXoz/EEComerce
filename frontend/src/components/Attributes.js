import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";

const API_BASE_URL_ATTRIBUTES = "http://localhost:3000/admin/attributes/";

const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    console.error("No token found or user not logged in");
    return {};
  }
};

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [key, setKey] = useState("");
  const [values, setValues] = useState("");
  const [editingAttributeId, setEditingAttributeId] = useState(null);

  useEffect(() => {
    fetchAllAttributes();
  }, []);

  const fetchAllAttributes = () => {
    axios
      .get(API_BASE_URL_ATTRIBUTES + "all", { headers: getAuthHeader() })
      .then((response) => {
        setAttributes(response.data);
      })
      .catch((error) => console.error("Failed to fetch attributes:", error));
  };

  const handleAddOrUpdateAttribute = (e) => {
    e.preventDefault();
    const payload = {
      key,
      values: values.split(",").map((value) => value.trim()),
    };
  
    // Always use the POST method to `/add` for both adding and updating attributes
    axios.post(API_BASE_URL_ATTRIBUTES + "add", payload, { headers: getAuthHeader() })
      .then(() => {
        fetchAllAttributes();
        resetForm();
      })
      .catch((error) => console.error("Failed to add/update attribute:", error));
  };

  const handleEdit = (attribute) => {
    setEditingAttributeId(attribute._id);
    setKey(attribute.key);
    setValues(attribute.values.join(", "));
  };

  // Inside your Attributes component

const handleDelete = (id) => {
    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this attribute?")) {
      axios
        .delete(API_BASE_URL_ATTRIBUTES + id, { headers: getAuthHeader() })
        .then(() => {
          // Refresh the attributes list after deletion
          fetchAllAttributes();
        })
        .catch((error) => console.error("Failed to delete attribute:", error));
    }
  };
  

  const resetForm = () => {
    setKey("");
    setValues("");
    setEditingAttributeId(null);
  };

  return (
    <div>
      <h2>{editingAttributeId ? "Edit Attribute" : "Add Attribute"}</h2>
      <form onSubmit={handleAddOrUpdateAttribute}>
        <input
          type="text"
          placeholder="Attribute Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Attribute Values (comma-separated)"
          value={values}
          onChange={(e) => setValues(e.target.value)}
        />
        <button type="submit">{editingAttributeId ? "Update" : "Submit"}</button>
      </form>
      <h3>Attributes List</h3>
      <ul>
        {attributes.map((attribute) => (
          <li key={attribute._id}>
            {attribute.key}: {attribute.values.join(", ")}
            <button onClick={() => handleEdit(attribute)}>Edit</button>
            {/* Add this line for the delete button */}
            <button onClick={() => handleDelete(attribute._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Attributes;
