// AuthService.js
import axios from "axios";

const API_URL = "http://localhost:3000/auth/";

class AuthService {
  async login(email, password) {
    try {
      const response = await axios.post(API_URL + "login", {
        email,
        password,
      });

      console.log("Login response:", response.data); // Log the response data

      if (response.data.token) {
        // If the response contains a token, assume the user is authenticated
        const user = {
          role: response.data.role, // Assign the role received from the server
          token: response.data.token,
        };

        localStorage.setItem("user", JSON.stringify(user)); // Store the user object in local storage

        console.log(`Logged in as ${user.role}`);

        return user; // Return the user object
      } else {
        throw new Error("Token not found in response"); // Throw an error if token is not found
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  logout() {
    const user = this.getCurrentUser();
    if (user && user.token) {
      axios.post(API_URL + "logout", {}, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then(response => {
        console.log(response.data.message);
        // Proceed to clear the token from local storage and redirect the user
      })
      .catch(error => {
        console.error('Error during logout', error);
      });
    }
  
    // Clear user information from local storage
    localStorage.removeItem("user");
    // Redirect to login or home page
    window.location.href = "/login";
  }

  async signup(username, email, password, firstName, lastName, phoneNumber) {
    return axios.post(API_URL + "signup", {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    });
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem("user"));
  }
}

export default new AuthService();
