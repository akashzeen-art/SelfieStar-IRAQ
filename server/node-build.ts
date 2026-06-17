import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import { connectDatabase } from "./config/db";
import * as express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = createServer();
const port = process.env.PORT || 3000;

// Connect to MongoDB before starting server
connectDatabase()
  .then(() => {
    console.log("✅ Database connection established");
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    // Continue anyway - app can use in-memory fallback
  });

// In production, serve the built SPA files
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes (Express 5: named wildcard)
app.get("/{*path}", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
