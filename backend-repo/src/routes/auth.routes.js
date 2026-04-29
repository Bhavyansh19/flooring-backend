// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FILE: server/src/routes/auth.routes.js
// CHANGES:
//   1. Added import for passport
//   2. Added import for googleCallback
//   3. Added 2 new Google OAuth routes at the bottom
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import express from "express";
import passport from "passport"; // ← ADDED
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  addAddress,
  toggleWishlist,
  googleCallback, // ← ADDED
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Existing routes — do not change these
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.post("/address", protect, addAddress);
router.put("/wishlist/:productId", protect, toggleWishlist);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ← ADDED — Google OAuth routes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Step 1: User clicks "Sign in with Google" → redirects to Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Step 2: Google redirects back here after user approves
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  googleCallback,
);

export default router;
