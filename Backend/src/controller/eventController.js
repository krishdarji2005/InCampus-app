const Event = require("../models/eventModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log("📁 Created directory:", dirPath);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath;

    if (file.fieldname === "image") {
      uploadPath = path.join(__dirname, "../../public/uploads/events/images");
    } else if (file.fieldname === "document") {
      uploadPath = path.join(
        __dirname,
        "../../public/uploads/events/documents"
      );
    } else if (file.fieldname === "idImage") {
      uploadPath = path.join(
        __dirname,
        "../../public/uploads/events/id-images"
      );
    } else {
      uploadPath = path.join(__dirname, "../../public/uploads/events");
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(
      file.originalname
    )}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image") {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed for event images"));
      }
    } else if (file.fieldname === "document") {
      const allowedMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and Word documents are allowed"));
      }
    } else {
      cb(null, true);
    }
  },
});

// Helper function to delete uploaded files
const deleteUploadedFiles = (files) => {
  if (!files) return;

  Object.keys(files).forEach((fieldName) => {
    files[fieldName].forEach((file) => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`Deleted file: ${file.path}`);
        }
      } catch (error) {
        console.error(`Error deleting file ${file.path}:`, error);
      }
    });
  });
};

// Create new event with proper image handling
const createEvent = async (req, res) => {
  try {
    console.log("📝 Creating new event...");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const {
      title,
      description,
      date,
      time,
      venue,
      category,
      type,
      maxParticipants,
      author,
      createdBy,
    } = req.body;

    // Validation
    if (!title || !description || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        required: ["title", "description", "date", "venue"],
      });
    }

    // Create event object
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time || "10:00 AM",
      venue: venue.trim(),
      category: category || "General",
      type: type || "Workshop",
      maxParticipants: parseInt(maxParticipants) || 100,
      author: author || "Event Organizer",
      createdBy: createdBy || null,
      registrationCount: 0,
      registeredUsers: [],
      status: "active",
    };

    // Handle image upload
    if (req.file) {
      const baseUrl =
        process.env.NODE_ENV === "production"
          ? `https://${req.get("host")}`
          : `http://localhost:${process.env.PORT || 5000}`;

      eventData.image = `${baseUrl}/uploads/events/images/${req.file.filename}`;
      console.log("🖼️ Image uploaded:", eventData.image);
    }

    // Create and save event
    const event = new Event(eventData);
    const savedEvent = await event.save();

    console.log("✅ Event created successfully:", savedEvent._id);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: savedEvent,
    });
  } catch (error) {
    console.error("❌ Event creation error:", error);

    // Clean up uploaded file if event creation fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to clean up file:", err);
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get all events with proper image URL handling
const getAllEvents = async (req, res) => {
  try {
    console.log("📋 Fetching all events...");

    const {
      page = 1,
      limit = 10,
      category,
      search,
      status = "active",
    } = req.query;

    // Build filter object
    const filter = { status };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("registeredUsers.userId", "name email");

    const totalEvents = await Event.countDocuments(filter);

    console.log(`📊 Found ${events.length} events`);

    res.status(200).json({
      success: true,
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNextPage: page * limit < totalEvents,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get event by ID with proper image URL handling
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("createdBy", "name email")
      .populate("registeredUsers.userId", "name email department year phone");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    const eventData = event.toObject();

    let imageUrl = eventData.image || eventData.imageUrl;

    if (imageUrl) {
      if (imageUrl.startsWith("/uploads/")) {
        imageUrl = `http://localhost:5000${imageUrl}`;
      } else if (!imageUrl.startsWith("http")) {
        imageUrl = `http://localhost:5000/uploads/events/images/${imageUrl}`;
      }
    } else {
      imageUrl =
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
    }

    console.log(`📸 Event details "${eventData.title}" image: ${imageUrl}`);

    const responseData = {
      ...eventData,
      image: imageUrl,
      registrationCount: event.registrationCount,
      isFull: event.isFull,
      author: eventData.createdBy?.name || "Unknown Organizer",
      price: "Free",
      format: "In-Person",
    };

    res.status(200).json({
      success: true,
      event: responseData,
    });
  } catch (error) {
    console.error("❌ Get event by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
};

// Register for event with file uploads (keep existing)
const registerForEvent = async (req, res) => {
  try {
    const { id: eventId } = req.params;
    const { userId, additionalInfo } = req.body;
    const files = req.files;

    console.log("=== REGISTRATION DEBUG ===");
    console.log("Event ID from params:", eventId);
    console.log("User ID from body:", userId);
    console.log("Files received:", files ? Object.keys(files) : "none");
    console.log("========================");

    // Validate required fields
    if (!userId) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate event ID format
    if (!eventId || eventId === "undefined") {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "Valid event ID is required",
      });
    }

    // Validate ID image is uploaded
    if (!files || !files.idImage || files.idImage.length === 0) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "ID image is required for registration",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      deleteUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: "User not found. Please make sure you are logged in.",
      });
    }

    console.log("User found:", user.name || user.email);

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      deleteUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    console.log("Event found:", event.title);

    // Check if user is already registered
    if (event.isUserRegistered(userId)) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }

    // Check if event is full
    if (event.registrationCount >= event.maxParticipants) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: "Event is full. Registration closed.",
      });
    }

    // Get file paths
    const idImagePath = files.idImage[0].path;
    const additionalDocumentPath =
      files.additionalDocument && files.additionalDocument[0]
        ? files.additionalDocument[0].path
        : null;

    // Create registration object
    const registration = {
      userId: userId,
      idImagePath: idImagePath,
      additionalDocumentPath: additionalDocumentPath,
      status: "registered",
      additionalInfo: additionalInfo || "",
      registeredAt: new Date(),
    };

    console.log("Adding registration:", registration);

    // Use updateOne to avoid validation on entire event document
    const updateResult = await Event.updateOne(
      { _id: eventId },
      { $push: { registeredUsers: registration } }
    );

    if (updateResult.modifiedCount === 0) {
      deleteUploadedFiles(files);
      return res.status(500).json({
        success: false,
        message: "Failed to register for event",
      });
    }

    console.log(
      `✅ User ${userId} successfully registered for event ${eventId}`
    );

    res.status(200).json({
      success: true,
      message: "Successfully registered for the event",
      registration: {
        eventId: eventId,
        eventTitle: event.title,
        status: "registered",
        registeredAt: registration.registeredAt,
      },
    });
  } catch (error) {
    console.error("❌ Register for event error:", error);

    // Clean up uploaded files on error
    deleteUploadedFiles(req.files);

    res.status(500).json({
      success: false,
      message: "Failed to register for event",
      error: error.message,
    });
  }
};

// Cancel registration (keep existing)
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Find and remove the registration
    const registrationIndex = event.registeredUsers.findIndex(
      (reg) => reg.userId.toString() === userId && reg.status !== "cancelled"
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not registered for this event",
      });
    }

    // Mark as cancelled instead of removing (for record keeping)
    event.registeredUsers[registrationIndex].status = "cancelled";
    await event.save();

    // Update user's registered events
    const user = await User.findById(userId);
    if (user && user.registeredEvents) {
      user.registeredEvents = user.registeredEvents.filter(
        (eventIdObj) => eventIdObj.toString() !== eventId
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel registration error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel registration",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
};
