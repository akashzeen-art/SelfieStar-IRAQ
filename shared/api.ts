/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

// Auth Types
export interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
  profileImage?: string;
  role: "user";
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Selfie Types
export interface Selfie {
  id: string;
  userId: string;
  imageUrl: string;
  score: number;
  challengeId?: string;
  isPublic: boolean;
  caption?: string;
  createdAt: string;
  likes: number;
  comments: number;
}

export interface SelfieUploadRequest {
  image: File;
  caption?: string;
  isPublic: boolean;
  challengeId?: string;
}

export interface SelfieScoreResponse {
  score: number;
  analysis: {
    symmetry: number;
    brightness: number;
    smile: number;
  };
}

// Challenge Types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  bannerImage?: string;
  uniqueCode: string;
  inviteCode?: string;
  startDate: string;
  endDate: string;
  participants: number;
  participantsCount: number;
  creatorId: string;
  creator?: {
    username: string;
    profileImage?: string;
  };
  hashtags: string[];
  createdAt: string;
  isActive: boolean;
  shareUrl?: string;
  isPrivate?: boolean;
  winningReward?: string;
  winnerId?: string;
}

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  userId: string;
  selfieId: string;
  score: number;
  submittedAt: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  profileImage?: string;
  totalScore: number;
  totalSelfies: number;
  averageScore: number;
  challengeWins: number;
}

// Community Types
export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  selfieId: string;
  caption: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: string;
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SubscriptionAccount {
  msisdn: string;
  valid_from?: string;
  valid_to?: string;
  status: 0 | 1;
  service_name?: string;
  pricePoint?: string;
  redirectUrl?: string;
}

export interface SubscriptionStatusResponse {
  status: 0 | 1;
  redirectUrl?: string;
}

export interface UnsubscribeResponse {
  status: 0 | 1;
  redirectUrl?: string;
}

export interface ChallengeDto {
  id: string;
  title: string;
  description: string;
  theme: string;
  startDate: string;
  endDate: string;
  bannerImage?: string;
  participants: number;
  isActive: boolean;
}

export interface SelfieDto {
  id: string;
  ownerId?: string;
  userId?: string;
  imageUrl?: string; // Cloudinary secure URL
  score: number;
  analysis?: {
    baseScore: number;
    brightness: number;
    brightnessBonus: number;
    faceDetected: boolean;
    faceBonus: number;
    symmetry: number;
    smile: number;
  };
  caption?: string;
  isPublic: boolean;
  filter?: "none" | "glow" | "vintage" | "bw" | "smooth";
  challengeId?: string;
  likes: number;
  comments: number;
  createdAt: string;
  mediaToken?: string; // Legacy token-based access (deprecated, use imageUrl)
}

export interface LeaderboardDto {
  rank: number;
  userId: string;
  username: string;
  profileImage?: string;
  totalScore: number;
  totalSelfies: number;
  averageScore: number;
  challengeWins: number;
}

export interface ChallengeParticipationDto {
  id: string;
  challengeId: string;
  userId: string;
  score: number;
  status: "accepted" | "completed";
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Filter Types
export interface Filter {
  id: string;
  name: string;
  description: string;
  category: "beauty" | "artistic" | "color" | "effect" | "ar" | "mask";
  preview?: string;
  isActive: boolean;
  is3D?: boolean; // Whether this is a 3D AR filter
}

export interface FiltersResponse {
  filters: Filter[];
}

export interface FilterResponse {
  filter: Filter;
}

export interface FiltersByCategoryResponse {
  category: string;
  filters: Filter[];
}
