import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm";
import AuthService from "../auth/AuthService";
import ShippingForm from "./ShippingForm"; // Import ShippingForm
import axios from "axios";

// Stripe public key
const PUBLIC_KEY =
  "pk_test_51OnKHEBm4TSYA4w3et9qhgJsle2PWdfrh1Wj160raVqrX7sFgitEzyON408TVETcJhtxzKSKCtqhuyJmALBmZPYV00JLg75Szq";
const stripePromise = loadStripe(PUBLIC_KEY);

function Payment() {
  const [totalPrice, setTotalPrice] = useState("");
  const [shippingInfo, setShippingInfo] = useState(null);
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [isShippingSubmitted, setIsShippingSubmitted] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/cart/all", {
        headers: {
          Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
        },
      });
      const totalPrice = response.data.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      setTotalPrice(totalPrice);
      setCart(response.data); // Update cart state with fetched data
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  const handlePaymentSuccess = async (data) => {
    console.log("Payment successful:", data);

    try {
      if (shippingInfo) {
        const response = await axios.post(
          "http://localhost:3000/shipping/add",
          {
            ...shippingInfo,
            paymentId: data.paymentId,
          },
          {
            headers: {
              Authorization: `Bearer ${AuthService.getCurrentUser().token}`,
            },
          }
        );

        console.log("Shipping information inserted:", response.data);
        // Here you might want to proceed further, like showing a success message, redirecting, etc.
      }
    } catch (error) {
      console.error("Failed to insert shipping information:", error);
    }
  };

  const handlePaymentFailure = (error) => {
    console.error("Payment failed:", error);
    // Handle failed payment, like showing an error message
  };

  const handleShippingSubmit = (data) => {
    console.log("Submitting shipping info:", data); // Log submitted shipping information for debugging
    console.log("Received shipping info for state update:", data);
    console.log("Received shipping info for state update:", data);
    setShippingInfo(data); // Update state with submitted shipping info
    setIsShippingSubmitted(true); // Mark shipping info as submitted
  };

  return (
    <div>
        <h2>Shipping Information</h2>
        <ShippingForm onSubmit={handleShippingSubmit} />

        {isShippingSubmitted && (
            <>
                <h2>Payment</h2>
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        totalPrice={totalPrice}
                        shippingInfo={shippingInfo}
                        cartItems={cart.items}
                    />
                </Elements>
            </>
        )}
    </div>
);
}

export default Payment;
