const { GoogleGenAI } = require('@google/genai');
const config = require('../config/env');
const { SYSTEM_PROMPT, getUserPrompt } = require('../prompts/gemini.prompt');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: config.gemini.apiKey });

const fileToGenerativePart = (path, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
};

const analyzeImages = async (frontImagePath, backImagePath, jewelleryType, scanType) => {
  const parts = [];
  parts.push({ text: SYSTEM_PROMPT });
  parts.push({ text: getUserPrompt(jewelleryType, scanType) });

  if (frontImagePath && fs.existsSync(frontImagePath)) {
    parts.push(fileToGenerativePart(frontImagePath, "image/jpeg"));
  }
  
  if (backImagePath && fs.existsSync(backImagePath)) {
    parts.push(fileToGenerativePart(backImagePath, "image/jpeg"));
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: parts,
    config: {
        responseMimeType: "application/json",
    }
  });

  const responseText = response.text;
  try {
     return JSON.parse(responseText);
  } catch(e) {
     return { error: "Failed to parse JSON", raw: responseText };
  }
};

module.exports = { analyzeImages };
