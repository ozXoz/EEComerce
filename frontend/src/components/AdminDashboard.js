import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService"; // Adjust the path as necessaryimport "../css/AdminDashboard.css"; // Make sure this CSS file exists and is correctly linked
import Departments from "./Departments"; // Adjust the path as necessary
import Category from "./Category"; // Adjust the path as necessary
import Attributes from "./Attributes"; // Adjust the path as necessary
import Product from "./Product"; // Import Product component
import Orders from "./Orders";
import AdminInventory from "./AdminInventory"; // Adjust the path as necessary
import "../css/AdminDashboard.css";
import FetchShippingAdmin from "./FetchShippingAdmin"; // Adjust the path as necessary
import Tracker from "./Tracker"; // Adjust the path as necessary

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [editDetails, setEditDetails] = useState({ username: "", email: "" });
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orders, setOrders] = useState([]); // Added for orders listing

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const fetchUsers = async () => {
    try {
      const { token } = AuthService.getCurrentUser();
      const response = await axios.get("http://localhost:3000/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchUserById = async (id) => {
    try {
      const { token } = AuthService.getCurrentUser();
      const response = await axios.get(
        `http://localhost:3000/admin/users/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUserDetails(response.data);
      setEditDetails({
        username: response.data.username,
        email: response.data.email,
      });
    } catch (error) {
      console.error("Error fetching user by ID:", error);
    }
  };

  const deleteUserById = async (id) => {
    try {
      const { token } = AuthService.getCurrentUser();
      await axios.delete(`http://localhost:3000/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers(); // Refresh the user list after deletion
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const updateUserById = async (id) => {
    try {
      const { token } = AuthService.getCurrentUser();
      await axios.put(`http://localhost:3000/admin/users/${id}`, editDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers(); // Refresh the user list after update
      setUserDetails(null); // Clear the current user details
      setEditDetails({ username: "", email: "" }); // Reset edit form
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (userDetails) {
      await updateUserById(userDetails._id);
    }
  };
  // New function to handle order selection
  const handleOrderSelection = (orderId) => {
    setSelectedOrderId(orderId);
    setActiveMenu("tracker"); // Switch to tracker view when an order is selected
  };

  return (
    <div className="admin-dashboard">
      <div className="sidebar">
        <a href="#" onClick={() => AuthService.logout()}>
          Logout
        </a>
        {/* Add this line for logout */}
        <a href="#" onClick={() => handleMenuClick("dashboard")}>
          Dashboard
        </a>
        <a href="#" onClick={() => handleMenuClick("users")}>
          Users
        </a>
        <a href="#" onClick={() => handleMenuClick("departments")}>
          Departments
        </a>{" "}
        <a href="#" onClick={() => handleMenuClick("attributes")}>
          Attributes
        </a>
        <a href="#" onClick={() => handleMenuClick("categories")}>
          Categories
        </a>
        {/* Add this line */}
        <a href="#" onClick={() => handleMenuClick("products")}>
          Products
        </a>
        <a href="#" onClick={() => handleMenuClick("inventory")}>
          Inventory
        </a>
        <a href="#" onClick={() => handleMenuClick("orders")}>
          Orders
        </a>
        <a href="#" onClick={() => handleMenuClick("shippings")}>
          Shippings
        </a>
        <a href="#" onClick={() => handleMenuClick("tracker")}>
          tracker
        </a>
      </div>
      <div className="main-content">
        {activeMenu === "dashboard" && (
          <div>
            <h1>Admin Dashboard</h1>
          </div>
        )}
        {activeMenu === "departments" && <Departments />}{" "}
        {activeMenu === "categories" && <Category />}
        {activeMenu === "attributes" && <Attributes />}
        {activeMenu === "products" && <Product />}
        {activeMenu === "orders" && <Orders />}
        {activeMenu === "inventory" && <AdminInventory />}
        {activeMenu === "shippings" && <FetchShippingAdmin />}
        {activeMenu === "tracker" && <Tracker />}
        {/* Render Departments here */}
        {activeMenu === "tracker" && selectedOrderId && <Tracker orderId={selectedOrderId} />}
        {activeMenu === "ordersList" && (
          <div>
            <h3>Select an Order for Tracking</h3>
            {orders.map((order) => (
              <div key={order._id} onClick={() => handleOrderSelection(order._id)}>
                Order ID: {order._id}
              </div>
            ))}
          </div>
        )}
        {activeMenu === "users" && (
          <div>
            <h2>All Users</h2>
            {userDetails && (
              <form onSubmit={handleUpdateSubmit}>
                <label>Username:</label>
                <input
                  type="text"
                  name="username"
                  value={editDetails.username}
                  onChange={handleEditChange}
                />
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={editDetails.email}
                  onChange={handleEditChange}
                />
                <button type="submit">Save Changes</button>
              </form>
            )}
            {users.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user._id}>
                        <td>{index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <button onClick={() => fetchUserById(user._id)}>
                            Edit
                          </button>
                          <button onClick={() => deleteUserById(user._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No users found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
