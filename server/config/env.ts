import { randomBytes } from "crypto";

function envValue(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : fallback;
}

export const env = {
  jwtSecret: envValue("JWT_SECRET", "dev-jwt-secret-change-me"),
  signedUrlSecret: envValue("SIGNED_URL_SECRET", "dev-signed-secret-change-me"),
  corsOrigin: envValue("CORS_ORIGIN", "*"),
  encryptionKeyHex: envValue("SELFIE_ENCRYPTION_KEY", randomBytes(32).toString("hex")),
  selfieTokenTtlSec: Number(envValue("SELFIE_TOKEN_TTL_SEC", "300")),
  mongoUri: envValue("MONGODB_URI", "mongodb://localhost:27017/selfistar"),
  // Cloudinary configuration
  cloudinaryCloudName: envValue("CLOUDINARY_CLOUD_NAME", ""),
  cloudinaryApiKey: envValue("CLOUDINARY_API_KEY", ""),
  cloudinaryApiSecret: envValue("CLOUDINARY_API_SECRET", ""),
  isProd: process.env.NODE_ENV === "production",
  mselfistarApiBase: envValue(
    "MSELFISTAR_API_BASE",
    "https://mselfistar.com/prod/Selfiestar",
  ),
  mselfistarEnabled: process.env.MSELFISTAR_ENABLED !== "false",
};
