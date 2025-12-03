import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import callRoutes from "./routes/call.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import twilioRoutes from "./routes/twilio.routes.js";
import numberRoutes from "./routes/number.routes.js";
import enterpriseRoutes from "./routes/enterprise.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/numbers", numberRoutes);
app.use("/api/enterprise", enterpriseRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
});
