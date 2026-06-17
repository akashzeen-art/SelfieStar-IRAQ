import "dotenv/config";
import express from "express";
import { handleDemo } from "./routes/demo";
import authRoutes from "./routes/auth";
import challengeRoutes from "./routes/challenges";
import userChallengeRoutes from "./routes/user-challenges";
import selfieRoutes from "./routes/selfies";
import videoRoutes from "./routes/video";
import userRoutes from "./routes/user";
import friendRoutes from "./routes/friends";
import filterRoutes from "./routes/filters";
import subscriptionRoutes from "./routes/subscription";
import { applySecurityMiddleware } from "./middleware/security";
import { sanitizeInput } from "./middleware/xss";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { connectDatabase } from "./config/db";

export function createServer() {
  const app = express();
  
  // Connect to MongoDB Atlas on server creation
  connectDatabase().catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
    // Don't crash the server, but log the error
    // The app can still run with in-memory storage as fallback
  });

  // Security Middleware (must be first)
  applySecurityMiddleware(app);
  
  // Body parsing with size limits
  app.use(express.json({ limit: "10mb" })); // Limit JSON payload size
  app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Limit URL-encoded payload size
  
  // XSS Prevention (after body parsing, so we can sanitize req.body)
  app.use(sanitizeInput);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", async (_req, res) => {
    const { getConnectionStatus } = await import("./config/db");
    const dbStatus = getConnectionStatus();
    res.json({
      status: "ok",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/api/demo", handleDemo);
  app.use("/api/auth", authRoutes); // User authentication
  app.use("/api/user", userRoutes); // User profile and account management
  app.use("/api/friends", friendRoutes); // Friend management
  app.use("/api/challenges", challengeRoutes); // Legacy challenge routes (for compatibility)
  app.use("/api/challenge", userChallengeRoutes); // User-driven challenge routes
  app.use("/api/selfies", selfieRoutes);
  app.use("/api/video", videoRoutes);
  app.use("/api/filters", filterRoutes);
  app.use("/api/subscription", subscriptionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
