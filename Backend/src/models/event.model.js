const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  endDate: {
    type: Date
  },
  time: {
    type: String,
    required: [true, 'Event time is required']
  },
  endTime: {
    type: String
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'conference', 'other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  maxParticipants: {
    type: Number,
    min: [1, 'Maximum participants must be at least 1']
  },
  currentParticipants: {
    type: Number,
    default: 0,
    min: [0, 'Current participants cannot be negative']
  },
  registrationDeadline: {
    type: Date
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: [0, 'Registration fee cannot be negative']
  },
  isRegistrationOpen: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  requirements: [{
    type: String,
    trim: true
  }],
  prizes: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    email: String,
    phone: String,
    name: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isPublic: 1 });

// Virtual for checking if registration is still open
eventSchema.virtual('isRegistrationStillOpen').get(function() {
  if (!this.isRegistrationOpen) return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  if (this.maxParticipants && this.currentParticipants >= this.maxParticipants) return false;
  return true;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.date;
});

// Method to check if user can register
eventSchema.methods.canUserRegister = function(userId) {
  if (!this.isRegistrationStillOpen) return false;
  if (this.status !== 'published') return false;
  return true;
};

module.exports = mongoose.model('Event', eventSchema);
