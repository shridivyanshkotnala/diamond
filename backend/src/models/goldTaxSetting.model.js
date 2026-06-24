const mongoose = require('mongoose');

const goldTaxSettingSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  },
  rtgsChangeBy: {
    type: Number,
    default: 0
  },
  cashChangeBy: {
    type: Number,
    default: 0
  },
  scannerCalculationUse: {
    type: String,
    enum: ['rtgs', 'cash', 'mcx'],
    default: 'rtgs'
  }
}, {
  timestamps: true,
  collection: 'gold_tax_settings'
});

module.exports = mongoose.model('GoldTaxSetting', goldTaxSettingSchema);
