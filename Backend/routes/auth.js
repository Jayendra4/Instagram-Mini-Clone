
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const createToken = (userId) => {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

const buildUserResponse = (userDoc) => {
  if (!userDoc) return null;
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  return user;
};

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    // Check duplicates
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username: username.toLowerCase(),
      fullName: fullName || username,
      email: email.toLowerCase(),
      password: hashed,
    });

    const token = createToken(newUser._id);

    res.status(201).json({ 
      token, 
      user: buildUserResponse(newUser) 
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = createToken(user._id);

    res.json({ 
      token, 
      user: buildUserResponse(user) 
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      success: true, 
      user: buildUserResponse(user) 
    });
  } catch (err) {
    console.error("Auth check error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if already following
    const alreadyFollowing = currentUser.following.includes(targetUserId);

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this user." });
    }

    // Update arrays
    await currentUser.updateOne({ $push: { following: targetUserId } });
    await targetUser.updateOne({ $push: { followers: currentUserId } });

    res.json({
      message: "User followed successfully",
      currentUser: buildUserResponse(await User.findById(currentUserId)),
      targetUser: buildUserResponse(await User.findById(targetUserId)),
    });

  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Server error while following." });
  }
});

router.post("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update arrays using pull
    await currentUser.updateOne({ $pull: { following: targetUserId } });
    await targetUser.updateOne({ $pull: { followers: currentUserId } });

    res.json({
      message: "User unfollowed successfully",
      currentUser: buildUserResponse(await User.findById(currentUserId)),
      targetUser: buildUserResponse(await User.findById(targetUserId)),
    });

  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Server error while unfollowing." });
  }
});

router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const profileUserId = req.params.id;

    const user = await User.findById(profileUserId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await Post.find({ user: profileUserId })
      .sort({ createdAt: -1 })
      .lean();

    const profile = {
      ...user,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      posts,
      postsCount: posts.length
    };

    res.json(profile);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;