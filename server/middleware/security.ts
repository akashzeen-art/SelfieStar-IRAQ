import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Express, Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * Security Middleware
 * Comprehensive security setup optimized for Netlify + Node deployment
 */

export function applySecurityMiddleware(app: Express) {
  // Helmet - Security headers
  const helmetOptions = env.isProd
    ? {
        // Production: Strict CSP and security headers
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: [
              "'self'",
              "data:",
              "blob:",
              "https://res.cloudinary.com", // Cloudinary images
              "https://*.cloudinary.com",
            ],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://*.cloudinary.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        crossOriginResourcePolicy: { policy: "cross-origin" as const },
        crossOriginEmbedderPolicy: false, // Allow Cloudinary embeds
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      }
    : {
        // Development: Relaxed for Vite HMR
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: false,
      };

  app.use(helmet(helmetOptions));

  // CORS - Configure allowed origins (comma-separated for multiple domains)
  app.use(
    cors({
      origin:
        env.corsOrigin === "*"
          ? true
          : env.corsOrigins.length === 1
            ? env.corsOrigins[0]
            : env.corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      exposedHeaders: ["X-Total-Count"],
      maxAge: 86400, // 24 hours
    })
  );

  // Rate Limiting - Different limits for different endpoints
  // General API rate limit
  app.use(
    "/api",
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: env.isProd ? 100 : 2000, // Stricter in production
      standardHeaders: true,
      legacyHeaders: false,
      message: "Too many requests from this IP, please try again later.",
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === "/api/health" || req.path === "/api/ping";
      },
    })
  );

  // Stricter rate limit for authentication endpoints
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      limit: env.isProd ? 5 : 20, // 5 login attempts per 15 min in production
      standardHeaders: true,
      legacyHeaders: false,
      message: "Too many authentication attempts, please try again later.",
      skipSuccessfulRequests: true, // Don't count successful logins
    })
  );

  // Stricter rate limit for upload endpoints
  app.use(
    "/api/selfies/upload",
    rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      limit: env.isProd ? 20 : 100, // 20 uploads per hour in production
      standardHeaders: true,
      legacyHeaders: false,
      message: "Upload limit exceeded. Please try again later.",
    })
  );

  // Admin endpoints - Very strict rate limiting
  app.use(
    "/api/admin",
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      limit: env.isProd ? 30 : 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: "Too many admin requests, please try again later.",
    })
  );

  // MongoDB Injection Prevention (custom implementation for Express 5 compatibility)
  app.use(mongoSanitizeMiddleware);

  // Note: Body parsing is handled in server/index.ts after security middleware
  // This ensures security headers are set before body parsing

  // Prevent direct folder access
  // In development, skip non-API requests (Vite handles them)
  // In production, block sensitive folder access
  app.use((req, res, next) => {
    // In development, only apply to API routes
    // Vite handles all other requests (including /@vite, /node_modules, etc.)
    if (!env.isProd && !req.path.startsWith("/api")) {
      return next(); // Let Vite handle non-API requests
    }

    // In production, block access to sensitive paths
    const blockedPaths = [
      "/.env",
      "/.git",
      "/server",
      "/storage",
      "/config",
    ];

    // Only block if it's trying to access the directory itself (not files)
    const isBlocked = blockedPaths.some((path) => {
      // Block exact match or directory listing attempts
      return req.path === path || req.path === `${path}/` || (req.path.startsWith(`${path}/`) && !req.path.includes("."));
    });

    if (isBlocked) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    next();
  });

  // Security headers
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "DENY");
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // XSS Protection (legacy, but still useful)
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    // Permissions Policy - Allow camera and microphone for video recording
    res.setHeader(
      "Permissions-Policy",
      "camera=(self), microphone=(self), geolocation=(), interest-cohort=()"
    );

    next();
  });
}

/**
 * Custom MongoDB injection prevention middleware
 * Compatible with Express 5 (only sanitizes req.body, query/params handled by express-validator)
 */
function mongoSanitizeMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    // Sanitize body only (query and params are read-only in Express 5)
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeMongoObject(req.body);
    }

    // Note: req.query and req.params are read-only in Express 5
    // MongoDB injection prevention for query/params is handled by express-validator
    // which validates and sanitizes input before it reaches controllers
  } catch (error) {
    // If sanitization fails, continue anyway (don't block requests)
    // express-validator provides additional protection
  }

  next();
}

/**
 * Recursively sanitize object to prevent MongoDB injection
 */
function sanitizeMongoObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMongoObject(item));
  }

  if (typeof obj === "object") {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Remove $ and . from keys (MongoDB operators)
        const sanitizedKey = key.replace(/[$.]/g, "_");
        sanitized[sanitizedKey] = sanitizeMongoObject(obj[key]);
      }
    }
    return sanitized;
  }

  // For strings, check if they contain MongoDB operators
  if (typeof obj === "string") {
    // Remove $ and . from string values that look like MongoDB operators
    if (obj.startsWith("$") || obj.includes("$where") || obj.includes("$ne")) {
      return obj.replace(/\$/g, "_");
    }
  }

  return obj;
}
