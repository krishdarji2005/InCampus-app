const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event is required']
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no-show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    trim: true,
    maxlength: [500, 'Additional info cannot exceed 500 characters']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  dietaryRequirements: {
    type: String,
    trim: true
  },
  tshirtSize: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Feedback comment cannot exceed 500 characters']
    },
    submittedAt: {
      type: Date
    }
  },
  cancelledAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Compound index to ensure one registration per user per event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Index for better query performance
registrationSchema.index({ event: 1 });
registrationSchema.index({ user: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationDate: -1 });

// Virtual for checking if registration is active
registrationSchema.virtual('isActive').get(function() {
  return this.status === 'confirmed' || this.status === 'pending';
});

// Pre-save middleware to update event participant count
registrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Event = mongoose.model('Event');
      await Event.findByIdAndUpdate(
        this.event,
        { $inc: { currentParticipants: 1 } }
      );
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Pre-remove middleware to update event participant count
registrationSchema.pre('remove', async function(next) {
  try {
    const Event = mongoose.model('Event');
    await Event.findByIdAndUpdate(
      this.event,
      { $inc: { currentParticipants: -1 } }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Registration', registrationSchema);
