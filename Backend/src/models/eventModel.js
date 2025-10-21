const mongoose = require('mongoose');

// Registration schema to store user registration with files
const registrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  idImagePath: {
    type: String,
    required: true // ID image is mandatory
  },
  additionalDocumentPath: {
    type: String,
    required: false // Optional PDF document
  },
  status: {
    type: String,
    enum: ['registered', 'waitlisted', 'cancelled', 'verified'],
    default: 'registered'
  },
  additionalInfo: {
    type: String,
    maxLength: 500
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Academic']
  },
  maxParticipants: {
    type: Number,
    required: true
  },
  // Store full registration objects instead of just user IDs
  registeredUsers: [registrationSchema],
  additionalDocumentInfo: {
    type: String,
    default: 'Upload any additional document as specified by the event committee (resume, portfolio, etc.)'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  registrationDeadline: {
    type: Date
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual to get registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.registeredUsers.filter(reg => reg.status !== 'cancelled').length;
});

// Virtual to check if event is full
eventSchema.virtual('isFull').get(function() {
  return this.registrationCount >= this.maxParticipants;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registeredUsers.some(
    reg => reg.userId.toString() === userId.toString() && reg.status !== 'cancelled'
  );
};

module.exports = mongoose.model('Event', eventSchema);