import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from '../auth/AuthService'; // Ensure this path matches your project structure

const API_BASE_URL = "http://localhost:3000/admin/departments/";

// Updated helper function to get the authorization header using AuthService
const getAuthHeader = () => {
  const user = AuthService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    console.error("No token found or user not logged in");
    return {};
  }
};

const fetchAllDepartments = () => {
  return axios.get(API_BASE_URL + "all", {
    headers: getAuthHeader(),
  });
};

const createDepartment = (payload) => {
  return axios.post(API_BASE_URL + "add", payload, {
    headers: getAuthHeader(),
  });
};

const updateDepartment = (id, payload) => {
  return axios.put(`${API_BASE_URL}${id}`, payload, {
    headers: getAuthHeader(),
  });
};

const deleteDepartment = (id) => {
  return axios.delete(`${API_BASE_URL}${id}`, {
    headers: getAuthHeader(),
  });
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [departmentName, setDepartmentName] = useState("");
  const [departmentDescription, setDepartmentDescription] = useState("");
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);

  useEffect(() => {
    fetchAllDepartments()
      .then((response) => {
        setDepartments(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch departments:", error.response ? error.response.data : error);
      });
  }, []);

  const handleAddOrUpdateDepartment = (e) => {
    e.preventDefault();
    const payload = {
      name: departmentName,
      description: departmentDescription,
    };

    const successCallback = () => {
      fetchAllDepartments().then((response) => {
        setDepartments(response.data);
        resetForm();
      });
    };

    if (editingDepartmentId) {
      updateDepartment(editingDepartmentId, payload)
        .then(successCallback)
        .catch((error) => {
          console.error("Failed to update department:", error.response ? error.response.data : error);
        });
    } else {
      createDepartment(payload)
        .then(successCallback)
        .catch((error) => {
          console.error("Failed to add department:", error.response ? error.response.data : error);
        });
    }
  };

  const handleEdit = (department) => {
    setEditingDepartmentId(department._id);
    setDepartmentName(department.name);
    setDepartmentDescription(department.description);
  };

  const handleDelete = (departmentId) => {
    deleteDepartment(departmentId)
      .then(() => {
        fetchAllDepartments().then((response) => {
          setDepartments(response.data);
        });
      })
      .catch((error) => {
        console.error("Failed to delete department:", error.response ? error.response.data : error);
      });
  };

  const resetForm = () => {
    setEditingDepartmentId(null);
    setDepartmentName("");
    setDepartmentDescription("");
  };

  return (
    <div>
      <h2>{editingDepartmentId ? 'Edit Department' : 'Add Department'}</h2>
      <form onSubmit={handleAddOrUpdateDepartment}>
        <input
          type="text"
          placeholder="Name"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={departmentDescription}
          onChange={(e) => setDepartmentDescription(e.target.value)}
        />
        <button type="submit">{editingDepartmentId ? 'Update' : 'Add'}</button>
        {editingDepartmentId && <button onClick={resetForm}>Cancel</button>}
      </form>
      <h3>Department List</h3>
      <ul>
        {departments.map((department) => (
          <li key={department._id}>
            {department.name} - {department.description}
            <button onClick={() => handleEdit(department)}>Edit</button>
            <button onClick={() => handleDelete(department._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Departments;
