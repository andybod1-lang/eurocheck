const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Frame template dimensions
const FRAMES = {
  browser: {
    topBar: 72,
    borderRadius: 12,
    shadow: true,
    bgColor: '#1a1a1a'
  },
  phone: {
    padding: 20,
    borderRadius: 40,
    notch: true,
    bgColor: '#000000'
  },
  tablet: {
    padding: 30,
    borderRadius: 24,
    bgColor: '#2a2a2a'
  },
  minimal: {
    padding: 20,
    borderRadius: 8,
    shadow: true,
    bgColor: '#ffffff'
  }
};

/**
 * Apply branding to an image
 * @param {string} input - Input image path
 * @param {object} options - Branding options
 * @returns {Promise<string>} - Path to branded image
 */
async function applyBranding(input, options = {}) {
  const {
    output,
    logo = null,
    logoPosition = 'bottom-right',
    logoSize = 10,
    frame = null,
    watermark = null
  } = options;

  let image = sharp(input);
  const metadata = await image.metadata();
  let { width, height } = metadata;

  // Apply frame template
  if (frame && FRAMES[frame]) {
    image = await applyFrame(image, metadata, frame);
    // Update dimensions after frame
    const framedMeta = await image.metadata();
    width = framedMeta.width;
    height = framedMeta.height;
  }

  // Build composites
  const composites = [];

  // Add logo
  if (logo) {
    try {
      const logoBuffer = await fs.readFile(logo);
      const logoMeta = await sharp(logoBuffer).metadata();
      const targetWidth = Math.round(width * (logoSize / 100));
      const targetHeight = Math.round((targetWidth / logoMeta.width) * logoMeta.height);

      const resizedLogo = await sharp(logoBuffer)
        .resize(targetWidth, targetHeight)
        .toBuffer();

      const padding = 20;
      let logoLeft, logoTop;

      switch (logoPosition) {
        case 'top-left':
          logoLeft = padding;
          logoTop = padding;
          break;
        case 'top-right':
          logoLeft = width - targetWidth - padding;
          logoTop = padding;
          break;
        case 'bottom-left':
          logoLeft = padding;
          logoTop = height - targetHeight - padding;
          break;
        case 'bottom-right':
        default:
          logoLeft = width - targetWidth - padding;
          logoTop = height - targetHeight - padding;
          break;
      }

      composites.push({
        input: resizedLogo,
        left: logoLeft,
        top: logoTop
      });
    } catch (err) {
      console.warn(`Warning: Could not load logo: ${err.message}`);
    }
  }

  // Add watermark text
  if (watermark) {
    const fontSize = Math.round(width * 0.02);
    const padding = 20;
    
    const watermarkSvg = `
      <svg width="${width}" height="${height}">
        <text x="${width - padding}" y="${height - padding}" 
              text-anchor="end" font-family="Arial" font-size="${fontSize}"
              fill="rgba(255,255,255,0.5)">
          ${escapeXml(watermark)}
        </text>
      </svg>
    `;

    composites.push({
      input: Buffer.from(watermarkSvg),
      top: 0,
      left: 0
    });
  }

  // Apply composites and save
  if (composites.length > 0) {
    image = image.composite(composites);
  }

  await image.toFile(output);
  return path.resolve(output);
}

/**
 * Apply a frame template to an image
 */
async function applyFrame(image, metadata, frameName) {
  const frameConfig = FRAMES[frameName];
  const { width, height } = metadata;
  const imageBuffer = await image.toBuffer();

  if (frameName === 'browser') {
    // Browser chrome frame
    const topBar = frameConfig.topBar;
    const newHeight = height + topBar;
    const radius = frameConfig.borderRadius;

    // Create browser chrome SVG
    const chromeSvg = `
      <svg width="${width}" height="${newHeight}">
        <defs>
          <clipPath id="rounded">
            <rect x="0" y="0" width="${width}" height="${newHeight}" rx="${radius}"/>
          </clipPath>
        </defs>
        
        <!-- Background -->
        <rect width="${width}" height="${newHeight}" fill="${frameConfig.bgColor}" 
              clip-path="url(#rounded)"/>
        
        <!-- Top bar -->
        <rect y="0" width="${width}" height="${topBar}" fill="#2d2d2d"/>
        
        <!-- Traffic lights -->
        <circle cx="20" cy="${topBar/2}" r="6" fill="#ff5f57"/>
        <circle cx="40" cy="${topBar/2}" r="6" fill="#febc2e"/>
        <circle cx="60" cy="${topBar/2}" r="6" fill="#28c840"/>
        
        <!-- URL bar -->
        <rect x="100" y="${topBar/2 - 12}" width="${width - 200}" height="24" 
              rx="4" fill="#1a1a1a"/>
      </svg>
    `;

    return sharp({
      create: {
        width,
        height: newHeight,
        channels: 4,
        background: { r: 26, g: 26, b: 26, alpha: 1 }
      }
    })
    .composite([
      { input: Buffer.from(chromeSvg), top: 0, left: 0 },
      { input: imageBuffer, top: topBar, left: 0 }
    ]);
  }

  if (frameName === 'phone') {
    // Phone frame
    const padding = frameConfig.padding;
    const newWidth = width + padding * 2;
    const newHeight = height + padding * 2 + 40; // Extra for notch
    const radius = frameConfig.borderRadius;

    return sharp({
      create: {
        width: newWidth,
        height: newHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      }
    })
    .composite([
      {
        input: await sharp({
          create: {
            width: newWidth,
            height: newHeight,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 1 }
          }
        }).png().toBuffer(),
        top: 0,
        left: 0
      },
      { input: imageBuffer, top: padding + 20, left: padding }
    ]);
  }

  // Default: minimal frame
  const padding = frameConfig.padding;
  return sharp({
    create: {
      width: width + padding * 2,
      height: height + padding * 2,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: imageBuffer, top: padding, left: padding }
  ]);
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = {
  applyBranding,
  applyFrame,
  FRAMES
};
