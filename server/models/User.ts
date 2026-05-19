import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

/**
 * User Model
 * Stores user accounts with authentication and profile data
 */

export interface IUser extends Document {
  username: string; // Unique username for display
  name: string; // Full name
  email: string;
  phone?: string;
  password: string; // Hashed password (use bcrypt before saving)
  role: "user";
  profileImage?: string; // Profile image URL
  totalSelfies: number;
  totalVideos: number; // Total videos uploaded
  totalScore: number;
  challengeWins: number; // Number of challenges won
  challengesCreated: number; // Number of challenges created by user
  friends: mongoose.Types.ObjectId[]; // Array of friend user IDs
  badges: string[];
  isBlocked: boolean;
  isVerified: boolean; // Email verification status
  lastLogin?: Date; // Last login timestamp
  failedLoginAttempts: number; // Track failed login attempts
  lockUntil?: Date; // Account lock expiry
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  averageScore: number;
  isLocked: boolean; // Check if account is currently locked
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

interface IUserModel extends Model<IUser> {
  // Add static methods here if needed
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"],
      index: true, // Unique index for username lookups
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      index: true, // Index for search/filtering
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      index: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },
    profileImage: {
      type: String,
      trim: true,
      default: undefined,
    },
    totalSelfies: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // Index for leaderboard sorting
    },
    totalVideos: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // Index for leaderboard sorting (most important)
    },
    challengeWins: {
      type: Number,
      default: 0,
      min: 0,
    },
    challengesCreated: {
      type: Number,
      default: 0,
      min: 0,
      index: true, // Index for leaderboard sorting
    },
    friends: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
      index: true, // Index for friend queries
    },
    badges: {
      type: [String],
      default: [],
    },
    isBlocked: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering blocked users
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true, // Index for filtering verified users
    },
    lastLogin: {
      type: Date,
      default: undefined,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lockUntil: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { 
      virtuals: true,
      transform: function(_doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(_doc, ret) {
        // Remove sensitive fields from object output
        delete ret.password;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      }
    },
  },
);

// Virtual for average score
UserSchema.virtual("averageScore").get(function (this: IUser) {
  const totalMedia = this.totalSelfies + this.totalVideos;
  if (totalMedia === 0) return 0;
  return Math.round((this.totalScore / totalMedia) * 10) / 10;
});

// Virtual to check if account is locked
UserSchema.virtual("isLocked").get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save hook: Hash password before saving
UserSchema.pre("save", async function (next) {
  // Only hash password if it's been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method: Compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method: Increment failed login attempts
UserSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  
  const updates: any = { $inc: { failedLoginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method: Reset login attempts
UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// Compound indexes for leaderboard queries
// Most common query: Get top users by totalScore, then by totalSelfies
UserSchema.index({ totalScore: -1, totalSelfies: -1 }); // Descending for leaderboard
UserSchema.index({ isBlocked: 1, totalScore: -1 }); // Filter blocked users, then sort by score
UserSchema.index({ isVerified: 1, totalScore: -1 }); // Filter verified users for leaderboard

// Text search index for username/name/email search
UserSchema.index({ username: "text", name: "text", email: "text" });

// Ensure indexes are created
UserSchema.set("autoIndex", true);

// Prevent model redefinition during hot reloading
export const User: IUserModel =
  (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>("User", UserSchema);
