const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');
const config = require('../config/env');
const { SYSTEM_PROMPT, getUserPrompt } = require('../prompts/gemini.prompt');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

// Compress and resize image before sending to Gemini.
// Reduces payload from ~4–8MB raw to ~80–200KB, cutting API latency significantly.
const fileToGenerativePart = async (filePath, mimeType) => {
  const compressedBuffer = await sharp(filePath)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return {
    inlineData: {
      data: compressedBuffer.toString('base64'),
      mimeType: 'image/jpeg',
    },
  };
};

const analyzeImages = async (frontImagePath, backImagePath, jewelleryType, scanType) => {
  // Build image parts in parallel to avoid sequential I/O delay
  const imageParts = await Promise.all([
    frontImagePath && fs.existsSync(frontImagePath)
      ? fileToGenerativePart(frontImagePath, 'image/jpeg')
      : null,
    backImagePath && fs.existsSync(backImagePath)
      ? fileToGenerativePart(backImagePath, 'image/jpeg')
      : null,
  ]);

  const parts = [
    { text: SYSTEM_PROMPT },
    { text: getUserPrompt(jewelleryType, scanType) },
    ...imageParts.filter(Boolean),
  ];

  const response = await ai.models.generateContent({
    // gemini-2.5-flash with thinkingBudget=0 disables the thinking step entirely —
    // same speed as 2.0-flash but uses the free-tier quota we actually have
    model: 'gemini-2.5-flash',
    contents: parts,
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  });

  const responseText = response.text;
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return { error: 'Failed to parse JSON', raw: responseText };
  }
};

module.exports = { analyzeImages };
