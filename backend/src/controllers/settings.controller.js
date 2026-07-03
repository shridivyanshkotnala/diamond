const FormulaConfig = require('../models/formulaConfig.model');
const DashboardMetrics = require('../models/dashboardMetrics.model');

const getFormulaConfig = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    let config = await FormulaConfig.findOne({ businessId });

    if (!config) {
      config = {
        activeFormula: 'F1',
        formula2Rules: ['14K']
      };
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Get Formula Config Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateFormulaConfig = async (req, res) => {
  try {
    const { activeFormula, formula2Rules } = req.body;
    const businessId = req.user.businessId;

    const updateData = {};
    if (activeFormula) {
      if (!['F1', 'F2'].includes(activeFormula)) {
        return res.status(400).json({ success: false, message: 'Invalid activeFormula value' });
      }
      updateData.activeFormula = activeFormula;
    }
    
    if (formula2Rules && Array.isArray(formula2Rules)) {
      updateData.formula2Rules = formula2Rules;
    }

    const config = await FormulaConfig.findOneAndUpdate(
      { businessId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error('Update Formula Config Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


const getDashboardMatrices = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    let metrics = await DashboardMetrics.findOne({ businessId });

    if (!metrics) {
      metrics = {
        metricsData: {
          '24k_mcx': true,
          '22k_rtgs': true,
          '22k_cash': false,
          '22k_mcx': true,
          '20k_rtgs': true,
          '20k_cash': false,
          '20k_mcx': true,
          '18k_rtgs': true,
          '18k_cash': false,
          '18k_mcx': true,
          '14k_rtgs': true,
          '14k_cash': false,
          '14k_mcx': true,
          '9k_rtgs': true,
          '9k_cash': false,
          '9k_mcx': true,
          'edit_market_prices': true
        }
      };
    }

    res.status(200).json({ success: true, data: metrics.metricsData || {} });
  } catch (error) {
    console.error('Get Dashboard Matrices Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateDashboardMatrices = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { values } = req.body;

    const metrics = await DashboardMetrics.findOneAndUpdate(
      { businessId },
      { $set: { metricsData: values } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, data: metrics.metricsData });
  } catch (error) {
    console.error('Update Dashboard Matrices Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getFormulaConfig,
  updateFormulaConfig,
  getDashboardMatrices,
  updateDashboardMatrices
};
