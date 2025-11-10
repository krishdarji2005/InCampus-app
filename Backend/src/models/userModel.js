const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic Auth Info
    auth0Id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // This creates the index
      lowercase: true,
    },
    googleId: {
      type: String,
      unique: true, // This creates the index
      sparse: true,
    },
    // Profile Information
    profilePic: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^\+?[\d\s\-\(\)]{10,15}$/.test(v);
        },
        message: "Invalid phone number format",
      },
    },

    // Academic Information
    college: {
      type: String,
      default: "K.J. Somaiya Institute of Technology",
    },
    department: {
      type: String,
      enum: [
        "Computer Science",
        "Information Technology",
        "Electronics & Telecommunication",
        "Mechanical Engineering",
        "Civil Engineering",
        "Electrical Engineering",
        "Chemical Engineering",
        "Biotechnology",
        "Artificial Intelligence & Data Science",
        "Computer Science & Engineering (AI & ML)",
        "Other",
      ],
      default: "",
    },
    year: {
      type: String,
      enum: [
        "1st Year",
        "2nd Year",
        "3rd Year",
        "4th Year",
        "Postgraduate",
        "Faculty",
      ],
      default: "",
    },
    rollNumber: {
      type: String,
      unique: true,
      sparse: true,
      validate: {
        validator: function (v) {
          return !v || /^[A-Z0-9]{8,15}$/.test(v);
        },
        message: "Invalid roll number format",
      },
      default: "",
    },

    // Interests and Preferences
    interests: [
      {
        type: String,
        enum: [
          "Technical",
          "Cultural",
          "Sports",
          "Academic",
          "Workshop",
          "Seminar",
          "Competition",
          "Social",
          "Art & Craft",
          "Music",
          "Dance",
          "Literature",
          "Entrepreneurship",
          "Leadership",
        ],
      },
    ],

    // Profile Status
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // Social Links
    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      instagram: { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },

    // System Fields
    role: {
      type: String,
      enum: ["student", "faculty", "admin", "committee"],
      default: "student",
    },
    authProvider: {
      type: String,
      enum: ["google", "local"],
      default: "google",
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Event Related
    registeredEvents: [
      {
        eventId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Event",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "confirmed", "cancelled"],
          default: "pending",
        },
      },
    ],
    createdEvents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],

    // Notifications
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      eventReminders: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });
userSchema.index({ department: 1, year: 1 });

module.exports = mongoose.model("User", userSchema);
