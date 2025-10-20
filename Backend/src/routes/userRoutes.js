const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');

// Auth routes
router.post('/google-auth', userController.googleAuth);

// Profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile/:userId', userController.updateUserProfile);
router.post('/profile/:userId/complete-onboarding', userController.completeOnboarding);
router.get('/profile/:userId/completion', userController.getProfileCompletion);

// File upload routes
router.post('/profile/:userId/upload-picture', userController.uploadProfilePicture);

module.exports = router;