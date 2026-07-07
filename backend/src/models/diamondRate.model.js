const mongoose = require('mongoose');

const diamondRateSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  color: {
    type: String,
    trim: true,
    default: ''
  },
  clarity: {
    type: String,
    trim: true,
    default: ''
  },
  shape: {
    type: mongoose.Schema.Types.Mixed,
    default: 0
  },
  rate: {
    type: Number,
    required: true
  }
}, {
  timestamps: true,
  collection: 'diamond_rates'
});

// Ensure uniqueness for a business based on color, clarity, and shape
diamondRateSchema.index({ businessId: 1, color: 1, clarity: 1, shape: 1 }, { unique: true });

module.exports = mongoose.model('DiamondRate', diamondRateSchema);
