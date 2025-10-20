const User = require('../models/userModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = 'public/uploads/profiles/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Google OAuth user creation/login
const googleAuth = async (req, res) => {
  try {
    const { name, email, profilePic, googleId } = req.body;

    console.log('Google auth request:', { name, email, googleId });

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.name = name || user.name;
      user.profilePic = profilePic || user.profilePic;
      user.googleId = googleId || user.googleId;
      await user.save();
      
      console.log('Updated existing user:', user.email);
      
      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user: user,
        isNewUser: false
      });
    }

    // Create new user
    user = new User({
      name: name || 'New User',
      email,
      profilePic: profilePic || '',
      googleId,
      authProvider: 'google',
      profileCompleted: false,
      isOnboardingComplete: false
    });

    await user.save();
    console.log('Created new user:', user.email);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: user,
      isNewUser: true
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate user',
      error: error.message
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { email, userId } = req.query;
    
    console.log('Getting user profile for:', { email, userId });
    
    let user;
    if (userId) {
      user = await User.findById(userId).populate('registeredEvents createdEvents');
    } else if (email) {
      user = await User.findOne({ email }).populate('registeredEvents createdEvents');
    } else {
      return res.status(400).json({
        success: false,
        message: 'Email or userId is required'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user.email);

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    console.log('Updating profile for user:', userId);
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.email;
    delete updateData.googleId;
    delete updateData.role;
    delete updateData._id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user[key] = updateData[key];
      }
    });
    
    // Check if profile is now complete
    const requiredFields = ['name', 'department', 'year', 'phone'];
    const isComplete = requiredFields.every(field => 
      user[field] && user[field].toString().trim()
    );
    
    user.profileCompleted = isComplete;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Complete onboarding
const completeOnboarding = async (req, res) => {
  try {
    const { userId } = req.params;
    const { department, year, phone, interests, bio, rollNumber, socialLinks } = req.body;
    
    console.log('Completing onboarding for user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update required onboarding fields
    user.department = department;
    user.year = year;
    user.phone = phone;
    user.interests = interests || [];
    user.bio = bio || '';
    user.rollNumber = rollNumber || '';
    user.socialLinks = socialLinks || {};
    user.isOnboardingComplete = true;
    user.profileCompleted = true;
    
    await user.save();

    console.log('Onboarding completed for user:', user.email);

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully',
      user: user
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
};

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile picture URL
    const profilePicUrl = `/uploads/profiles/${req.file.filename}`;
    user.profilePic = profilePicUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicUrl: profilePicUrl
    });

  } catch (error) {
    console.error('Upload profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
};

// Get profile completion status
const getProfileCompletion = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const completion = {
      isComplete: user.profileCompleted,
      isOnboardingComplete: user.isOnboardingComplete,
      missingFields: []
    };

    // Check missing required fields
    const requiredFields = [
      { field: 'department', label: 'Department' },
      { field: 'year', label: 'Academic Year' },
      { field: 'phone', label: 'Phone Number' }
    ];

    requiredFields.forEach(({ field, label }) => {
      if (!user[field] || !user[field].toString().trim()) {
        completion.missingFields.push(label);
      }
    });

    res.status(200).json({
      success: true,
      completion: completion
    });

  } catch (error) {
    console.error('Get profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile completion status',
      error: error.message
    });
  }
};

module.exports = {
  googleAuth,
  getUserProfile,
  updateUserProfile,
  completeOnboarding,
  uploadProfilePicture: [upload.single('profilePicture'), uploadProfilePicture],
  getProfileCompletion
};