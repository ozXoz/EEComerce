import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService"; // Adjust the path as necessary

function FetchShippingAdmin() {
  const [shippings, setShippings] = useState([]);

  useEffect(() => {
    fetchShippings();
  }, []);

  const fetchShippings = async () => {
    try {
      const { token } = AuthService.getCurrentUser();
      const response = await axios.get("http://localhost:3000/shipping/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShippings(response.data);
    } catch (error) {
      console.error("Error fetching shippings:", error);
    }
  };

  return (
    <div>
      <h2>All Shipping Information</h2>
      {shippings.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>Country</th>
                <th>Address</th>
                <th>Province</th>
                <th>Postal Code</th>
                <th>Shipping ID</th>
              </tr>
            </thead>
            <tbody>
  {shippings.map((shipping, index) => (
    <tr key={shipping._id}>
      <td>{index + 1}</td>
      <td>{shipping.userId ? shipping.userId.username : 'N/A'}</td> {/* Check for existence of user data */}
      <td>{shipping.userId ? shipping.userId.email : 'N/A'}</td> {/* Check for existence of user data */}
      <td>{shipping.country}</td>
      <td>{shipping.address}</td>
      <td>{shipping.province}</td>
      <td>{shipping.postalCode}</td>
      <td>{shipping._id}</td> {/* Display the shipping ID */}
    </tr>
  ))}
</tbody>

          </table>
        </div>
      ) : (
        <p>No shipping information found.</p>
      )}
    </div>
  );
}

export default FetchShippingAdmin;
