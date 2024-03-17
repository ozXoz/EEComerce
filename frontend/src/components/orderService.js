import axios from 'axios';
import AuthService from '../auth/AuthService';

const API_BASE_URL = 'http://localhost:3000/admin/orders/create';

const createOrderFromCart = async (additionalData = {}) => {
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser || !currentUser.token) {
    throw new Error("No authentication token found. User must be logged in to create orders.");
  }

  try {
    const response = await axios.post(`${API_BASE_URL}`, additionalData, {
      headers: { Authorization: `Bearer ${currentUser.token}` },
    });
    return response;
  } catch (error) {
    // Log the error or handle it as needed
    console.error("Error creating order:", error.response?.data?.message || error.message);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

export { createOrderFromCart };
