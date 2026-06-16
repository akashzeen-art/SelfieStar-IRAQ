import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  if (req.path === "/api" || req.path.startsWith("/api/")) {
    res.status(404).json({ message: `Route not found: ${req.path}` });
    return;
  }
  next();
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Log error for debugging
  if (err instanceof Error) {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
  } else {
    console.error("Unknown error:", err);
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed",
      issues: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message, ...err.data });
    return;
  }

  // Generic error response
  res.status(500).json({ 
    message: "Internal server error",
    ...(process.env.NODE_ENV !== "production" && err instanceof Error && {
      error: err.message,
      stack: err.stack,
    }),
  });
}
