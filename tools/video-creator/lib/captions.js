/**
 * Caption/subtitle overlay system
 * Uses ffmpeg drawtext filter for text overlay
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Add text caption overlay to video
 */
async function add(options) {
  const {
    input,
    output,
    text,
    font = 'Arial',
    fontSize = 48,
    color = 'white',
    bgColor = 'black@0.7',
    position = 'bottom',
    start = 0,
    end = 0
  } = options;

  const outputPath = path.resolve(output);
  
  // Check if text is a file path (SRT)
  let captionText = text;
  if (text && fs.existsSync(text) && text.endsWith('.srt')) {
    // Use subtitles filter for SRT files
    return addFromSRT({ input, output, srtFile: text });
  }

  // Position calculations
  const positions = {
    top: 'y=50',
    middle: 'y=(h-text_h)/2',
    bottom: 'y=h-text_h-50'
  };
  const yPos = positions[position] || positions.bottom;

  // Build drawtext filter
  const escapedText = captionText
    .replace(/'/g, "'\\''")
    .replace(/:/g, '\\:')
    .replace(/\\/g, '\\\\');

  let drawtext = `drawtext=text='${escapedText}':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=${fontSize}:fontcolor=${color}:x=(w-text_w)/2:${yPos}:box=1:boxcolor=${bgColor}:boxborderw=10`;

  // Add time constraints if specified
  if (start > 0 || end > 0) {
    drawtext += `:enable='between(t,${start},${end || 9999})'`;
  }

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.resolve(input))
      .outputOptions([
        `-vf ${drawtext}`,
        '-c:v libx264',
        '-c:a copy',
        '-crf 18'
      ])
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  Captioning: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('');
        resolve(outputPath);
      })
      .on('error', (err) => reject(new Error(`Caption failed: ${err.message}`)))
      .run();
  });
}

/**
 * Add captions from SRT file
 */
async function addFromSRT(options) {
  const {
    input,
    output,
    srtFile,
    style = {}
  } = options;

  const outputPath = path.resolve(output);
  const srtPath = path.resolve(srtFile);
  
  // Default subtitle style
  const defaultStyle = {
    fontSize: 24,
    fontColor: '&Hffffff',
    outlineColor: '&H000000',
    outline: 2
  };
  const s = { ...defaultStyle, ...style };

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(path.resolve(input))
      .outputOptions([
        `-vf subtitles='${srtPath}':force_style='FontSize=${s.fontSize},PrimaryColour=${s.fontColor},OutlineColour=${s.outlineColor},Outline=${s.outline}'`,
        '-c:v libx264',
        '-c:a copy',
        '-crf 18'
      ])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`SRT overlay failed: ${err.message}`)))
      .run();
  });
}

/**
 * Generate SRT from text with timing
 */
function generateSRT(segments) {
  // segments: [{ text, start, end }, ...]
  let srt = '';
  segments.forEach((seg, i) => {
    const formatTime = (s) => {
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = Math.floor(s % 60);
      const ms = Math.floor((s % 1) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };
    srt += `${i + 1}\n`;
    srt += `${formatTime(seg.start)} --> ${formatTime(seg.end)}\n`;
    srt += `${seg.text}\n\n`;
  });
  return srt;
}

/**
 * Split text into timed segments for automatic captions
 */
function autoSegment(text, totalDuration, wordsPerSegment = 5) {
  const words = text.split(/\s+/);
  const segments = [];
  const segmentCount = Math.ceil(words.length / wordsPerSegment);
  const segmentDuration = totalDuration / segmentCount;

  for (let i = 0; i < segmentCount; i++) {
    const start = i * segmentDuration;
    const end = (i + 1) * segmentDuration;
    const segmentWords = words.slice(i * wordsPerSegment, (i + 1) * wordsPerSegment);
    segments.push({
      text: segmentWords.join(' '),
      start,
      end
    });
  }
  return segments;
}

module.exports = {
  add,
  addFromSRT,
  generateSRT,
  autoSegment
};
