const GoldRate = require('../models/goldRate.model');
const DiamondRate = require('../models/diamondRate.model');
const ColorstoneRate = require('../models/colorstoneRate.model');
const LabourRate = require('../models/labourRate.model');
const GoldTaxSetting = require('../models/goldTaxSetting.model');
const { getLiveGoldRates } = require('../services/rateCalculation.service');
const redisService = require('../services/redis.service');
const {
  addPromptCustomization,
  getPromptCustomizations,
  buildCustomPromptSnippet,
} = require('../services/promptCustomization.service');

const DEFAULT_DIAMOND_COLORS = new Set([
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'EF',
  'FG',
  'GH',
  'HI',
  'IJ',
]);
const DEFAULT_DIAMOND_CLARITIES = new Set([
  'FL',
  'IF',
  'VVS',
  'VVS1',
  'VVS2',
  'VS',
  'VS1',
  'VS2',
  'SI',
  'SI1',
  'SI2',
  'SS',
  'I1',
  'I2',
  'I3',
]);
const DEFAULT_DIAMOND_SHAPES = new Set(['RD', 'MQ', 'PR', 'EM', 'BG', 'PC']);

const CARAT_ALIASES = {
  '22KT': '22Kt',
  '22 K': '22Kt',
  '22 KT': '22Kt',
  '20KT': '20Kt',
  '20 K': '20Kt',
  '20 KT': '20Kt',
  '18KT': '18Kt',
  '18 K': '18Kt',
  '18 KT': '18Kt',
  '14KT': '14Kt',
  '14 K': '14Kt',
  '14 KT': '14Kt',
  '9KT': '9Kt',
  '9 K': '9Kt',
  '9 KT': '9Kt'
};

const normalizeCarat = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return raw;

  if (['22Kt', '20Kt', '18Kt', '14Kt', '9Kt'].includes(raw)) {
    return raw;
  }

  const upper = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  return CARAT_ALIASES[upper] || raw;
};

// === GOLD RATES ===

const updateGoldRate = async (req, res) => {
  try {
    const { carat, purity, increaseByAmount, increaseByType } = req.body;
    const businessId = req.user.businessId;
    const normalizedCarat = normalizeCarat(carat);

    if (!normalizedCarat || purity == null) {
      return res.status(400).json({ success: false, message: 'Carat and purity are required' });
    }

    const goldRate = await GoldRate.findOneAndUpdate(
      { businessId, carat: normalizedCarat },
      {
        $set: {
          carat: normalizedCarat,
          purity,
          increaseByAmount: increaseByAmount || 0,
          increaseByType: increaseByType || 'FLAT',
        },
      },
      { new: true, upsert: true }
    );

    // Invalidate Cache since configuration changed
    await redisService.invalidateGoldRatesCache(businessId.toString());

    // Return computed shape (with finalRate/mcxRate/cashRate/rtgsRate) expected by frontend
    const live = await getLiveGoldRates(businessId);
    const updatedComputed = Array.isArray(live?.karatRates)
      ? live.karatRates.find((row) => row.carat === normalizedCarat)
      : null;

    res.status(200).json({ success: true, data: updatedComputed || goldRate });
  } catch (error) {
    console.error('Update Gold Rate Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const updateGoldRateVisibility = async (req, res) => {
  try {
    const { carat, id, hidden } = req.body;
    const businessId = req.user.businessId;

    if (hidden == null) {
      return res.status(400).json({ success: false, message: 'Hidden flag is required' });
    }

    let query = { businessId };
    if (id) {
      query = { ...query, _id: id };
    } else if (carat) {
      const normalizedCarat = normalizeCarat(carat);
      if (!normalizedCarat) {
        return res.status(400).json({ success: false, message: 'Valid carat is required' });
      }
      query = { ...query, carat: normalizedCarat };
    } else {
      return res.status(400).json({ success: false, message: 'Carat or id is required' });
    }

    const updated = await GoldRate.findOneAndUpdate(
      query,
      { $set: { isHidden: !!hidden } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Gold rate not found' });
    }

    await redisService.invalidateGoldRatesCache(businessId.toString());

    const live = await getLiveGoldRates(businessId);
    const updatedComputed = Array.isArray(live?.karatRates)
      ? live.karatRates.find((row) => row.carat === updated.carat)
      : null;

    return res.status(200).json({ success: true, data: updatedComputed || updated });
  } catch (error) {
    console.error('Update Gold Rate Visibility Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getGoldRates = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    // Uses the "Supreme Truth Engine" which orchestrates MongoDB + Redis + Live Math
    const data = await getLiveGoldRates(businessId);
    
    // Keep all fields inside a single data envelope so frontend unwrapApiData preserves them.
    res.status(200).json({
      success: true,
      data: {
        mcxLiveRate: data.mcxLiveRate,
        supremeChanges: data.supremeChanges,
        taxSettings: data.taxSettings,
        rates: data.karatRates,
      },
    });
  } catch (error) {
    console.error('Get Gold Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === GOLD TAX SETTINGS ===

const getGoldTaxSettings = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    let taxSettings = await GoldTaxSetting.findOne({ businessId });
    if (!taxSettings) {
      taxSettings = { rtgsChangeBy: 0, cashChangeBy: 0, scannerCalculationUse: 'rtgs' };
    }
    res.status(200).json({ success: true, data: taxSettings });
  } catch (error) {
    console.error('Get Gold Tax Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateGoldTaxSettings = async (req, res) => {
  try {
    const { rtgsChangeBy, cashChangeBy, scannerCalculationUse } = req.body;
    const businessId = req.user.businessId;

    const updateData = {};
    if (rtgsChangeBy !== undefined) updateData.rtgsChangeBy = rtgsChangeBy;
    if (cashChangeBy !== undefined) updateData.cashChangeBy = cashChangeBy;
    if (scannerCalculationUse) updateData.scannerCalculationUse = scannerCalculationUse === 'cash' ? 'cash' : 'rtgs';

    const taxSettings = await GoldTaxSetting.findOneAndUpdate(
      { businessId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Invalidate Cache since base rate logic changed
    await redisService.invalidateGoldRatesCache(businessId.toString());

    res.status(200).json({ success: true, data: taxSettings });
  } catch (error) {
    console.error('Update Gold Tax Settings Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === DIAMOND RATES ===
const addOrUpdateDiamondRate = async (req, res) => {
  try {
    const { color, clarity, rate, shape } = req.body;
    const businessId = req.user.businessId;

    const trimmedColor = typeof color === 'string' ? color.trim().toUpperCase() : '';
    const trimmedClarity = typeof clarity === 'string' ? clarity.trim().toUpperCase() : '';
    const rawShape = typeof shape === 'string' ? shape.trim() : '';

    const SHAPE_MAP = {
      RD: 'Rd',
      MQ: 'Mq',
      PR: 'Pr',
      EM: 'Em',
      BG: 'Bg',
      PC: 'Pc',
    };
    const normalizedShape = rawShape
      ? SHAPE_MAP[rawShape.toUpperCase()] ?? rawShape.toUpperCase()
      : 0;

    if (!trimmedColor && !trimmedClarity) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one of color or clarity is required' });
    }

    if (rate == null) {
      return res
        .status(400)
        .json({ success: false, message: 'Rate is required' });
    }

    const normalizedColor = trimmedColor || '';
    const normalizedClarity = trimmedClarity || '';

    let promptUpdated = false;

    if (normalizedColor && !DEFAULT_DIAMOND_COLORS.has(normalizedColor)) {
      const { added } = await addPromptCustomization('diamond', 'color', normalizedColor);
      promptUpdated = promptUpdated || added;
    }
    if (normalizedClarity && !DEFAULT_DIAMOND_CLARITIES.has(normalizedClarity)) {
      const { added } = await addPromptCustomization('diamond', 'clarity', normalizedClarity);
      promptUpdated = promptUpdated || added;
    }
    const normalizedShapeKey =
      typeof normalizedShape === 'string' ? normalizedShape.toUpperCase() : '';

    if (normalizedShapeKey && !DEFAULT_DIAMOND_SHAPES.has(normalizedShapeKey)) {
      const { added } = await addPromptCustomization('diamond', 'shape', normalizedShapeKey);
      promptUpdated = promptUpdated || added;
    }

    if (promptUpdated) {
      const customizations = await getPromptCustomizations('diamond');
      const snippet = buildCustomPromptSnippet(customizations, 100, 'diamond');
      if (snippet) {
        console.log('[PROMPT] Custom diamond options section (100 words):');
        console.log(snippet);
      }
    }

    const baseQuery = {
      businessId,
      color: normalizedColor,
      clarity: normalizedClarity,
    };

    const shapeQuery =
      normalizedShape === 0
        ? { $or: [{ shape: 0 }, { shape: { $exists: false } }, { shape: null }, { shape: '' }] }
        : { shape: normalizedShape };

    const diamondRate = await DiamondRate.findOneAndUpdate(
      {
        ...baseQuery,
        ...shapeQuery,
      },
      { rate, shape: normalizedShape },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: diamondRate });
  } catch (error) {
    console.error('Add Diamond Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getDiamondRates = async (req, res) => {
  try {
    console.log('[RATE] GET /rates/diamond hit by user:', req.user?.businessId);
    const businessId = req.user.businessId;
    const rates = await DiamondRate.find({ businessId });
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    console.error('Get Diamond Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteDiamondRate = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    await DiamondRate.findOneAndDelete({ _id: id, businessId });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === COLORSTONE RATES ===

const addOrUpdateColorstoneRate = async (req, res) => {
  try {
    const { color, clarity, rate } = req.body;
    const businessId = req.user.businessId;

    const trimmedColor = typeof color === 'string' ? color.trim() : '';
    const trimmedClarity = typeof clarity === 'string' ? clarity.trim().toUpperCase() : '';

    if (!trimmedColor && !trimmedClarity) {
      return res
        .status(400)
        .json({ success: false, message: 'At least one of color or clarity is required' });
    }

    if (rate == null) {
      return res.status(400).json({ success: false, message: 'Rate is required' });
    }

    let promptUpdated = false;
    if (trimmedColor) {
      const { added } = await addPromptCustomization('colorstone', 'color', trimmedColor);
      promptUpdated = promptUpdated || added;
    }
    if (trimmedClarity) {
      const { added } = await addPromptCustomization('colorstone', 'clarity', trimmedClarity);
      promptUpdated = promptUpdated || added;
    }

    const colorstoneRate = await ColorstoneRate.findOneAndUpdate(
      { businessId, color: trimmedColor, clarity: trimmedClarity },
      { rate },
      { new: true, upsert: true }
    );

    if (promptUpdated) {
      const customizations = await getPromptCustomizations('colorstone');
      const snippet = buildCustomPromptSnippet(customizations, 100, 'colorstone');
      if (snippet) {
        console.log('[PROMPT] Custom colorstone options section (100 words):');
        console.log(snippet);
      }
    }

    res.status(200).json({ success: true, data: colorstoneRate });
  } catch (error) {
    console.error('Add Colorstone Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getColorstoneRates = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const rates = await ColorstoneRate.find({ businessId });
    res.status(200).json({ success: true, data: rates });
  } catch (error) {
    console.error('Get Colorstone Rates Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteColorstoneRate = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.user.businessId;
    await ColorstoneRate.findOneAndDelete({ _id: id, businessId });
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// === LABOUR RATES ===

const getLabourRate = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const labourRate = await LabourRate.findOne({ businessId });
    res.status(200).json({ success: true, data: labourRate ?? null });
  } catch (error) {
    console.error('Get Labour Rate Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const upsertLabourRate = async (req, res) => {
  try {
    const { chargeType, value, rupeesUnit } = req.body;
    const businessId = req.user.businessId;

    if (!chargeType) {
      return res.status(400).json({
        success: false,
        message: 'chargeType is required',
      });
    }

    if (chargeType === 'NONE') {
      await LabourRate.findOneAndDelete({ businessId });
      return res.status(200).json({ success: true, data: null });
    }

    if (value == null) {
      return res.status(400).json({
        success: false,
        message: 'value is required when setting a rate',
      });
    }

    if (!['AMOUNT', 'PERCENTAGE'].includes(chargeType)) {
      return res.status(400).json({
        success: false,
        message: 'chargeType must be AMOUNT or PERCENTAGE',
      });
    }

    if (chargeType === 'AMOUNT' && !['Per Gram', 'Per 10 Gram'].includes(rupeesUnit)) {
      return res.status(400).json({
        success: false,
        message: 'rupeesUnit must be "Per Gram" or "Per 10 Gram" when chargeType is AMOUNT',
      });
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'value must be a positive number',
      });
    }

    if (chargeType === 'PERCENTAGE' && numericValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage value must be between 0 and 100',
      });
    }

    const updateData = { chargeType, value: numericValue };
    if (chargeType === 'AMOUNT') {
      updateData.rupeesUnit = rupeesUnit;
    } else {
      updateData.$unset = { rupeesUnit: 1 };
    }

    const labourRate = await LabourRate.findOneAndUpdate(
      { businessId },
      updateData,
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, data: labourRate });
  } catch (error) {
    console.error('Upsert Labour Rate Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
  updateGoldRate,
  updateGoldRateVisibility,
  getGoldRates,
  getGoldTaxSettings,
  updateGoldTaxSettings,
  addOrUpdateDiamondRate,
  getDiamondRates,
  deleteDiamondRate,
  addOrUpdateColorstoneRate,
  getColorstoneRates,
  deleteColorstoneRate,
  getLabourRate,
  upsertLabourRate,
};
