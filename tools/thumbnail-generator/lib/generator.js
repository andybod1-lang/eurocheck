/**
 * Thumbnail generator core - sharp-based
 * Creates thumbnails using SVG overlays with sharp
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const templates = require('./templates');

/**
 * Create a thumbnail using SVG overlay
 */
async function create(options) {
  const {
    output,
    template: templateName = 'eurocheck-basic',
    title,
    subtitle,
    badge,
    logo,
    background,
    bgColor,
    primaryColor,
    accentColor,
    width = 1280,
    height = 720
  } = options;

  const template = templates.get(templateName);
  const outputPath = path.resolve(output);
  
  const bg = bgColor || template.colors.background;
  const primary = primaryColor || template.colors.primary;
  const accent = accentColor || template.colors.accent;
  const gradient = template.colors.gradient;

  // Build SVG for text overlays
  const svgParts = [];
  svgParts.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`);
  
  // Definitions for gradients
  if (gradient) {
    svgParts.push(`<defs>
      <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradient[1] || bg};stop-opacity:1" />
      </linearGradient>
    </defs>`);
    svgParts.push(`<rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>`);
  } else {
    svgParts.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);
  }
  
  // Badge
  if (badge) {
    const badgeX = width - 140;
    svgParts.push(`<rect x="${badgeX}" y="40" width="110" height="36" rx="5" fill="${accent}"/>`);
    svgParts.push(`<text x="${badgeX + 55}" y="64" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${escapeXml(badge.toUpperCase())}</text>`);
  }
  
  // Title
  if (title) {
    const layout = template.layout.title;
    const fontSize = layout.fontSize || 72;
    const x = resolvePosition(layout.x, width);
    const y = resolvePosition(layout.y, height);
    
    // Shadow
    svgParts.push(`<text x="${x + 3}" y="${y + 3}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="rgba(0,0,0,0.5)" text-anchor="middle" dominant-baseline="middle">${escapeXml(title)}</text>`);
    // Main text
    svgParts.push(`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="${primary}" text-anchor="middle" dominant-baseline="middle">${escapeXml(title)}</text>`);
  }
  
  // Subtitle
  if (subtitle) {
    const layout = template.layout.subtitle || { x: 'center', y: '60%', fontSize: 36 };
    const fontSize = layout.fontSize || 36;
    const x = resolvePosition(layout.x, width);
    const y = resolvePosition(layout.y, height);
    
    svgParts.push(`<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${primary}" fill-opacity="0.9" text-anchor="middle" dominant-baseline="middle">${escapeXml(subtitle)}</text>`);
  }
  
  svgParts.push('</svg>');
  const svgBuffer = Buffer.from(svgParts.join('\n'));

  // Create base image
  let baseImage;
  
  if (background && fs.existsSync(background)) {
    // Use background image with overlay
    baseImage = sharp(background)
      .resize(width, height, { fit: 'cover' })
      .composite([{
        input: Buffer.from(`<svg width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="rgba(0,0,0,0.5)"/></svg>`),
        blend: 'over'
      }]);
  } else {
    // Create from SVG (includes background)
    baseImage = sharp(svgBuffer);
  }

  // Composite SVG text overlay if we used a background image
  if (background && fs.existsSync(background)) {
    baseImage = baseImage.composite([{
      input: svgBuffer,
      blend: 'over'
    }]);
  }
  
  // Add logo if provided
  if (logo && fs.existsSync(logo)) {
    const logoBuffer = await sharp(logo)
      .resize(180, 80, { fit: 'inside' })
      .toBuffer();
    
    baseImage = baseImage.composite([{
      input: logoBuffer,
      top: 40,
      left: 40
    }]);
  }

  // Output
  await baseImage
    .png({ quality: 90 })
    .toFile(outputPath);

  return outputPath;
}

/**
 * Resize existing image
 */
async function resize(input, output, width, height) {
  const outputPath = path.resolve(output);
  
  await sharp(path.resolve(input))
    .resize(width, height, { fit: 'cover' })
    .png({ quality: 90 })
    .toFile(outputPath);

  return outputPath;
}

/**
 * Batch generate from CSV
 */
async function batch(options) {
  const { csvFile, outputDir, template } = options;
  
  // Ensure output dir exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Read CSV
  const content = fs.readFileSync(csvFile, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((h, idx) => row[h] = values[idx]?.trim());
    
    const output = path.join(outputDir, `${i.toString().padStart(3, '0')}_${(row.title || 'thumb').replace(/\s+/g, '-').slice(0, 20)}.png`);
    
    await create({
      output,
      template,
      title: row.title,
      subtitle: row.subtitle,
      badge: row.badge,
      bgColor: row.bgColor,
      primaryColor: row.primaryColor,
      accentColor: row.accentColor
    });
    
    results.push(output);
  }
  
  return results;
}

// Helper: resolve position (e.g., 'center', '40%', 100)
function resolvePosition(pos, dimension) {
  if (typeof pos === 'number') return pos;
  if (pos === 'center') return dimension / 2;
  if (pos.endsWith('%')) return (parseFloat(pos) / 100) * dimension;
  if (pos.startsWith('right-')) return dimension - parseInt(pos.split('-')[1]);
  return parseInt(pos) || dimension / 2;
}

// Helper: escape XML special chars
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Helper: parse CSV line handling quoted values
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

module.exports = {
  create,
  resize,
  batch
};
