import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Selfie Model
 * Stores user selfies with scores and metadata
 */

export interface ISelfie extends Document {
  userId: mongoose.Types.ObjectId; // Reference to User
  challengeId?: mongoose.Types.ObjectId; // Optional reference to Challenge
  imageUrl: string; // Secure Cloudinary URL
  publicId?: string; // Cloudinary public_id for deletion
  score: number;
  isPublic: boolean;
  caption?: string;
  likes: number;
  comments: number;
  expiresAt?: Date; // Optional TTL for temporary images
  createdAt: Date;
  updatedAt: Date;
}

interface ISelfieModel extends Model<ISelfie> {
  // Add static methods here if needed
  findByUser(userId: string): Promise<ISelfie[]>;
  findPublic(limit?: number, skip?: number): Promise<ISelfie[]>;
  findByChallenge(challengeId: string): Promise<ISelfie[]>;
}

const SelfieSchema = new Schema<ISelfie>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Index for user's selfies queries
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: "Challenge",
      default: undefined,
      index: true, // Index for challenge submissions
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      default: undefined,
      index: true, // Index for Cloudinary deletion operations
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be negative"],
      max: [100, "Score cannot exceed 100"],
      index: true, // Index for score-based queries and leaderboard
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true, // Index for public/private filtering
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, "Caption cannot exceed 500 characters"],
      default: undefined,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // Index for sorting by popularity
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: undefined,
      index: { expireAfterSeconds: 0 }, // TTL index for automatic cleanup
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Compound indexes for common queries
// User's selfies sorted by date (most recent first)
SelfieSchema.index({ userId: 1, createdAt: -1 });

// Public selfies sorted by score (for leaderboard)
SelfieSchema.index({ isPublic: 1, score: -1, createdAt: -1 });

// Challenge submissions sorted by score
SelfieSchema.index({ challengeId: 1, score: -1 });

// Popular selfies (public, sorted by likes)
SelfieSchema.index({ isPublic: 1, likes: -1, createdAt: -1 });

// User's public selfies
SelfieSchema.index({ userId: 1, isPublic: 1, createdAt: -1 });

// Text search on captions
SelfieSchema.index({ caption: "text" });

// Static method to find selfies by user
SelfieSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find public selfies
SelfieSchema.statics.findPublic = function (limit = 20, skip = 0) {
  return this.find({ isPublic: true })
    .populate("userId", "name email") // Populate user info
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to find selfies by challenge
SelfieSchema.statics.findByChallenge = function (challengeId: string) {
  return this.find({ challengeId }).sort({ score: -1, createdAt: -1 });
};

// Middleware: Update user's totalSelfies and totalScore when selfie is created
// Track if document is new using a document property
SelfieSchema.pre("save", function (next) {
  // Store isNew state before save
  (this as any).__isNew = this.isNew;
  next();
});

SelfieSchema.post("save", async function (doc: ISelfie) {
  // Check if this was a new document (before save)
  if ((doc as any).__isNew) {
    // Increment user's total selfies and add to total score
    // Use efficient atomic update with $inc operator
    await mongoose.model("User").findByIdAndUpdate(
      doc.userId,
      {
        $inc: {
          totalSelfies: 1,
          totalScore: doc.score,
        },
      },
      { new: false } // Don't return updated document for performance
    );

  }
  // Clean up temporary property
  delete (doc as any).__isNew;
});

// Middleware: Update user's stats when selfie is deleted
SelfieSchema.post("findOneAndDelete", async function (doc: ISelfie | null) {
  if (doc) {
    await mongoose.model("User").findByIdAndUpdate(doc.userId, {
      $inc: {
        totalSelfies: -1,
        totalScore: -doc.score,
      },
    });

  }
});

// Ensure indexes are created
SelfieSchema.set("autoIndex", true);

// Prevent model redefinition during hot reloading
export const Selfie: ISelfieModel =
  (mongoose.models.Selfie as ISelfieModel) ||
  mongoose.model<ISelfie, ISelfieModel>("Selfie", SelfieSchema);
