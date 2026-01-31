const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Add annotations to an image
 * @param {string} input - Input image path
 * @param {object} options - Annotation options
 * @returns {Promise<string>} - Path to annotated image
 */
async function annotateImage(input, options = {}) {
  const {
    output,
    arrows = [],
    boxes = [],
    texts = [],
    blurs = [],
    callouts = []
  } = options;

  // Load the image
  const image = sharp(input);
  const metadata = await image.metadata();
  const { width, height } = metadata;

  // Build SVG overlay for annotations
  let svgParts = [];
  
  // Add boxes (highlights)
  for (const box of boxes) {
    svgParts.push(`
      <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" 
            fill="none" stroke="#FF4444" stroke-width="3" rx="4"/>
    `);
  }

  // Add arrows
  for (const arrow of arrows) {
    const { x: x1, y: y1, w: x2, h: y2 } = arrow;
    // Arrow with head
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 20;
    const headX1 = x2 - headLen * Math.cos(angle - Math.PI / 6);
    const headY1 = y2 - headLen * Math.sin(angle - Math.PI / 6);
    const headX2 = x2 - headLen * Math.cos(angle + Math.PI / 6);
    const headY2 = y2 - headLen * Math.sin(angle + Math.PI / 6);
    
    svgParts.push(`
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" 
            stroke="#FF4444" stroke-width="3"/>
      <polygon points="${x2},${y2} ${headX1},${headY1} ${headX2},${headY2}"
               fill="#FF4444"/>
    `);
  }

  // Add text labels
  for (const text of texts) {
    svgParts.push(`
      <text x="${text.x}" y="${text.y}" 
            font-family="Arial, sans-serif" font-size="${text.size}" 
            fill="${text.color}" font-weight="bold"
            stroke="white" stroke-width="2" paint-order="stroke">
        ${escapeXml(text.text)}
      </text>
    `);
  }

  // Add numbered callouts
  for (const callout of callouts) {
    const radius = 16;
    svgParts.push(`
      <circle cx="${callout.x}" cy="${callout.y}" r="${radius}" 
              fill="#FF4444" stroke="white" stroke-width="2"/>
      <text x="${callout.x}" y="${callout.y + 5}" 
            text-anchor="middle" font-family="Arial" font-size="14" 
            fill="white" font-weight="bold">
        ${callout.number}
      </text>
    `);
  }

  // Create SVG overlay
  const svgOverlay = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgParts.join('\n')}
    </svg>
  `;

  // Apply blur regions first
  let processedImage = image;
  for (const blur of blurs) {
    // Extract region, blur it, then composite back
    const blurredRegion = await sharp(input)
      .extract({ left: blur.x, top: blur.y, width: blur.w, height: blur.h })
      .blur(15)
      .toBuffer();

    processedImage = processedImage.composite([{
      input: blurredRegion,
      left: blur.x,
      top: blur.y
    }]);
  }

  // Composite SVG overlay
  const finalImage = await processedImage
    .composite([{
      input: Buffer.from(svgOverlay),
      top: 0,
      left: 0
    }])
    .toFile(output);

  return path.resolve(output);
}

/**
 * Add a highlight box around a region
 */
async function addHighlight(input, output, region, color = '#FF4444') {
  return annotateImage(input, {
    output,
    boxes: [{ ...region }]
  });
}

/**
 * Blur a sensitive region
 */
async function blurRegion(input, output, region) {
  return annotateImage(input, {
    output,
    blurs: [region]
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  annotateImage,
  addHighlight,
  blurRegion
};
