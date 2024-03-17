require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import CORS
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes"); // Make sure the path matches where you saved your routes
const departmentRoutes = require("./routes/departmentRoutes"); // Adjust the path as necessary
const categoryRoutes = require("./routes/categoryRoutes"); // Adjust the path as necessary
const attributesRouter = require("./routes/attributesRouter"); // This line is added
const productRoutes = require("./routes/productRoutes"); // Adjust the path as necessary
const cartRoutes = require("./routes/cartRoutes"); // Adjust the path as necessary
const orderRoutes = require("./routes/orderRoutes"); // Adjust the import path as necessary
const favoriteRoutes = require("./routes/favoriteRoutes"); // Adjust the path as necessary
const shippingRoutes = require("./routes/shippingRoutes"); // Import the shipping route
const trackingRoutes = require('./routes/trackingRoutes');

const app = express();
app.use(cors()); // Enable CORS for all requests
app.use(express.json());
const paymentRoutes = require("./routes/paymentRoutes"); // Adjust the path as necessary
const stripe = require("stripe")(
  "sk_test_51OnKHEBm4TSYA4w3jGXwNapk40MsOgzCKspf4QKwqQ1yGudhf0BuFx21GmY81DsCPLI4lfikZNoB3jlAIZoSEdhp00w6qAQa9m"
); // Replace 'YOUR_STRIPE_SECRET_KEY' with your actual secret key

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((error) => console.error(error));

app.use("/auth", authRoutes);
app.use("/admin", userRoutes);
app.use("/admin/departments", departmentRoutes);
app.use("/admin/categories", categoryRoutes);
app.use("/admin/attributes", attributesRouter); // And this line
app.use("/admin/products", productRoutes); // Use product routes
app.use("/api/cart", cartRoutes); // Use the cart routes
app.use("/payment", paymentRoutes); // Mount the payment routes
app.use("/admin/orders", orderRoutes);
app.use("/api/favorites", favoriteRoutes); // Use the favorites routes
app.use("/shipping", shippingRoutes);
app.use(trackingRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
