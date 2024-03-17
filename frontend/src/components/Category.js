import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";

const API_BASE_URL_CATEGORIES = "http://localhost:3000/admin/categories/";
const API_BASE_URL_DEPARTMENTS = "http://localhost:3000/admin/departments/";

// Reuse the getAuthHeader function
const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    console.error("No token found or user not logged in");
    return {};
  }
};

function Category() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    fetchAllCategories();
    fetchAllDepartments();
  }, []);

  const fetchAllCategories = () => {
    axios
      .get(API_BASE_URL_CATEGORIES + "all", { headers: getAuthHeader() })
      .then((response) => {
        console.log("Fetched Categories:", response.data);
        setCategories(response.data);
      })
      .catch((error) => console.error("Failed to fetch categories:", error));
  };

  const fetchAllDepartments = () => {
    axios
      .get(API_BASE_URL_DEPARTMENTS + "all", { headers: getAuthHeader() })
      .then((response) => {
        console.log("Fetched Departments:", response.data);
        setDepartments(response.data);
      })
      .catch((error) => console.error("Failed to fetch departments:", error));
  };

  const handleAddOrUpdateCategory = (e) => {
    e.preventDefault();
    const payload = {
      name: categoryName,
      description: categoryDescription,
      departmentId: selectedDepartment,
    };

    const successCallback = () => {
      fetchAllCategories();
      resetForm();
    };

    if (editingCategoryId) {
      axios
        .put(`${API_BASE_URL_CATEGORIES}${editingCategoryId}`, payload, {
          headers: getAuthHeader(),
        })
        .then(successCallback)
        .catch((error) => console.error("Failed to update category:", error));
    } else {
      axios
        .post(API_BASE_URL_CATEGORIES + "add", payload, {
          headers: getAuthHeader(),
        })
        .then(successCallback)
        .catch((error) => console.error("Failed to add category:", error));
    }
  };

  const handleEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setSelectedDepartment(category.department); // Assuming category.department directly contains the department ID
  };

  const handleDelete = (categoryId) => {
    axios
      .delete(`${API_BASE_URL_CATEGORIES}${categoryId}`, {
        headers: getAuthHeader(),
      })
      .then(() => fetchAllCategories())
      .catch((error) => console.error("Failed to delete category:", error));
  };

  const resetForm = () => {
    setEditingCategoryId(null);
    setCategoryName("");
    setCategoryDescription("");
    setSelectedDepartment("");
  };

  return (
    <div>
      <h2>{editingCategoryId ? "Edit Category" : "Add Category"}</h2>
      <form onSubmit={handleAddOrUpdateCategory}>
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Category Description"
          value={categoryDescription}
          onChange={(e) => setCategoryDescription(e.target.value)}
        />
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          required
        >
          <option value="">Select Department</option>
          {departments.map((department) => (
            <option key={department._id} value={department._id}>
              {department.name}
            </option>
          ))}
        </select>
        <button type="submit">
          {editingCategoryId ? "Update Category" : "Add Category"}
        </button>
      </form>
      <h3>Category List</h3>
      <ul>
  {categories.map((category) => (
    <li key={category._id}>
      {category.name} - {category.description} - 
      {category.department ? category.department.name : 'Department not found'}
      <button onClick={() => handleEdit(category)}>Edit</button>
      <button onClick={() => handleDelete(category._id)}>Delete</button>
    </li>
  ))}
</ul>
    </div>
  );
}

export default Category;
