import React, { useState, useEffect } from "react";
import axios from "axios";
import AuthService from "../auth/AuthService"; // Adjust the path as necessary
function Tracker() {
    const [orderId, setOrderId] = useState("");
    const [trackingInfo, setTrackingInfo] = useState({
      shippingId: "",
      comments: "",
      status: "",
      shippingCompanyName: "",
      shippingTrackerId: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState("");
    const [trackingInfos, setTrackingInfos] = useState([]); // Store all submissions in an array
  
    useEffect(() => {
      const savedTrackingInfos = localStorage.getItem("trackingInfos");
      if (savedTrackingInfos) {
        setTrackingInfos(JSON.parse(savedTrackingInfos));
      }
    }, []);
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === "orderId") {
        setOrderId(value);
      } else {
        setTrackingInfo({ ...trackingInfo, [name]: value });
      }
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const { token } = AuthService.getCurrentUser();
      try {
        const response = await axios.post(
          `http://localhost:3000/admin/orders/${orderId}/tracking`,
          { ...trackingInfo, orderId }, // Include orderId in the submission
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsLoading(false);
        setSubmissionMessage("Tracking information added successfully!");
        const newTrackingInfos = [...trackingInfos, response.data];
        setTrackingInfos(newTrackingInfos); // Update state with new submission
        localStorage.setItem("trackingInfos", JSON.stringify(newTrackingInfos)); // Update local storage
        resetForm();
      } catch (error) {
        setIsLoading(false);
        setSubmissionMessage("Error adding tracking information. Please try again.");
        console.error("Error adding tracking information:", error);
      }
    };
  
    const resetForm = () => {
      setOrderId("");
      setTrackingInfo({
        shippingId: "",
        comments: "",
        status: "",
        shippingCompanyName: "",
        shippingTrackerId: "",
      });
    };

  return (
    <div>
      <h3>Add / Update Tracking Information</h3>
      {submissionMessage && <p>{submissionMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Order ID:</label>
          <input
            type="text"
            name="orderId"
            value={orderId}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Shipping ID:</label>
          <input
            type="text"
            name="shippingId"
            value={trackingInfo.shippingId}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Comments:</label>
          <input
            type="text"
            name="comments"
            value={trackingInfo.comments}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Status:</label>
          <select
            name="status"
            value={trackingInfo.status}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
            <option value="preparing">Preparing</option>
            <option value="sent">Sent</option>
          </select>
        </div>
        <div>
          <label>Shipping Company Name:</label>
          <input
            type="text"
            name="shippingCompanyName"
            value={trackingInfo.shippingCompanyName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Shipping Tracker ID:</label>
          <input
            type="text"
            name="shippingTrackerId"
            value={trackingInfo.shippingTrackerId}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Display the last submitted tracking information */}
      {/* Table to display all tracking information */}
      {trackingInfos.length > 0 && (
        <div>
          <h4>Submitted Tracking Information:</h4>
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
              {trackingInfos.map((info, index) => (
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
      )}
    </div>
  );
}

export default Tracker;
