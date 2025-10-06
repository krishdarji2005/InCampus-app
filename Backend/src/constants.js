// Application constants
const ROLES = {
  STUDENT: 'student',
  COMMITTEE: 'committee',
  ADMIN: 'admin'
};

const EVENT_CATEGORIES = {
  ACADEMIC: 'academic',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  TECHNICAL: 'technical',
  SOCIAL: 'social',
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  CONFERENCE: 'conference',
  OTHER: 'other'
};

const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const REGISTRATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  ATTENDED: 'attended',
  NO_SHOW: 'no-show'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded'
};

const YEARS = {
  FIRST: '1st',
  SECOND: '2nd',
  THIRD: '3rd',
  FOURTH: '4th',
  MASTERS: 'Masters',
  PHD: 'PhD'
};

const TSHIRT_SIZES = {
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
  XXXL: 'XXXL'
};

module.exports = {
  ROLES,
  EVENT_CATEGORIES,
  EVENT_STATUS,
  REGISTRATION_STATUS,
  PAYMENT_STATUS,
  YEARS,
  TSHIRT_SIZES
};
