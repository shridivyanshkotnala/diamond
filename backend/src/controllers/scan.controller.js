const scanService = require('../services/scan.service');
const { sendSuccess } = require('../utils/apiResponse');

const createScan = async (req, res, next) => {
  try {
    const { jewelleryType, scanType } = req.body;
    const scanData = await scanService.createScan(jewelleryType, scanType);
    sendSuccess(res, scanData);
  } catch (err) {
    next(err);
  }
};

const uploadFrontImage = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    if (!req.file) throw new Error('Front image is required');
    
    const updated = await scanService.saveImage(scanId, req.file.path, 'front');
    sendSuccess(res, { scanId: updated.scanId, status: updated.status });
  } catch (err) {
    next(err);
  }
};

const uploadBackImage = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    if (!req.file) throw new Error('Back image is required');
    
    const updated = await scanService.saveImage(scanId, req.file.path, 'back');
    sendSuccess(res, { scanId: updated.scanId, status: updated.status });
  } catch (err) {
    next(err);
  }
};

const analyzeScan = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const scannerSettings = req.body?.scannerSettings || {};
    const updated = await scanService.analyzeScan(scanId, scannerSettings, req.user?.businessId);
    
    sendSuccess(res, {
        scanId: updated.scanId,
        status: updated.status,
        provider: updated.analysisResult.provider,
        rawText: updated.analysisResult.rawText,
        structuredData: updated.analysisResult.structuredData,
        unknownFields: [], // Force empty to bypass frontend clarification screen
        overallConfidence: updated.analysisResult.overallConfidence
    });
  } catch (err) {
    next(err);
  }
};

const getClarification = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const data = await scanService.getClarification(scanId);
    
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const submitClarification = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const { confirmedMappings } = req.body;
    
    await scanService.submitClarification(scanId, confirmedMappings);
    
    res.status(200).json({ status: "CLARIFICATION_COMPLETED" });
  } catch (err) {
    next(err);
  }
};

const getReview = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const data = await scanService.getReviewData(scanId);
    
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const submitReview = async (req, res, next) => {
  try {
    const { scanId } = req.params;
    const finalData = req.body;
    
    await scanService.submitReview(scanId, finalData);
    
    res.status(200).json({ status: "APPROVED" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createScan,
  uploadFrontImage,
  uploadBackImage,
  analyzeScan,
  getClarification,
  submitClarification,
  getReview,
  submitReview
};
