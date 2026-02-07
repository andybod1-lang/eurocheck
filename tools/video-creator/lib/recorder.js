/**
 * Screen recording using ffmpeg
 * macOS: Uses AVFoundation capture
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

async function record(options) {
  const {
    output,
    duration = 30,
    width = 1920,
    height = 1080,
    x = 0,
    y = 0,
    fps = 30,
    device = '1' // macOS screen device index
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    // macOS AVFoundation screen capture
    const command = ffmpeg()
      .input(`${device}:none`) // screen:audio device
      .inputFormat('avfoundation')
      .inputOptions([
        `-capture_cursor 1`,
        `-capture_mouse_clicks 1`,
        `-framerate ${fps}`
      ])
      .outputOptions([
        `-t ${duration}`,
        `-vf crop=${width}:${height}:${x}:${y}`,
        `-c:v libx264`,
        `-preset ultrafast`,
        `-pix_fmt yuv420p`,
        `-crf 23`
      ])
      .output(outputPath)
      .on('start', (cmd) => {
        console.log(`  Command: ${cmd}`);
      })
      .on('progress', (progress) => {
        if (progress.timemark) {
          process.stdout.write(`\r  Recording: ${progress.timemark}`);
        }
      })
      .on('end', () => {
        console.log('');
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`Recording failed: ${err.message}`));
      });

    command.run();
  });
}

// Record a specific window by name (macOS)
async function recordWindow(options) {
  const { windowName, ...rest } = options;
  
  // For window-specific recording, we'd need to use screencapture
  // or a more sophisticated approach. For now, use full screen.
  console.warn('⚠️  Window-specific recording not yet implemented, using full screen');
  return record(rest);
}

// Record with countdown
async function recordWithCountdown(options, countdownSeconds = 3) {
  console.log(`Starting in ${countdownSeconds}...`);
  for (let i = countdownSeconds; i > 0; i--) {
    console.log(`  ${i}...`);
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('  Recording!');
  return record(options);
}

module.exports = {
  record,
  recordWindow,
  recordWithCountdown
};
