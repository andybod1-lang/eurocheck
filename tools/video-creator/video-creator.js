#!/usr/bin/env node
/**
 * Video Creator CLI - Short video creation for social media marketing
 * Supports Twitter, TikTok, YouTube Shorts formats
 */

const { program } = require('commander');
const path = require('path');
const recorder = require('./lib/recorder');
const editor = require('./lib/editor');
const captions = require('./lib/captions');
const audio = require('./lib/audio');
const presets = require('./lib/presets');

program
  .name('video-creator')
  .description('CLI tool for creating short marketing videos')
  .version('1.0.0');

// Record screen
program
  .command('record <output>')
  .description('Record screen region or window')
  .option('-d, --duration <seconds>', 'Recording duration', '30')
  .option('-w, --width <pixels>', 'Capture width', '1920')
  .option('-h, --height <pixels>', 'Capture height', '1080')
  .option('-x, --x-offset <pixels>', 'X offset', '0')
  .option('-y, --y-offset <pixels>', 'Y offset', '0')
  .option('-f, --fps <fps>', 'Frames per second', '30')
  .option('--device <index>', 'AVFoundation device index', '1')
  .action(async (output, options) => {
    try {
      console.log(`🎬 Recording ${options.duration}s video...`);
      const result = await recorder.record({
        output,
        duration: parseInt(options.duration),
        width: parseInt(options.width),
        height: parseInt(options.height),
        x: parseInt(options.xOffset),
        y: parseInt(options.yOffset),
        fps: parseInt(options.fps),
        device: options.device
      });
      console.log(`✅ Recorded: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Combine clips
program
  .command('combine <files...>')
  .description('Combine multiple video clips')
  .requiredOption('-o, --output <file>', 'Output file')
  .option('-t, --transition <type>', 'Transition type: fade, dissolve, none', 'fade')
  .option('--transition-duration <seconds>', 'Transition duration', '0.5')
  .action(async (files, options) => {
    try {
      console.log(`🔗 Combining ${files.length} clips...`);
      const result = await editor.combine({
        inputs: files,
        output: options.output,
        transition: options.transition,
        transitionDuration: parseFloat(options.transitionDuration)
      });
      console.log(`✅ Combined: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Add captions
program
  .command('caption <video>')
  .description('Add captions/subtitles to video')
  .requiredOption('-o, --output <file>', 'Output file')
  .option('-t, --text <text>', 'Caption text (or path to SRT file)')
  .option('--font <name>', 'Font name', 'Arial')
  .option('--font-size <size>', 'Font size', '48')
  .option('--color <hex>', 'Text color', 'white')
  .option('--bg-color <hex>', 'Background color', 'black@0.7')
  .option('--position <pos>', 'Position: top, middle, bottom', 'bottom')
  .option('--start <seconds>', 'Start time', '0')
  .option('--end <seconds>', 'End time (0 = video end)', '0')
  .action(async (video, options) => {
    try {
      console.log(`📝 Adding captions...`);
      const result = await captions.add({
        input: video,
        output: options.output,
        text: options.text,
        font: options.font,
        fontSize: parseInt(options.fontSize),
        color: options.color,
        bgColor: options.bgColor,
        position: options.position,
        start: parseFloat(options.start),
        end: parseFloat(options.end)
      });
      console.log(`✅ Captioned: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Add music/audio
program
  .command('music <video>')
  .description('Add background music with volume ducking')
  .requiredOption('-o, --output <file>', 'Output file')
  .requiredOption('-a, --audio <file>', 'Audio file to add')
  .option('-v, --volume <level>', 'Music volume (0-1)', '0.3')
  .option('--ducking', 'Enable volume ducking for speech', false)
  .option('--fade-in <seconds>', 'Fade in duration', '1')
  .option('--fade-out <seconds>', 'Fade out duration', '2')
  .option('--loop', 'Loop audio if shorter than video', false)
  .action(async (video, options) => {
    try {
      console.log(`🎵 Adding music...`);
      const result = await audio.addMusic({
        input: video,
        output: options.output,
        audio: options.audio,
        volume: parseFloat(options.volume),
        ducking: options.ducking,
        fadeIn: parseFloat(options.fadeIn),
        fadeOut: parseFloat(options.fadeOut),
        loop: options.loop
      });
      console.log(`✅ Music added: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Export to format
program
  .command('export <video>')
  .description('Export video to social media format')
  .requiredOption('-o, --output <file>', 'Output file')
  .option('-p, --preset <name>', 'Preset: twitter, tiktok, youtube_shorts, instagram_reels', 'twitter')
  .option('-f, --format <fmt>', 'Format: mp4, webm, gif', 'mp4')
  .option('--quality <level>', 'Quality: low, medium, high', 'high')
  .option('--crop <mode>', 'Crop mode: fit, fill, stretch', 'fit')
  .action(async (video, options) => {
    try {
      const preset = presets.get(options.preset);
      console.log(`📤 Exporting for ${options.preset} (${preset.width}x${preset.height})...`);
      const result = await editor.export({
        input: video,
        output: options.output,
        preset,
        format: options.format,
        quality: options.quality,
        crop: options.crop
      });
      console.log(`✅ Exported: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Quick create - all-in-one
program
  .command('quick <output>')
  .description('Quick create: record + caption + export')
  .option('-d, --duration <seconds>', 'Recording duration', '30')
  .option('-t, --text <text>', 'Caption text')
  .option('-p, --preset <name>', 'Export preset', 'twitter')
  .option('-m, --music <file>', 'Background music file')
  .action(async (output, options) => {
    try {
      const tempDir = '/tmp/video-creator';
      const fs = require('fs');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      // Record
      console.log(`🎬 Recording...`);
      const recorded = await recorder.record({
        output: `${tempDir}/raw.mp4`,
        duration: parseInt(options.duration),
        width: 1920,
        height: 1080,
        fps: 30
      });
      
      let current = recorded;
      
      // Caption if provided
      if (options.text) {
        console.log(`📝 Adding caption...`);
        current = await captions.add({
          input: current,
          output: `${tempDir}/captioned.mp4`,
          text: options.text,
          position: 'bottom'
        });
      }
      
      // Music if provided
      if (options.music) {
        console.log(`🎵 Adding music...`);
        current = await audio.addMusic({
          input: current,
          output: `${tempDir}/with-music.mp4`,
          audio: options.music,
          volume: 0.3
        });
      }
      
      // Export
      const preset = presets.get(options.preset);
      console.log(`📤 Exporting for ${options.preset}...`);
      const result = await editor.export({
        input: current,
        output,
        preset,
        format: 'mp4',
        quality: 'high',
        crop: 'fit'
      });
      
      console.log(`✅ Done: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// List presets
program
  .command('presets')
  .description('List available format presets')
  .action(() => {
    console.log('\n📐 Available Presets:\n');
    const all = presets.list();
    for (const [name, p] of Object.entries(all)) {
      console.log(`  ${name}:`);
      console.log(`    Size: ${p.width}x${p.height} (${p.aspect})`);
      console.log(`    Max duration: ${p.maxDuration}s`);
      console.log(`    Notes: ${p.notes}\n`);
    }
  });

program.parse();
