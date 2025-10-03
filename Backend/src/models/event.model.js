const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event organizer is required']
  },
  committee: {
    type: String,
    required: [true, 'Committee name is required'],
    trim: true
  },
  image: {
    type: String,
    default: 'default-event.jpg'
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Other'],
    default: 'Other'
  },
  registrationDeadline: {
    type: Date
  },
  maxParticipants: {
    type: Number
  },
  registeredParticipants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function() {
  if (!this.registrationDeadline) return true;
  return new Date() < this.registrationDeadline;
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxParticipants) return false;
  return this.registeredParticipants.length >= this.maxParticipants;
});

// Method to check if a user is registered for this event
eventSchema.methods.isUserRegistered = function(userId) {
  return this.registeredParticipants.some(participant => 
    participant.toString() === userId.toString()
  );
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;