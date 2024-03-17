import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import AuthService from "./auth/AuthService";
import Home from "./components/Home";
import Departments from "./components/Departments"; // Adjust the path as necessary
import Category from "./components/Category"; // Adjust the path as necessary
import Attributes from "./components/Attributes"; // Adjust the path as necessary
import Product from "./components/Product"; // Adjust the path as necessary
import Cart from "./components/Cart";
import Payment from "./components/Payment"; // Ödeme bileşeni import edildi
import OrderConfirmation from "./components/OrderConfirmation";
import Orders from "./components/Orders"; // Adjust the path as necessary
import ShoppingInfo from "./components/ShoppingInfo";
import OrderHistory from "./components/OrderHistory";
import MiniCart from "./components/MiniCart"; // Import the MiniCart component
import FavoritesDisplay from "./components/FavoritesDisplay";
import AdminInventory from "./components/AdminInventory"; // Adjust the path as necessary
import FetchShippingAdmin from "./components/FetchShippingAdmin"; // Adjust the path as necessary
import PublicTrackingInfo from "./components/PublicTrackingInfo";
import ProductDetails from "./components/ProductDetails";

function App() {
  // Function to determine the appropriate dashboard route based on user role
  const getDashboardRoute = () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      return user.role === "admin" ? (
        <Navigate to="/admin/dashboard" />
      ) : (
        <Navigate to="/user/dashboard" />
      );
    }
    // If user is not logged in, redirect to login page
    return <Navigate to="/login" />;
  };

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/minicart" element={<MiniCart />} />
          <Route path="/dashboard" element={getDashboardRoute()} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/departments" element={<Departments />} />
          <Route path="/api/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />{" "}
          {/* Ödeme sayfası için yol tanımlandı */}
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/admin/orders" element={<Orders />} />{" "}
          {/* Add this line for admin orders management */}
          <Route path="/shopping-info" element={<ShoppingInfo />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/favorites" element={<FavoritesDisplay />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/shippings" element={<FetchShippingAdmin />} />
          <Route path="/tracking" element={<PublicTrackingInfo />} />
          <Route path="/product/:productId" element={<ProductDetails />} />

          {/* Add this line for TrackerList */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
