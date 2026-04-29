// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: server/src/passport.js  (NEW FILE — create this)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName || "Google";
        const lastName = profile.name?.familyName || "User";
        const avatar = profile.photos?.[0]?.value;

        if (!email) return done(null, false);

        // Check if user already exists by email or Google ID
        let user = await User.findOne({
          $or: [{ email }, { googleId: profile.id }],
        });

        if (user) {
          // Update missing fields if they came via Google later
          if (!user.googleId) user.googleId = profile.id;
          if (!user.avatar && avatar) user.avatar = avatar;
          await user.save();
          return done(null, user);
        }

        // New user — create account
        // Random password because they will always login via Google
        const randomPassword =
          Math.random().toString(36) +
          Math.random().toString(36).toUpperCase() +
          "!1Aa";

        user = await User.create({
          firstName,
          lastName,
          email,
          avatar,
          googleId: profile.id,
          password: randomPassword,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
