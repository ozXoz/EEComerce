import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";

const API_BASE_URL_ORDERS = "http://localhost:3000/admin/orders/";

function Orders() {
  const [orders, setOrders] = useState([]);

  const fetchAllOrders = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
      };
      const response = await axios.get(`${API_BASE_URL_ORDERS}all`, {
        headers,
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleEditStatus = async (orderId) => {
    const newStatus = prompt(`Enter new status for order ${orderId}:`);
    if (newStatus) {
      try {
        const headers = {
          Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
        };
        await axios.put(
          `${API_BASE_URL_ORDERS}/updateStatus/${orderId}`,
          { status: newStatus },
          { headers }
        );
        // Refresh order list
        fetchAllOrders();
      } catch (error) {
        console.error("Failed to update order status:", error);
      }
    }
  };

  return (
    <div>
      <h2>Order List</h2>
      {orders.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>User Email</th>
              <th>Product Details</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.userId}</td>
                <td>{order.email}</td>
                <td>
                  {order.items.map((item, index) => (
                    <div key={index}>
                      <p>
                        <strong>Name:</strong> {item.name}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>Price:</strong> ${item.price}
                      </p>
                      {item.productId.images && item.productId.images[0] && (
                        <img
                          src={item.productId.images[0]} // Change from item.productId.image[0] to item.productId.images[0]
                          alt={item.name}
                          style={{ width: "100px", marginRight: "10px" }}
                        />
                      )}
                      {index < order.items.length - 1 && <hr />}{" "}
                      {/* Divider between products */}
                    </div>
                  ))}
                </td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>
                  {AuthService.getCurrentUser().isAdmin ? (
                    <div>
                      <span>{order.paymentStatus}</span>
                    </div>
                  ) : (
                    <span>{order.paymentStatus}</span>
                  )}
                </td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEditStatus(order._id)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}

export default Orders;
