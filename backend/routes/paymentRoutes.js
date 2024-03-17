const express = require("express");
const router = express.Router();
const stripe = require("stripe")("sk_test_51OnKHEBm4TSYA4w3jGXwNapk40MsOgzCKspf4QKwqQ1yGudhf0BuFx21GmY81DsCPLI4lfikZNoB3jlAIZoSEdhp00w6qAQa9m");

router.post("/charge", async (req, res) => {
  try {
    const { totalPrice, token } = req.body;
    if (!totalPrice || !token) {
      return res.status(400).json({ success: false, message: "Invalid request. Please provide totalPrice and token." });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to the smallest currency unit, e.g., cents for USD
      currency: "usd",
      payment_method: token,
      automatic_payment_methods: { enabled: true },
    });
    
    

    return res.status(200).json({ success: true, message: "Payment successful", paymentIntent });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ success: false, message: "Payment failed", error: error.message });
  }
});



module.exports = router;
