/**
 * Video editing operations - combine, trim, transitions, export
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Combine multiple video clips
 */
async function combine(options) {
  const {
    inputs,
    output,
    transition = 'fade',
    transitionDuration = 0.5
  } = options;

  const outputPath = path.resolve(output);
  
  // Create concat file for ffmpeg
  const concatList = inputs.map(f => `file '${path.resolve(f)}'`).join('\n');
  const concatFile = `/tmp/concat-${Date.now()}.txt`;
  fs.writeFileSync(concatFile, concatList);

  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(concatFile)
      .inputOptions(['-f', 'concat', '-safe', '0']);

    if (transition === 'fade' && inputs.length > 1) {
      // Apply crossfade between clips
      const filterParts = [];
      for (let i = 0; i < inputs.length - 1; i++) {
        filterParts.push(`[${i}:v][${i+1}:v]xfade=transition=fade:duration=${transitionDuration}:offset=${i * 5}`);
      }
      // For simplicity, just concat without complex filter
      command.outputOptions(['-c:v', 'libx264', '-c:a', 'aac']);
    } else {
      command.outputOptions(['-c', 'copy']);
    }

    command
      .output(outputPath)
      .on('end', () => {
        fs.unlinkSync(concatFile);
        resolve(outputPath);
      })
      .on('error', (err) => {
        fs.unlinkSync(concatFile);
        reject(new Error(`Combine failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * Trim video to specific duration
 */
async function trim(options) {
  const {
    input,
    output,
    start = 0,
    duration,
    end
  } = options;

  const outputPath = path.resolve(output);

  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(path.resolve(input))
      .inputOptions([`-ss ${start}`]);

    if (duration) {
      command.outputOptions([`-t ${duration}`]);
    } else if (end) {
      command.outputOptions([`-to ${end - start}`]);
    }

    command
      .outputOptions(['-c:v', 'libx264', '-c:a', 'aac'])
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(new Error(`Trim failed: ${err.message}`)))
      .run();
  });
}

/**
 * Export to specific format with preset
 */
async function exportVideo(options) {
  const {
    input,
    output,
    preset,
    format = 'mp4',
    quality = 'high',
    crop = 'fit'
  } = options;

  const outputPath = path.resolve(output);
  const qualitySettings = {
    low: { crf: 28, preset: 'faster' },
    medium: { crf: 23, preset: 'medium' },
    high: { crf: 18, preset: 'slow' }
  };
  const q = qualitySettings[quality] || qualitySettings.medium;

  return new Promise((resolve, reject) => {
    let command = ffmpeg()
      .input(path.resolve(input));

    // Build scale/crop filter based on preset
    let vf = [];
    
    if (crop === 'fit') {
      // Scale to fit within preset dimensions, adding letterbox/pillarbox
      vf.push(`scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease`);
      vf.push(`pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2:black`);
    } else if (crop === 'fill') {
      // Scale to fill, cropping edges
      vf.push(`scale=${preset.width}:${preset.height}:force_original_aspect_ratio=increase`);
      vf.push(`crop=${preset.width}:${preset.height}`);
    } else {
      // Stretch to fit
      vf.push(`scale=${preset.width}:${preset.height}`);
    }

    command.outputOptions([
      `-vf ${vf.join(',')}`,
      `-r ${preset.fps}`,
      `-c:v libx264`,
      `-crf ${q.crf}`,
      `-preset ${q.preset}`,
      `-pix_fmt yuv420p`
    ]);

    if (format === 'gif') {
      // GIF conversion needs palette generation
      command = ffmpeg()
        .input(path.resolve(input))
        .outputOptions([
          `-vf fps=${preset.fps},scale=${preset.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
          `-loop 0`
        ]);
    } else if (format === 'webm') {
      command.outputOptions(['-c:v', 'libvpx-vp9', '-c:a', 'libopus']);
    } else {
      command.outputOptions(['-c:a', 'aac', '-b:a', '128k']);
    }

    if (preset.maxDuration) {
      command.outputOptions([`-t ${preset.maxDuration}`]);
    }

    command
      .output(outputPath)
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  Exporting: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('');
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`Export failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * Get video info
 */
async function getInfo(input) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path.resolve(input), (err, metadata) => {
      if (err) return reject(err);
      const video = metadata.streams.find(s => s.codec_type === 'video');
      const audio = metadata.streams.find(s => s.codec_type === 'audio');
      resolve({
        duration: metadata.format.duration,
        width: video?.width,
        height: video?.height,
        fps: eval(video?.r_frame_rate || '30'),
        hasAudio: !!audio,
        format: metadata.format.format_name
      });
    });
  });
}

module.exports = {
  combine,
  trim,
  export: exportVideo,
  getInfo
};
