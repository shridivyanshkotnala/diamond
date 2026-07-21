const mongoose = require('mongoose');

const otherChargeMasterSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'other_charge_masters',
  },
);

otherChargeMasterSchema.index({ businessId: 1, normalizedName: 1 }, { unique: true });

module.exports = mongoose.model('OtherChargeMaster', otherChargeMasterSchema);
