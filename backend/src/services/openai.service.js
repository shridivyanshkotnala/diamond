const OpenAI = require('openai');
const sharp = require('sharp');
const config = require('../config/env');
const fs = require('fs');
const { getSystemPrompt, getUserPrompt } = require('../prompts/openai.prompt');
const { getPromptCustomizations } = require('./redis.service');
const DiamondRate = require('../models/diamondRate.model');
const ColorstoneRate = require('../models/colorstoneRate.model');

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

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
const DEFAULT_DIAMOND_SHAPES = new Set([
  'RD',
  'MQ',
  'PR',
  'EM',
  'BG',
  'PC',
  'OV',
  'CU',
  'HT',
  'RA',
  'AS',
  'TR',
]);
const DEFAULT_COLORSTONE_COLORS = new Set(['RED', 'BLUE', 'GREEN', 'PINK']);
const DEFAULT_COLORSTONE_CLARITIES = new Set(['SI', 'VS', 'VS1', 'VVS', 'VVS1']);

const addUnique = (list, value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return list;
  const exists = list.some((item) => item.toLowerCase() === trimmed.toLowerCase());
  if (!exists) list.push(trimmed);
  return list;
};

const buildCustomizationsFromRates = async (businessId) => {
  if (!businessId) return null;

  const [diamondRates, colorstoneRates] = await Promise.all([
    DiamondRate.find({ businessId }).lean(),
    ColorstoneRate.find({ businessId }).lean(),
  ]);

  const diamond = { colors: [], clarities: [], shapes: [], packetCodes: [] };
  diamondRates.forEach((rate) => {
    const color = String(rate.color ?? '').trim();
    const clarity = String(rate.clarity ?? '').trim();
    const shape = String(rate.shape ?? '').trim();
    const packetCode = String(rate.packetCode ?? '').trim();

    if (color && !DEFAULT_DIAMOND_COLORS.has(color.toUpperCase())) {
      addUnique(diamond.colors, color);
    }
    if (clarity && !DEFAULT_DIAMOND_CLARITIES.has(clarity.toUpperCase())) {
      addUnique(diamond.clarities, clarity);
    }
    if (shape && !DEFAULT_DIAMOND_SHAPES.has(shape.toUpperCase())) {
      addUnique(diamond.shapes, shape);
    }
    if (packetCode) {
      addUnique(diamond.packetCodes, packetCode.toUpperCase());
    }
  });

  const colorstone = { colors: [], clarities: [], shapes: [], packetCodes: [] };
  colorstoneRates.forEach((rate) => {
    const color = String(rate.color ?? '').trim();
    const clarity = String(rate.clarity ?? '').trim();

    if (color && !DEFAULT_COLORSTONE_COLORS.has(color.toUpperCase())) {
      addUnique(colorstone.colors, color);
    }
    if (clarity && !DEFAULT_COLORSTONE_CLARITIES.has(clarity.toUpperCase())) {
      addUnique(colorstone.clarities, clarity);
    }
  });

  return { diamond, colorstone };
};

const mergeCustomizations = (base, extra) => {
  if (!extra) return base;
  const merged = {
    colors: [...(base?.colors ?? [])],
    clarities: [...(base?.clarities ?? [])],
    shapes: [...(base?.shapes ?? [])],
    packetCodes: [...(base?.packetCodes ?? [])],
  };

  (extra.colors ?? []).forEach((value) => addUnique(merged.colors, value));
  (extra.clarities ?? []).forEach((value) => addUnique(merged.clarities, value));
  (extra.shapes ?? []).forEach((value) => addUnique(merged.shapes, value));
  (extra.packetCodes ?? []).forEach((value) => addUnique(merged.packetCodes, value));

  return merged;
};

// Compress and resize image before sending to OpenAI
const processImageToBase64 = async (filePath) => {
  const compressedBuffer = await sharp(filePath)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  return compressedBuffer.toString('base64');
};

const analyzeImages = async (
  frontImagePath,
  backImagePath,
  jewelleryType,
  scanType,
  scannerSettings = {},
  businessId,
) => {
  // Process images in parallel
  const [frontBase64, backBase64] = await Promise.all([
    frontImagePath && fs.existsSync(frontImagePath) ? processImageToBase64(frontImagePath) : null,
    backImagePath && fs.existsSync(backImagePath) ? processImageToBase64(backImagePath) : null,
  ]);

  const userPromptText = getUserPrompt(jewelleryType, scanType, scannerSettings);
  const userContent = [{ type: 'text', text: userPromptText }];

  if (frontBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${frontBase64}` },
    });
  }

  if (backBase64) {
    userContent.push({
      type: 'image_url',
      image_url: { url: `data:image/jpeg;base64,${backBase64}` },
    });
  }

  const customizations = await getPromptCustomizations('diamond', businessId);
  const colorstoneCustomizations = await getPromptCustomizations('colorstone', businessId);
  const orgCustomizations = await buildCustomizationsFromRates(businessId);
  const mergedDiamondCustoms = mergeCustomizations(
    customizations,
    orgCustomizations?.diamond,
  );
  const mergedColorstoneCustoms = mergeCustomizations(
    colorstoneCustomizations,
    orgCustomizations?.colorstone,
  );
  const systemPromptText = getSystemPrompt(mergedDiamondCustoms, mergedColorstoneCustoms);
  const messages = [
    { role: 'system', content: systemPromptText },
    { role: 'user', content: userContent },
  ];

  const promptText = `${systemPromptText}\n\n${userPromptText}`;
  const promptWords = promptText.replace(/\s+/g, ' ').trim().split(' ');
  const promptPreview = promptWords.slice(0, 100).join(' ');
  const promptCharacters = promptText.length;
  const estimatedTokens = Math.ceil(promptCharacters / 4);
  const model = 'gpt-4o';
  const imageCount = Number(Boolean(frontBase64)) + Number(Boolean(backBase64));
  const timestamp = new Date().toISOString();

  console.log('========== OPENAI PROMPT ==========');
  console.log(promptPreview);
  console.log(`Prompt Characters: ${promptCharacters}`);
  console.log(`Estimated Tokens: ${estimatedTokens}`);
  console.log(`Model: ${model}`);
  console.log(`Images: ${imageCount}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log('==================================');

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: messages,
      response_format: { type: 'json_object' },
      max_tokens: 1500,
    });


    console.log("===== OPENAI TOKEN USAGE =====");
console.log(response.usage);
console.log("Prompt Tokens:", response.usage.prompt_tokens);
console.log("Completion Tokens:", response.usage.completion_tokens);
console.log("Total Tokens:", response.usage.total_tokens);
console.log("==============================");

    const responseText = response.choices[0].message.content;
    const parsedData = JSON.parse(responseText);
    
    console.log("=== AI RAW RESPONSE ===");
    console.log(JSON.stringify(parsedData, null, 2));
    console.log("=======================");

    // Add backward compatibility for frontend by flattening the first stone
    if (parsedData.structuredData) {
      if (parsedData.packetCode && !parsedData.structuredData.packetCode) {
        parsedData.structuredData.packetCode = parsedData.packetCode;
      }
      if (parsedData.structuredData.diamonds && parsedData.structuredData.diamonds.length > 0) {

        const firstDia = parsedData.structuredData.diamonds[0];
        parsedData.structuredData.diamondWeight = firstDia.weight || { value: '', confidence: 0 };
        parsedData.structuredData.diamondPieces = firstDia.pieces || { value: '', confidence: 0 };
        parsedData.structuredData.diamondRate = firstDia.rate || { value: '', confidence: 0 };
        parsedData.structuredData.diamondQuality = firstDia.quality || { value: '', confidence: 0 };
        parsedData.structuredData.diamondColor = firstDia.color || { value: '', confidence: 0 };
        parsedData.structuredData.diamondClarity = firstDia.clarity || { value: '', confidence: 0 };
        parsedData.structuredData.diamondShape = firstDia.shape || { value: '', confidence: 0 };
      }

      if (parsedData.structuredData.colorstones && parsedData.structuredData.colorstones.length > 0) {
        const firstCs = parsedData.structuredData.colorstones[0];
        parsedData.structuredData.coloredStoneWeight = firstCs.weight || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStonePieces = firstCs.pieces || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneRate = firstCs.rate || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneQuality = firstCs.quality || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneColor = firstCs.color || { value: '', confidence: 0 };
        parsedData.structuredData.coloredStoneClarity = firstCs.clarity || { value: '', confidence: 0 };
      }
    }

    return parsedData;
  } catch (err) {
    console.error('[OpenAI Error]', err);
    return { error: 'OpenAI API failed', raw: err.message };
  }
};

module.exports = { analyzeImages };
