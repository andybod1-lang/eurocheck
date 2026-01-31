/**
 * Social media format presets
 */

const PRESETS = {
  twitter: {
    width: 1280,
    height: 720,
    aspect: '16:9',
    maxDuration: 140,
    fps: 30,
    bitrate: '5M',
    notes: 'Landscape format, max 2:20'
  },
  twitter_square: {
    width: 720,
    height: 720,
    aspect: '1:1',
    maxDuration: 140,
    fps: 30,
    bitrate: '5M',
    notes: 'Square format for better mobile engagement'
  },
  tiktok: {
    width: 1080,
    height: 1920,
    aspect: '9:16',
    maxDuration: 60,
    fps: 30,
    bitrate: '8M',
    notes: 'Vertical format, 15-60s optimal'
  },
  youtube_shorts: {
    width: 1080,
    height: 1920,
    aspect: '9:16',
    maxDuration: 60,
    fps: 30,
    bitrate: '8M',
    notes: 'Vertical format, max 60s'
  },
  instagram_reels: {
    width: 1080,
    height: 1920,
    aspect: '9:16',
    maxDuration: 90,
    fps: 30,
    bitrate: '8M',
    notes: 'Vertical format, 15-90s'
  },
  instagram_story: {
    width: 1080,
    height: 1920,
    aspect: '9:16',
    maxDuration: 15,
    fps: 30,
    bitrate: '5M',
    notes: 'Vertical format, max 15s per segment'
  },
  linkedin: {
    width: 1920,
    height: 1080,
    aspect: '16:9',
    maxDuration: 600,
    fps: 30,
    bitrate: '5M',
    notes: 'Landscape, professional content'
  },
  gif: {
    width: 480,
    height: 270,
    aspect: '16:9',
    maxDuration: 10,
    fps: 15,
    notes: 'Optimized for file size'
  }
};

module.exports = {
  get(name) {
    const preset = PRESETS[name];
    if (!preset) {
      throw new Error(`Unknown preset: ${name}. Use: ${Object.keys(PRESETS).join(', ')}`);
    }
    return { name, ...preset };
  },
  
  list() {
    return PRESETS;
  },
  
  validate(preset, duration) {
    if (duration > preset.maxDuration) {
      console.warn(`⚠️  Duration ${duration}s exceeds ${preset.name} max of ${preset.maxDuration}s`);
      return false;
    }
    return true;
  }
};
