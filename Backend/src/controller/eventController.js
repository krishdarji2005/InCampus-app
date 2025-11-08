const Event = require("../models/eventModel");
const User = require("../models/userModel");
const fs = require("fs");
const path = require("path");

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
    const eventData = req.body;
    const uploadedFile = req.file;

    console.log("=== CREATE EVENT DEBUG ===");
    console.log("Event data:", eventData);
    console.log("Uploaded file:", uploadedFile);
    console.log("========================");

    const { createdBy } = eventData;

    if (!createdBy) {
      if (uploadedFile && fs.existsSync(uploadedFile.path)) {
        fs.unlinkSync(uploadedFile.path);
      }
      return res.status(400).json({
        success: false,
        message: "Creator ID is required",
      });
    }

    const newEventData = {
      ...eventData,
      createdBy: createdBy,
      category: eventData.category || eventData.type,
      type: eventData.type || eventData.category,
    };

    if (uploadedFile) {
      const imageUrl = `/uploads/events/images/${uploadedFile.filename}`;
      newEventData.image = imageUrl;
      newEventData.imageUrl = imageUrl;
      console.log("✅ Image uploaded successfully:");
      console.log("📁 File path:", uploadedFile.path);
      console.log("🔗 URL path:", imageUrl);
      console.log("🌐 Full URL:", `http://localhost:5000${imageUrl}`);
    } else {
      const defaultImage =
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80";
      newEventData.image = defaultImage;
      newEventData.imageUrl = defaultImage;
      console.log("📷 No image uploaded, using default");
    }

    const event = new Event(newEventData);
    await event.save();

    console.log("🎉 Event created successfully:", event.title);
    console.log("🖼️ Final image URL:", event.image);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: event,
    });
  } catch (error) {
    console.error("❌ Create event error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

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
      message: "Failed to create event",
      error: error.message,
    });
  }
};

// Get all events with proper image URL handling
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "name email")
      .populate("registeredUsers.userId", "name email department year")
      .sort({ createdAt: -1 });

    const eventsWithCount = events.map((event) => {
      const eventObj = event.toObject();

      let imageUrl = eventObj.image || eventObj.imageUrl;

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

      console.log(`📸 Event "${eventObj.title}" image: ${imageUrl}`);

      return {
        ...eventObj,
        image: imageUrl,
        registrationCount: event.registrationCount,
        isFull: event.isFull,
        author: eventObj.createdBy?.name || "Unknown Organizer",
        price: "Free",
        format: "In-Person",
      };
    });

    res.status(200).json({
      success: true,
      events: eventsWithCount,
    });
  } catch (error) {
    console.error("❌ Get all events error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
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
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
};
