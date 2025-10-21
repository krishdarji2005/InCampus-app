const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration
} = require('../controller/eventController');

const router = express.Router();

// Create upload directories for event registration files
const createEventUploadDirs = () => {
  const dirs = [
    'public/uploads/events',
    'public/uploads/events/id-images',
    'public/uploads/events/documents'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Initialize upload directories
createEventUploadDirs();

// Configure multer for event registration file uploads
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'idImage') {
      cb(null, 'public/uploads/events/id-images/');
    } else if (file.fieldname === 'additionalDocument') {
      cb(null, 'public/uploads/events/documents/');
    } else {
      cb(new Error('Invalid fieldname'), null);
    }
  },
  filename: function (req, file, cb) {
    const userId = req.body.userId;
    const eventId = req.params.eventId;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const filename = `${eventId}-${userId}-${file.fieldname}-${timestamp}${extension}`;
    cb(null, filename);
  }
});

// File filter for event registration files
const eventFileFilter = (req, file, cb) => {
  if (file.fieldname === 'idImage') {
    // Allow only image files for ID
    const allowedImageTypes = /jpeg|jpg|png/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedImageTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('ID Image must be JPG, JPEG, or PNG format'), false);
    }
  } else if (file.fieldname === 'additionalDocument') {
    // Allow only PDF files for additional documents
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Additional document must be a PDF file'), false);
    }
  } else {
    cb(new Error('Invalid file field'), false);
  }
};

// Event registration file upload configuration
const eventUpload = multer({ 
  storage: eventStorage,
  fileFilter: eventFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Maximum 2 files
  }
});

// Multer error handling middleware for events
const handleEventMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 2 files allowed.'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

// Routes
// GET /api/events - Get all events
router.get('/', getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// POST /api/events - Create new event
router.post('/', createEvent);

// POST /api/events/:eventId/register - Register for event with file uploads
router.post('/:eventId/register', 
  eventUpload.fields([
    { name: 'idImage', maxCount: 1 },
    { name: 'additionalDocument', maxCount: 1 }
  ]),
  handleEventMulterError,
  registerForEvent
);

// DELETE /api/events/:eventId/register - Cancel registration
router.delete('/:eventId/register', cancelRegistration);

module.exports = router;