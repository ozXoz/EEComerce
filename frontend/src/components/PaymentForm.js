import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import AuthService from "../auth/AuthService";
import { useLocation, useNavigate } from "react-router-dom";
import { createOrderFromCart } from "./orderService";

const CARD_OPTIONS = {
  iconStyle: "solid",
  style: {
    base: {
      iconColor: "#c4f0ff",
      color: "#fff",
      fontWeight: 500,
      fontFamily: "Roboto, Open Sans, Segoe UI, sans-serif",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      "::placeholder": { color: "#87bbfd" },
    },
    invalid: {
      iconColor: "#ffc7ee",
      color: "#ffc7ee",
    },
  },
};

function PaymentForm({ onSuccess, onFailure, shippingInfo, cartItems }) {
  const navigate = useNavigate();
  const location = useLocation();
  const totalPrice = location.state?.totalPrice ?? 0;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Starting payment process...");

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });
  
      if (error) {
        throw new Error(error.message);
      }
      console.log("Payment method created:", paymentMethod);

      // Make the payment
      console.log("Attempting payment with totalPrice:", totalPrice);
      const paymentResponse = await axios.post("http://localhost:3000/payment/charge", {
        totalPrice,
        token: paymentMethod.id,
      }, {
        headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
      });
      console.log("Payment response:", paymentResponse.data);

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || "Payment failed");
      }

      console.log("Payment successful");

      // Save shipping information if present
      let shippingId = null;
      if (shippingInfo) {
        console.log("Submitting shipping info:", shippingInfo);
        const shippingData = { ...shippingInfo, userId: AuthService.getCurrentUser().userId };
        const shippingResponse = await axios.post("http://localhost:3000/shipping/add", shippingData, {
          headers: { Authorization: `Bearer ${AuthService.getCurrentUser().token}` },
        });
        console.log("Shipping response:", shippingResponse.data);

        if (!shippingResponse.data._id) {
          throw new Error("Failed to insert shipping information into the database.");
        }

        shippingId = shippingResponse.data._id;
        console.log("Shipping ID received:", shippingId);
      } else {
        console.log("No shipping info provided");
      }

      // Create the order with the shippingId
      console.log("Creating order with shipping ID:", shippingId);
      const orderData = {
        items: cartItems.map(item => ({ productId: item.productId, quantity: item.quantity })),
        totalPrice,
        shippingId,
      };

      const orderResponse = await createOrderFromCart(orderData);
      console.log("Order response:", orderResponse.data);

      if (!orderResponse.data || !orderResponse.data._id) {
        throw new Error("Order creation response did not include an order ID.");
      }

      console.log("Order created successfully:", orderResponse.data);
      onSuccess && onSuccess(orderResponse.data);
      navigate(`/order-confirmation`, { state: { orderId: orderResponse.data._id } });
    } catch (error) {
      console.error("Error during payment or order processing:", error);
      setError(error.message || "An unknown error occurred");
      onFailure && onFailure(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!loading && !error ? (
        <form onSubmit={handleSubmit}>
          <fieldset className="FormGroup" disabled={loading}>
            <div className="FormRow">
              <CardElement options={CARD_OPTIONS} />
            </div>
            <div style={{ marginTop: "10px" }}>
              <p>Total Price: ${totalPrice.toFixed(2)}</p>
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </fieldset>
          <button disabled={!stripe || loading}>Proceed to Payment</button>
        </form>
      ) : (
        <div>
          <h2>{error ? "Payment Error: " + error : "Processing Payment..."}</h2>
        </div>
      )}
    </>
  );
}

export default PaymentForm;
