import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AuthService from "../auth/AuthService";

function PublicTrackingInfo() {
  const [trackingInfo, setTrackingInfo] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = AuthService.getCurrentUser();
        if (!user) {
          console.log("User not logged in");
          return;
        }
        // Assuming you need to send the user's token for authentication
        const headers = {
          Authorization: `Bearer ${user.token}`,
        };
        // Updated endpoint to fetch user-specific tracking info
        const response = await axios.get('http://localhost:3000/user/tracking', { headers });
        setTrackingInfo(response.data);
      } catch (error) {
        console.error('Error fetching tracking info:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h3>Your Tracking Information</h3>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Shipping ID</th>
            <th>Comments</th>
            <th>Status</th>
            <th>Shipping Company Name</th>
            <th>Shipping Tracker ID</th>
          </tr>
        </thead>
        <tbody>
          {trackingInfo.map((info, index) => (
            <tr key={index}>
              <td>{info.orderId}</td>
              <td>{info.shippingId}</td>
              <td>{info.comments}</td>
              <td>{info.status}</td>
              <td>{info.shippingCompanyName}</td>
              <td>{info.shippingTrackerId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PublicTrackingInfo;
