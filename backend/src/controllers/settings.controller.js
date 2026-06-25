const FormulaConfig = require('../models/formulaConfig.model');

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

module.exports = {
  getFormulaConfig,
  updateFormulaConfig
};
