import { Router } from "express";
import {
  getUserProfileController,
  updateUserProfileController,
  getUserStatsController,
  deleteUserAccountController,
} from "../controllers/user-controller";
import { requireAuth } from "../middleware/auth";
import {
  validateUpdateProfile,
  validate,
} from "../middleware/validation";

/**
 * User Routes
 * All routes require authentication (user must be logged in)
 */
const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

// Get user profile
router.get("/profile", getUserProfileController);

// Update user profile
router.put("/update", validateUpdateProfile, validate, updateUserProfileController);

// Get user statistics
router.get("/stats", getUserStatsController);

// Delete user account
router.delete("/delete-account", deleteUserAccountController);

export default router;
