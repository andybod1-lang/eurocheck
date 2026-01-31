/**
 * A/B testing variant generator
 */

const path = require('path');
const fs = require('fs');
const generator = require('./generator');
const templates = require('./templates');

/**
 * Generate A/B test variants
 */
async function generateVariants(options) {
  const {
    outputDir,
    template = 'eurocheck-basic',
    title,
    varyColors = false,
    varyLayout = false,
    varyText = false,
    count = 4
  } = options;

  // Ensure output dir exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const results = [];
  const colorSchemes = templates.getColorSchemes();
  const colorKeys = Object.keys(colorSchemes);
  
  // Text variations
  const textVariations = title ? generateTextVariations(title) : [title];
  
  for (let i = 0; i < count; i++) {
    const variant = {
      output: path.join(outputDir, `variant_${String(i + 1).padStart(2, '0')}.png`),
      template,
      title: varyText && textVariations[i % textVariations.length] ? textVariations[i % textVariations.length] : title
    };
    
    // Color variations
    if (varyColors) {
      const scheme = colorSchemes[colorKeys[i % colorKeys.length]];
      variant.bgColor = scheme.bg;
      variant.primaryColor = scheme.primary;
      variant.accentColor = scheme.accent;
    }
    
    // Width/height variations (same content, different crop)
    if (varyLayout && i % 2 === 1) {
      variant.width = 1200;
      variant.height = 675;
    }
    
    await generator.create(variant);
    results.push(variant.output);
    
    // Log variant details
    console.log(`  Variant ${i + 1}: ${varyColors ? colorKeys[i % colorKeys.length] : 'default'} colors`);
  }

  // Generate tracking CSV
  const trackingPath = path.join(outputDir, 'variants.csv');
  const trackingContent = [
    'variant,file,colors,title',
    ...results.map((r, i) => 
      `${i + 1},${path.basename(r)},${varyColors ? colorKeys[i % colorKeys.length] : 'default'},${varyText ? textVariations[i % textVariations.length] : title}`
    )
  ].join('\n');
  fs.writeFileSync(trackingPath, trackingContent);
  console.log(`  📊 Tracking CSV: ${trackingPath}`);

  return results;
}

/**
 * Generate text variations from original
 */
function generateTextVariations(original) {
  const variations = [original];
  
  // All caps
  variations.push(original.toUpperCase());
  
  // Title case
  variations.push(toTitleCase(original));
  
  // With emoji
  const emojis = ['🔥', '⚡', '💰', '🎯', '✨'];
  variations.push(`${emojis[Math.floor(Math.random() * emojis.length)]} ${original}`);
  
  // Shortened
  if (original.length > 20) {
    variations.push(original.split(' ').slice(0, 4).join(' ') + '...');
  }
  
  return variations;
}

/**
 * Title case helper
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, txt => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Analyze performance (placeholder for integration)
 */
function analyzeResults(csvPath) {
  // This would integrate with analytics to determine winner
  // For now, return structure for manual tracking
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  const results = lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
  });
  
  return {
    variants: results,
    winner: null, // Would be determined by actual performance data
    metrics: {
      clicks: [],
      impressions: [],
      ctr: []
    }
  };
}

module.exports = {
  generateVariants,
  generateTextVariations,
  analyzeResults
};
