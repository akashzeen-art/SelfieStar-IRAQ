import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, IUser } from "../models/User";
import { HttpError } from "../utils/http";
import { checkSubscriptionStatus, toMsisdn } from "../services/mselfistar-service";

/**
 * Authentication Service
 * Handles user registration, login, JWT token generation, and password hashing
 * Optimized for low-cost hosting with efficient queries
 */

type AuthTokenPayload = {
  sub: string;
  role: IUser["role"];
  email: string;
  phone?: string;
  portal?: boolean;
};

function sanitizePortalUser(msisdn: string) {
  return {
    id: msisdn,
    username: msisdn,
    name: msisdn,
    email: "",
    phone: msisdn,
    portal: true,
    role: "user" as const,
    profileImage: undefined,
    totalSelfies: 0,
    totalVideos: 0,
    totalScore: 0,
    challengeWins: 0,
    averageScore: 0,
    badges: [] as string[],
    isVerified: true,
    lastLogin: undefined,
    createdAt: new Date().toISOString(),
    isBlocked: false,
  };
}

function issuePortalToken(msisdn: string) {
  const payload: AuthTokenPayload = {
    sub: `portal:${msisdn}`,
    role: "user",
    email: "",
    phone: msisdn,
    portal: true,
  };
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });
  return { token, user: sanitizePortalUser(msisdn) };
}

function buildPortalAuthUser(msisdn: string): IUser {
  const now = new Date();
  return {
    _id: msisdn as unknown as IUser["_id"],
    username: msisdn,
    name: msisdn,
    email: "",
    phone: msisdn,
    password: "",
    role: "user",
    totalSelfies: 0,
    totalVideos: 0,
    totalScore: 0,
    challengeWins: 0,
    challengesCreated: 0,
    friends: [],
    badges: [],
    isBlocked: false,
    isVerified: true,
    failedLoginAttempts: 0,
    createdAt: now,
    updatedAt: now,
    averageScore: 0,
    isLocked: false,
    comparePassword: async () => false,
    incrementLoginAttempts: async () => {},
    resetLoginAttempts: async () => {},
  } as unknown as IUser;
}

/**
 * Register a new user
 * - Validates email uniqueness
 * - Hashes password with bcrypt (10 rounds - good balance of security/performance)
 * - Creates user in MongoDB
 * - Returns JWT token and sanitized user data
 */
export async function registerUser(input: {
  email?: string;
  phone?: string;
  username: string;
  password: string;
  name?: string;
}) {
  const email = input.email?.toLowerCase().trim();
  const phone = input.phone ? toMsisdn(input.phone.trim()) : undefined;
  const username = input.username.toLowerCase().trim();
  const name = input.name?.trim() || username;

  if (email) {
    const existingEmail = await User.findOne({ email }).select("_id").lean();
    if (existingEmail) throw new HttpError(409, "Email already registered");
  }

  if (phone) {
    const existingPhone = await User.findOne({
      phone: { $in: [phone, `+${phone}`] },
    }).select("_id").lean();
    if (existingPhone) throw new HttpError(409, "Phone number already registered");
  }

  const existingUsername = await User.findOne({ username }).select("_id").lean();
  if (existingUsername) throw new HttpError(409, "Username already taken");

  const user = new User({
    username, name,
    email: email || undefined,
    phone: phone || undefined,
    password: input.password,
    role: "user",
    totalSelfies: 0, totalVideos: 0, totalScore: 0,
    challengeWins: 0, badges: [], isBlocked: false, isVerified: false, failedLoginAttempts: 0,
  });

  try {
    await user.save();
  } catch (error: any) {
    // Handle potential race-condition duplicate key errors gracefully
    if (error?.code === 11000) {
      if (error.keyPattern?.email) {
        throw new HttpError(409, "Email already registered");
      }
      if (error.keyPattern?.username) {
        throw new HttpError(409, "Username already taken");
      }
    }
    throw error;
  }

  // Issue JWT token
  return issueAuthToken(user);
}

/** Iraq portal login: mselfistar API only — no MongoDB user record */
export async function loginUser(input: { email?: string; phone?: string; password?: string }) {
  if (input.phone) {
    const phoneMsisdn = toMsisdn(input.phone.trim());
    if (!phoneMsisdn) {
      throw new HttpError(400, "Invalid mobile number");
    }

    const result = await checkSubscriptionStatus(phoneMsisdn);
    if (!result.subscribed) {
      throw new HttpError(403, "Subscription required to access the portal", {
        status: 0,
        redirectUrl: "redirectUrl" in result ? result.redirectUrl : undefined,
      });
    }

    return issuePortalToken(phoneMsisdn);
  }

  const identifier = input.email?.toLowerCase().trim();
  const user = await User.findOne({ email: identifier }).select("+password").lean();

  if (!user) {
    throw new HttpError(401, "No account found with this email.");
  }

  if (user.isBlocked) {
    throw new HttpError(403, "Account is not active. Please contact support.");
  }

  // If password provided, verify it; if phone-only login skip password check
  if (input.password && input.password.trim()) {
    const passwordMatch = await bcrypt.compare(input.password.trim(), user.password);
    if (!passwordMatch) {
      throw new HttpError(401, "Invalid credentials");
    }
  }

  // Convert lean document to IUser for token generation
  const userDoc = await User.findById(user._id);
  if (!userDoc) {
    throw new HttpError(401, "User not found");
  }

  // Issue token with role (role is included in JWT payload)
  return issueAuthToken(userDoc);
}

/**
 * Generate JWT token for authenticated user
 * - Token expires in 7 days (configurable)
 * - Includes user ID, role, and email in payload
 * - Signed with JWT_SECRET from environment
 */
function issueAuthToken(user: IUser) {
  const phone = user.phone ? toMsisdn(user.phone) : undefined;
  const payload: AuthTokenPayload = {
    sub: user._id.toString(),
    role: user.role,
    email: user.email || "",
    ...(phone ? { phone, portal: false } : {}),
  };

  // Token expires in 7 days (good balance for user experience and security)
  // For production, consider shorter expiration (1-3 days) with refresh tokens
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: "7d" });

  return {
    token,
    user: sanitizeUser(user),
  };
}

/**
 * Verify JWT token and return user
 * - Validates token signature
 * - Checks token expiration
 * - Verifies user still exists and is not blocked
 * - Returns user data for middleware
 */
export async function verifyToken(token: string): Promise<IUser> {
  let decoded: AuthTokenPayload;

  try {
    decoded = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, "Invalid token");
    }
    throw new HttpError(401, "Token verification failed");
  }

  if (decoded.portal && decoded.phone) {
    return buildPortalAuthUser(decoded.phone);
  }

  // Find user by ID (optimized query with index)
  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new HttpError(401, "User not found");
  }

  if (user.isBlocked) {
    throw new HttpError(403, "Account is blocked");
  }

  return user;
}

/**
 * Sanitize user data for API responses
 * - Removes sensitive fields (password)
 * - Returns only safe user information
 */
export function sanitizeUser(user: IUser | { _id: any; username?: string; name: string; email: string; role: string; createdAt: Date; isBlocked: boolean; phone?: string; portal?: boolean; totalSelfies?: number; totalVideos?: number; totalScore?: number; challengeWins?: number; badges?: string[]; profileImage?: string; isVerified?: boolean; lastLogin?: Date }) {
  const totalMedia = ("totalSelfies" in user ? user.totalSelfies || 0 : 0) + ("totalVideos" in user ? user.totalVideos || 0 : 0);
  const totalScore = "totalScore" in user ? user.totalScore || 0 : 0;
  
  return {
    id: user._id.toString(),
    username: "username" in user && user.username ? user.username : user.name, // Use username if available, fallback to name
    name: user.name,
    email: user.email,
    phone: "phone" in user && user.phone ? toMsisdn(String(user.phone)) || user.phone : undefined,
    portal: Boolean(user.phone && !user.email),
    role: user.role,
    profileImage: "profileImage" in user ? user.profileImage : undefined,
    totalSelfies: "totalSelfies" in user ? user.totalSelfies || 0 : 0,
    totalVideos: "totalVideos" in user ? user.totalVideos || 0 : 0,
    totalScore: totalScore,
    challengeWins: "challengeWins" in user ? user.challengeWins || 0 : 0,
    averageScore: totalMedia > 0
      ? Math.round((totalScore / totalMedia) * 10) / 10
      : 0,
    badges: "badges" in user ? user.badges || [] : [],
    isVerified: "isVerified" in user ? user.isVerified || false : false,
    lastLogin: "lastLogin" in user ? user.lastLogin : undefined,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
    isBlocked: user.isBlocked,
  };
}
