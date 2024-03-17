import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService";

function OrderHistory() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const user = AuthService.getCurrentUser();
        if (!user) {
          console.log("User not logged in");
          return;
        }

        const headers = {
          Authorization: `Bearer ${user.token}`,
        };
        const response = await axios.get(
          "http://localhost:3000/admin/orders/displayUserOrderHistory",
          { headers }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch order history:", error);
      }
    };

    fetchOrderHistory();
  }, []);

  return (
    <div>
      <h2>Order History</h2>
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
                          src={item.productId.images[0]} // Corrected path to access the product image
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
                <td>{order.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No order history found.</p>
      )}
    </div>
  );
}

export default OrderHistory;
