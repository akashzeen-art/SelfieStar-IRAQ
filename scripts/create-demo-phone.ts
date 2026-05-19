import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../server/models/User";
import { connectDatabase } from "../server/config/db";

async function createDemoPhoneAccount() {
  try {
    await connectDatabase();
    console.log("✅ Connected to MongoDB\n");

    const phone = "+919876543210";
    const username = "demouser";

    let user = await User.findOne({ phone });

    if (user) {
      console.log(`ℹ️  Demo phone account already exists: ${phone}`);
    } else {
      // Check if username taken
      const existingUsername = await User.findOne({ username });
      const finalUsername = existingUsername ? "demouser1" : username;

      user = new User({
        name: "Demo User",
        username: finalUsername,
        phone,
        email: undefined,
        password: "DemoPass123!", // fallback password (not used in phone-only login)
        role: "user",
        totalSelfies: 0,
        totalScore: 0,
        badges: [],
        isBlocked: false,
        isVerified: true,
      });

      await user.save();
      console.log(`✅ Demo phone account created`);
    }

    console.log(`\n📱 Demo Login:`);
    console.log(`   Phone: ${phone}`);
    console.log(`   Country Code: +91`);
    console.log(`   Number: 9876543210`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

createDemoPhoneAccount();
