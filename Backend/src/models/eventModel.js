const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Event title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Event description is required'],
    trim: true
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
  category: { 
    type: String, 
    required: [true, 'Event category is required'],
    enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar', 'Competition', 'Social', 'Art & Craft', 'Music', 'Dance', 'Literature']
  },
  image: { 
    type: String, 
    default: '' 
  },
  author: { 
    type: String, 
    required: [true, 'Event author is required'],
    trim: true
  },
  authorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  status: { 
    type: String, 
    enum: ['active', 'cancelled', 'completed'], 
    default: 'active' 
  },
  registeredUsers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  registrationCount: { 
    type: Number, 
    default: 0 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);