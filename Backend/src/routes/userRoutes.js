const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

// GET /api/users/profile?email=xxx - Get user by email (for profile lookup)
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("Looking for user with email:", email);

    const user = await User.findOne({ email: email }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user by email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// POST /api/users/google-auth - Create user from Google Auth
router.post("/google-auth", async (req, res) => {
  try {
    const { name, email, profilePic, googleId } = req.body;

    console.log("Creating user with Google Auth:", { name, email, googleId });

    // Check if user already exists
    let user = await User.findOne({ email: email });

    if (user) {
      console.log("User already exists:", user._id);
      return res.status(200).json({
        success: true,
        message: "User already exists",
        user: user,
      });
    }

    // Create new user
    user = new User({
      name: name,
      email: email,
      profilePic: profilePic || "",
      googleId: googleId,
      authProvider: "google",
      isActive: true,
      profileCompleted: false,
      isOnboardingComplete: false,
    });

    await user.save();

    console.log("New user created:", user._id);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error("Google auth user creation error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// PUT /api/users/profile/:id - Update user profile
router.put("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log("Updating user profile:", id, updateData);

    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData._id;
    delete updateData.email; // Don't allow email changes via this route

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// GET /api/users/:id - Get user by ID (keep this for other functionality)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the ID is 'profile' - redirect to profile route
    if (id === "profile") {
      return res.status(400).json({
        success: false,
        message: "Use /api/users/profile?email=xxx instead",
      });
    }

    console.log("Getting user by ID:", id);

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// PUT /api/users/:id - Update user by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this route
    delete updateData.password;
    delete updateData._id;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
});

// GET /api/users/:id/events - Get events for a user
router.get("/:id/events", async (req, res) => {
  try {
    const { id: userId } = req.params;

    console.log("Fetching events for user:", userId);

    // Find all events where this user is registered
    const Event = require("../models/eventModel");

    const events = await Event.find({
      "registeredUsers.userId": userId,
    }).select(
      "title description date time venue category image author status registeredUsers"
    );

    console.log("Found registered events:", events.length);

    // Transform events to include user's registration info
    const userEvents = events.map((event) => {
      const userRegistration = event.registeredUsers.find(
        (reg) => reg.userId.toString() === userId
      );

      return {
        _id: event._id,
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        venue: event.venue,
        category: event.category,
        image: event.image,
        author: event.author,
        status: event.status,
        registrationStatus: userRegistration?.status || "registered",
        registeredAt: userRegistration?.registeredAt,
      };
    });

    res.status(200).json({
      success: true,
      events: userEvents,
      count: userEvents.length,
    });
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user events",
      error: error.message,
    });
  }
});

module.exports = router;
