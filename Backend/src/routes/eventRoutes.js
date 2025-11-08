const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Event = require("../models/eventModel"); // ✅ ADD THIS IMPORT
const {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
} = require("../controller/eventController");

const router = express.Router();

// Create upload directories for event registration files
const createEventUploadDirs = () => {
  const dirs = [
    "public/uploads/events",
    "public/uploads/events/id-images",
    "public/uploads/events/documents",
    "public/uploads/events/images", // Add this for event images
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createEventUploadDirs();

// Configure multer for event image uploads
const eventImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/events/images/");
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `event-${timestamp}${extension}`;
    cb(null, filename);
  },
});

// File filter for event images
const eventImageFileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif/;
  const extname = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedImageTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Event image must be JPEG, JPG, PNG, or GIF format"), false);
  }
};

// Event image upload configuration
const eventImageUpload = multer({
  storage: eventImageStorage,
  fileFilter: eventImageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure multer for event registration file uploads
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "idImage") {
      cb(null, "public/uploads/events/id-images/");
    } else if (file.fieldname === "additionalDocument") {
      cb(null, "public/uploads/events/documents/");
    } else {
      cb(new Error("Invalid fieldname"), null);
    }
  },
  filename: function (req, file, cb) {
    const userId = req.body.userId;
    const eventId = req.params.eventId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${eventId}-${userId}-${file.fieldname}-${timestamp}${extension}`;
    cb(null, filename);
  },
});

// File filter for event registration files
const eventFileFilter = (req, file, cb) => {
  if (file.fieldname === "idImage") {
    // Allow only image files for ID
    const allowedImageTypes = /jpeg|jpg|png/;
    const extname = allowedImageTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedImageTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("ID Image must be JPG, JPEG, or PNG format"), false);
    }
  } else if (file.fieldname === "additionalDocument") {
    // Allow only PDF files for additional documents
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Additional document must be a PDF file"), false);
    }
  } else {
    cb(new Error("Invalid file field"), false);
  }
};

// Event registration file upload configuration
const eventUpload = multer({
  storage: eventStorage,
  fileFilter: eventFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2, // Maximum 2 files
  },
});

// Multer error handling middleware for events
const handleEventMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Maximum 2 files allowed.",
      });
    }
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// Routes
// GET /api/events - Get all events
router.get("/", getAllEvents);

// GET /api/events/:id - Get event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    console.log("=== EVENT STRUCTURE DEBUG ===");
    console.log("Full event object:", JSON.stringify(event, null, 2));
    console.log("Event createdBy field:", event.createdBy);
    console.log("Event authorId field:", event.authorId);
    console.log("Event author field:", event.author);
    console.log("All event fields:", Object.keys(event.toObject()));

    res.json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/events - Create new event with image upload
router.post(
  "/",
  eventImageUpload.single("eventImage"), // Handle single image upload
  handleEventMulterError,
  createEvent
);

// POST /api/events/:id/register - Register for event with file uploads
router.post(
  "/:id/register",
  eventUpload.fields([
    { name: "idImage", maxCount: 1 },
    { name: "additionalDocument", maxCount: 1 },
  ]),
  handleEventMulterError,
  registerForEvent
);

// PUT /api/events/:id - Update event
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { updatedBy } = updateData;

    console.log("=== EVENT UPDATE DEBUG ===");
    console.log("Event ID:", id);
    console.log("Update data:", updateData);
    console.log("Updated by:", updatedBy);

    // Find the event first
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    console.log("Event found:");
    console.log("Event createdBy:", event.createdBy);
    console.log("Event createdBy type:", typeof event.createdBy);
    console.log("Event authorId:", event.authorId);
    console.log("Updated by:", updatedBy);
    console.log("Updated by type:", typeof updatedBy);
    console.log("Are they equal?", event.createdBy?.toString() === updatedBy);
    console.log(
      "Are they equal (authorId)?",
      event.authorId?.toString() === updatedBy
    );

    // Check if user is authorized to update this event
    // Try both createdBy and authorId fields
    const isAuthorized =
      event.createdBy?.toString() === updatedBy ||
      event.authorId?.toString() === updatedBy;

    if (!isAuthorized) {
      console.log("Authorization failed!");
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this event",
        debug: {
          eventCreatedBy: event.createdBy?.toString(),
          eventAuthorId: event.authorId?.toString(),
          updatedBy: updatedBy,
          match: false,
        },
      });
    }

    console.log("Authorization successful!");

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log("Event updated successfully:", updatedEvent.title);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
});

// DELETE /api/events/:eventId/register - Cancel registration
router.delete("/:eventId/register", cancelRegistration);

// Temporary route to fix existing events - add this to eventRoutes.js
router.post("/fix-created-by", async (req, res) => {
  try {
    // Update all events that don't have createdBy set
    // This assumes the first user or a specific user created them
    const defaultCreatorId = "68ee980ea8e36ca2578ece19"; // Krish's ID

    const result = await Event.updateMany(
      { createdBy: { $exists: false } },
      { $set: { createdBy: defaultCreatorId } }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} events`,
      result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/debug/files", async (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    const uploadsPath = path.join(
      __dirname,
      "../../public/uploads/events/images"
    );
    console.log("🔍 Checking uploads path:", uploadsPath);

    const pathExists = fs.existsSync(uploadsPath);
    const files = pathExists ? fs.readdirSync(uploadsPath) : [];

    res.json({
      uploadsPath,
      pathExists,
      files: files.map((file) => ({
        name: file,
        url: `http://localhost:5000/uploads/events/images/${file}`,
        fullPath: path.join(uploadsPath, file),
      })),
      sampleEvents: await Event.find().select("title image imageUrl").limit(3),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
