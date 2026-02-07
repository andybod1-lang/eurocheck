/**
 * Audio handling - music mixing, volume control, ducking
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Add background music to video
 */
async function addMusic(options) {
  const {
    input,
    output,
    audio,
    volume = 0.3,
    ducking = false,
    fadeIn = 1,
    fadeOut = 2,
    loop = false
  } = options;

  const outputPath = path.resolve(output);
  const inputPath = path.resolve(input);
  const audioPath = path.resolve(audio);

  // Get video duration first
  const duration = await getDuration(inputPath);

  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(inputPath)
      .input(audioPath);

    // Build audio filter
    let audioFilters = [];
    
    // Music volume
    audioFilters.push(`[1:a]volume=${volume}`);
    
    // Fade in/out
    if (fadeIn > 0) {
      audioFilters[0] += `,afade=t=in:st=0:d=${fadeIn}`;
    }
    if (fadeOut > 0 && duration > fadeOut) {
      audioFilters[0] += `,afade=t=out:st=${duration - fadeOut}:d=${fadeOut}`;
    }
    
    // Trim/loop to video duration
    if (loop) {
      audioFilters[0] = `[1:a]aloop=loop=-1:size=2e+09,${audioFilters[0].replace('[1:a]', '')}`;
    }
    audioFilters[0] += `[music]`;

    // Mix original audio with music
    let filterComplex = audioFilters.join(';');
    
    if (ducking) {
      // Use sidechaincompress for ducking (lower music when speech detected)
      filterComplex = `[1:a]volume=${volume}${fadeIn > 0 ? `,afade=t=in:st=0:d=${fadeIn}` : ''}${fadeOut > 0 ? `,afade=t=out:st=${duration - fadeOut}:d=${fadeOut}` : ''}[music];[0:a][music]sidechaincompress=threshold=0.03:ratio=4:attack=200:release=1000[out]`;
    } else {
      filterComplex += `;[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[out]`;
    }

    command
      .outputOptions([
        `-filter_complex ${filterComplex}`,
        '-map 0:v',
        '-map [out]',
        '-c:v copy',
        '-c:a aac',
        '-b:a 192k',
        `-t ${duration}`
      ])
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  Adding music: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('');
        resolve(outputPath);
      })
      .on('error', (err) => reject(new Error(`Music add failed: ${err.message}`)))
      .run();
  });
}

/**
 * Replace audio track entirely
 */
async function replaceAudio(options) {
  const {
    input,
    output,
    audio,
    volume = 1.0
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.resolve(input))
      .input(path.resolve(audio))
      .outputOptions([
        '-map 0:v',
        '-map 1:a',
        `-filter:a volume=${volume}`,
        '-c:v copy',
        '-c:a aac',
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Audio replace failed: ${err.message}`)))
      .run();
  });
}

/**
 * Extract audio from video
 */
async function extractAudio(options) {
  const {
    input,
    output,
    format = 'mp3'
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(path.resolve(input))
      .outputOptions(['-vn']);

    if (format === 'mp3') {
      command.outputOptions(['-c:a libmp3lame', '-b:a 192k']);
    } else if (format === 'aac') {
      command.outputOptions(['-c:a aac', '-b:a 192k']);
    } else if (format === 'wav') {
      command.outputOptions(['-c:a pcm_s16le']);
    }

    command
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Audio extract failed: ${err.message}`)))
      .run();
  });
}

/**
 * Adjust volume of video's audio
 */
async function adjustVolume(options) {
  const {
    input,
    output,
    volume = 1.0 // 1.0 = normal, 2.0 = double, 0.5 = half
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.resolve(input))
      .outputOptions([
        `-filter:a volume=${volume}`,
        '-c:v copy',
        '-c:a aac'
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Volume adjust failed: ${err.message}`)))
      .run();
  });
}

/**
 * Get video duration in seconds
 */
function getDuration(input) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path.resolve(input), (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

/**
 * Normalize audio levels
 */
async function normalize(options) {
  const {
    input,
    output,
    targetLevel = -16 // LUFS target
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.resolve(input))
      .outputOptions([
        `-filter:a loudnorm=I=${targetLevel}:TP=-1.5:LRA=11`,
        '-c:v copy',
        '-c:a aac'
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Normalize failed: ${err.message}`)))
      .run();
  });
}

module.exports = {
  addMusic,
  replaceAudio,
  extractAudio,
  adjustVolume,
  normalize,
  getDuration
};
