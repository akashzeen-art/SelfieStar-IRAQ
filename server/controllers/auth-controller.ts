import { RequestHandler } from "express";
import { loginUser, registerUser, sanitizeUser } from "../services/auth-service";
import { asyncHandler } from "../utils/http";

/**
 * Authentication Controllers
 * Handle HTTP requests for registration, login, and user info
 */

/**
 * Register a new user
 * POST /api/auth/register
 * Body: { email, username, password }
 */
export const registerController: RequestHandler = asyncHandler(async (req, res) => {
  // Input is already validated by express-validator middleware
  // express-validator normalizes and sanitizes the input
  const input = {
    email: req.body.email,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password,
  };

  const result = await registerUser(input);

  // Return 201 Created with token and user data
  res.status(201).json({
    message: "User registered successfully",
    ...result,
  });
});

/**
 * Login user
 * POST /api/auth/login
 * Body: { email?, username?, password }
 * Supports login with either email or username
 */
export const loginController: RequestHandler = asyncHandler(async (req, res) => {
  // Input is already validated by express-validator middleware
  // express-validator normalizes and sanitizes the input
  const input = {
    email: req.body.email,
    phone: req.body.phone,
    username: req.body.username,
    password: req.body.password,
  };

  const result = await loginUser(input);

  // Return 200 OK with token and user data
  res.status(200).json({
    message: "Login successful",
    ...result,
  });
});

/**
 * Get current user info
 * GET /api/auth/me
 * Requires: Authentication (Bearer token)
 */
export const meController: RequestHandler = asyncHandler(async (req, res) => {
  // User is attached to req by requireAuth middleware
  // requireAuth already ensures user exists, so this check is defensive
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Return sanitized user data
  res.status(200).json({
    user: sanitizeUser(req.user),
  });
});
