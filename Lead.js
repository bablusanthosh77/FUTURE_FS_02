const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const leadSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add email address'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add phone number'],
      trim: true,
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Other'],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Converted'],
      default: 'New',
    },
    notes: {
      type: String,
      default: '',
    },
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lead', leadSchema);
