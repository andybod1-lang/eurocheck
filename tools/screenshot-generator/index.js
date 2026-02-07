#!/usr/bin/env node

const { program } = require('commander');
const { captureScreenshot } = require('./lib/capture');
const { annotateImage } = require('./lib/annotate');
const { applyBranding } = require('./lib/brand');
const path = require('path');

program
  .name('screenshot')
  .description('EuroCheck Screenshot Generator - capture, annotate, and brand screenshots')
  .version('1.0.0');

// Capture command
program
  .command('capture <url>')
  .description('Capture a screenshot of a URL')
  .option('-o, --output <path>', 'Output file path', 'screenshot.png')
  .option('-f, --full-page', 'Capture full page (not just viewport)')
  .option('-w, --width <pixels>', 'Viewport width', '1920')
  .option('-h, --height <pixels>', 'Viewport height', '1080')
  .option('-d, --device <name>', 'Emulate device (desktop, tablet, mobile)')
  .option('--delay <ms>', 'Wait before capture', '1000')
  .action(async (url, options) => {
    try {
      const result = await captureScreenshot(url, {
        output: options.output,
        fullPage: options.fullPage,
        width: parseInt(options.width),
        height: parseInt(options.height),
        device: options.device,
        delay: parseInt(options.delay)
      });
      console.log(`✅ Screenshot saved: ${result}`);
    } catch (error) {
      console.error(`❌ Capture failed: ${error.message}`);
      process.exit(1);
    }
  });

// Annotate command
program
  .command('annotate <input>')
  .description('Add annotations to an image')
  .option('-o, --output <path>', 'Output file path')
  .option('--arrow <coords>', 'Add arrow (x1,y1,x2,y2)', collectMultiple, [])
  .option('--box <coords>', 'Add box highlight (x,y,w,h)', collectMultiple, [])
  .option('--text <spec>', 'Add text (x,y,text,size,color)', collectMultiple, [])
  .option('--blur <coords>', 'Blur region (x,y,w,h)', collectMultiple, [])
  .option('--callout <spec>', 'Add numbered callout (x,y,number)', collectMultiple, [])
  .action(async (input, options) => {
    try {
      const output = options.output || input.replace(/(\.[^.]+)$/, '-annotated$1');
      const result = await annotateImage(input, {
        output,
        arrows: parseCoords(options.arrow),
        boxes: parseCoords(options.box),
        texts: parseTexts(options.text),
        blurs: parseCoords(options.blur),
        callouts: parseCallouts(options.callout)
      });
      console.log(`✅ Annotated image saved: ${result}`);
    } catch (error) {
      console.error(`❌ Annotation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Brand command  
program
  .command('brand <input>')
  .description('Apply branding to an image')
  .option('-o, --output <path>', 'Output file path')
  .option('--logo <path>', 'Logo file to overlay')
  .option('--logo-position <pos>', 'Logo position (top-left, top-right, bottom-left, bottom-right)', 'bottom-right')
  .option('--logo-size <percent>', 'Logo size as percentage of image width', '10')
  .option('--frame <name>', 'Apply frame template (browser, phone, tablet, minimal)')
  .option('--watermark <text>', 'Add text watermark')
  .action(async (input, options) => {
    try {
      const output = options.output || input.replace(/(\.[^.]+)$/, '-branded$1');
      const result = await applyBranding(input, {
        output,
        logo: options.logo,
        logoPosition: options.logoPosition,
        logoSize: parseInt(options.logoSize),
        frame: options.frame,
        watermark: options.watermark
      });
      console.log(`✅ Branded image saved: ${result}`);
    } catch (error) {
      console.error(`❌ Branding failed: ${error.message}`);
      process.exit(1);
    }
  });

// Pipeline command - capture, annotate, and brand in one go
program
  .command('pipeline <url>')
  .description('Capture, annotate, and brand in one command')
  .option('-o, --output <path>', 'Final output path', 'final.png')
  .option('--full-page', 'Capture full page')
  .option('--device <name>', 'Emulate device')
  .option('--logo <path>', 'Logo to add')
  .option('--frame <name>', 'Frame template')
  .action(async (url, options) => {
    try {
      const tempCapture = `/tmp/capture-${Date.now()}.png`;
      
      // Step 1: Capture
      console.log('📸 Capturing screenshot...');
      await captureScreenshot(url, {
        output: tempCapture,
        fullPage: options.fullPage,
        device: options.device
      });
      
      // Step 2: Brand
      console.log('🎨 Applying branding...');
      await applyBranding(tempCapture, {
        output: options.output,
        logo: options.logo,
        frame: options.frame
      });
      
      console.log(`✅ Pipeline complete: ${options.output}`);
    } catch (error) {
      console.error(`❌ Pipeline failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper functions
function collectMultiple(value, previous) {
  return previous.concat([value]);
}

function parseCoords(arr) {
  return arr.map(s => {
    const [x, y, w, h] = s.split(',').map(Number);
    return { x, y, w: w || 0, h: h || 0 };
  });
}

function parseTexts(arr) {
  return arr.map(s => {
    const parts = s.split(',');
    return {
      x: parseInt(parts[0]),
      y: parseInt(parts[1]),
      text: parts[2] || '',
      size: parseInt(parts[3]) || 24,
      color: parts[4] || '#FF0000'
    };
  });
}

function parseCallouts(arr) {
  return arr.map(s => {
    const [x, y, number] = s.split(',');
    return { x: parseInt(x), y: parseInt(y), number: parseInt(number) };
  });
}

program.parse();
