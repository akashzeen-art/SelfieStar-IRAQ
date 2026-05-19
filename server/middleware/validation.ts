import { body, param, query, ValidationChain, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http";

/**
 * Express-Validator Middleware
 * Input validation and sanitization for API endpoints
 */

/**
 * Validation error handler
 */
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.type === "field" ? err.path : "unknown",
      message: err.msg,
    }));
    throw new HttpError(400, `Validation failed: ${errorMessages.map((e) => e.message).join(", ")}`);
  }
  next();
};

/**
 * Auth Validation
 */
export const validateLogin = [
  body("email").optional().trim().isEmail().withMessage("Valid email is required").normalizeEmail().toLowerCase(),
  body("phone").optional().trim(),
  body("password").optional().trim(),
  (req: any, res: any, next: any) => {
    if (!req.body.email && !req.body.phone && !req.body.username) {
      return res.status(400).json({ message: "Phone number or email is required" });
    }
    next();
  },
  validate,
];

export const validateRegister = [
  body("email").optional().trim().isEmail().withMessage("Valid email is required").normalizeEmail().toLowerCase(),
  body("phone").optional().trim().isMobilePhone("any").withMessage("Valid phone number is required"),
  body("username").trim().isLength({ min: 3, max: 30 }).withMessage("Username must be between 3 and 30 characters").matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores").escape(),
  body("password").trim().isLength({ min: 8 }).withMessage("Password must be at least 8 characters").matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter").matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter").matches(/\d/).withMessage("Password must contain at least one number"),
  (req: any, res: any, next: any) => {
    if (!req.body.email && !req.body.phone) {
      return res.status(400).json({ message: "Phone number or email is required" });
    }
    next();
  },
  validate,
];

/**
 * Challenge Validation
 */
export const validateCreateChallenge = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be between 3 and 120 characters")
    .escape(), // XSS prevention
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters")
    .escape(), // XSS prevention
  body("theme")
    .optional()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Theme cannot exceed 80 characters")
    .escape(), // XSS prevention
  body("startDate")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("duration")
    .isInt({ min: 1 })
    .withMessage("Duration is required")
    .custom((value) => {
      const d = Number(value);
      if (![1, 3, 7].includes(d)) {
        throw new Error("Duration must be 1, 3, or 7 days");
      }
      return true;
    }),
  body("winningReward")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Winning reward must be between 3 and 200 characters")
    .escape(),
  body("banner")
    .optional()
    .trim()
    .isURL()
    .withMessage("Banner must be a valid URL")
    .escape(),
  body("hashtags")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Hashtags must be an array with maximum 10 items"),
  body("hashtags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each hashtag must be between 1 and 30 characters")
    .escape(),
  validate,
];

export const validateUpdateChallenge = [
  param("id")
    .trim()
    .isMongoId()
    .withMessage("Invalid challenge ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Title must be between 3 and 120 characters")
    .escape(),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters")
    .escape(),
  body("theme")
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Theme must be between 2 and 80 characters")
    .escape(),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        if (endDate <= startDate) {
          throw new Error("End date must be after start date");
        }
      }
      return true;
    }),
  body("banner")
    .optional()
    .trim()
    .isURL()
    .withMessage("Banner must be a valid URL")
    .escape(),
  body("hashtags")
    .optional()
    .isArray()
    .withMessage("Hashtags must be an array"),
  body("hashtags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each hashtag must be between 1 and 30 characters")
    .escape(),
  validate,
];

/**
 * Selfie Validation
 */
export const validateUploadSelfie = [
  body("caption")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Caption cannot exceed 500 characters")
    .escape(), // XSS prevention
  body("isPublic")
    .optional()
    .isBoolean()
    .withMessage("isPublic must be a boolean")
    .toBoolean(),
  body("filter")
    .optional()
    .isIn(["none", "glow", "vintage", "bw", "smooth"])
    .withMessage("Invalid filter type"),
  body("challengeId")
    .optional()
    .trim()
    .isMongoId()
    .withMessage("Invalid challenge ID"),
  validate,
];

export const validateComment = [
  param("id")
    .trim()
    .isMongoId()
    .withMessage("Invalid selfie ID"),
  body("text")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Comment must be between 1 and 500 characters")
    .escape(), // XSS prevention
  validate,
];

/**
 * Leaderboard Validation
 */
export const validateLeaderboardQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
  validate,
];

/**
 * User Profile Validation
 */
export const validateUpdateProfile = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-z0-9_]+$/)
    .withMessage("Username can only contain lowercase letters, numbers, and underscores")
    .toLowerCase()
    .escape(), // XSS prevention
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .escape(), // XSS prevention
  body("profileImage")
    .optional()
    .trim()
    .custom((value) => {
      if (!value) return true; // Allow empty/undefined
      // Allow both URLs and base64 data URLs
      if (value.startsWith("data:image/")) {
        return true; // Base64 data URL is valid
      }
      // Check if it's a valid URL
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage("Profile image must be a valid URL or base64 data URL"),
  validate,
];
