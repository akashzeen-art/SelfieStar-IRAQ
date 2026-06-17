import { RequestHandler } from "express";
import { User } from "../models/User";
import { Selfie } from "../models/Selfie";
import { Challenge } from "../models/Challenge";
import { asyncHandler } from "../utils/http";
import { HttpError } from "../utils/http";
import { sanitizeUser } from "../services/auth-service";

/**
 * User Controllers
 * Handle HTTP requests for user profile and account management
 */

/**
 * Get current user profile
 * GET /api/user/profile
 * Requires: Authentication
 */
export const getUserProfileController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  // Get fresh user data from database
  const user = await User.findById(req.user._id).select("-password -failedLoginAttempts -lockUntil");
  
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json({
    user: sanitizeUser(user),
  });
});

/**
 * Update user profile
 * PUT /api/user/update
 * Body: { username?, name?, profileImage? }
 * Requires: Authentication
 */
export const updateUserProfileController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const { username, name, profileImage } = req.body;
  const updates: any = {};

  // Only allow updating specific fields
  if (username !== undefined) {
    const usernameLower = username.toLowerCase().trim();
    
    // Check if username is already taken by another user
    const existingUser = await User.findOne({ 
      username: usernameLower,
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      throw new HttpError(409, "Username already taken");
    }
    
    updates.username = usernameLower;
  }

  if (name !== undefined) {
    updates.name = name.trim();
  }

  if (profileImage !== undefined) {
    updates.profileImage = profileImage.trim();
  }

  // Update user
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password -failedLoginAttempts -lockUntil");

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json({
    message: "Profile updated successfully",
    user: sanitizeUser(user),
  });
});

/**
 * Get user statistics
 * GET /api/user/stats
 * Requires: Authentication
 */
export const getUserStatsController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const userId = req.user._id;

  // Get user with stats
  const user = await User.findById(userId).select("totalSelfies totalVideos totalScore challengeWins badges").lean();
  
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // Get additional stats using aggregation for performance
  const [selfieStats, challengeStats] = await Promise.all([
    // Selfie stats
    Selfie.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSelfies: { $sum: 1 },
          averageScore: { $avg: "$score" },
          totalLikes: { $sum: "$likes" },
          publicSelfies: {
            $sum: { $cond: ["$isPublic", 1, 0] }
          },
        },
      },
    ]),
    
    // Challenge participation
    Challenge.aggregate([
      {
        $lookup: {
          from: "selfies",
          localField: "_id",
          foreignField: "challengeId",
          as: "submissions",
        },
      },
      {
        $match: {
          "submissions.userId": userId,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          participated: { $gt: [{ $size: "$submissions" }, 0] },
        },
      },
    ]),
  ]);

  const stats = {
    totalSelfies: user.totalSelfies || 0,
    totalVideos: user.totalVideos || 0,
    totalScore: user.totalScore || 0,
    averageScore: user.totalSelfies > 0 
      ? Math.round((user.totalScore / user.totalSelfies) * 10) / 10 
      : 0,
    challengeWins: user.challengeWins || 0,
    badges: user.badges || [],
    selfieStats: selfieStats[0] || {
      totalSelfies: 0,
      averageScore: 0,
      totalLikes: 0,
      publicSelfies: 0,
    },
    challengesParticipated: challengeStats.length,
  };

  res.status(200).json({
    stats,
  });
});

/**
 * Delete user account
 * DELETE /api/user/delete-account
 * Requires: Authentication
 */
export const deleteUserAccountController: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const userId = req.user._id;

  // Delete all user's selfies (this will also update user stats via post-save hook)
  await Selfie.deleteMany({ userId });

  // Delete user account
  await User.findByIdAndDelete(userId);

  res.status(200).json({
    message: "Account deleted successfully",
  });
});
