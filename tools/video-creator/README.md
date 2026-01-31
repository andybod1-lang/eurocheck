# Video Creator CLI

Short video creation tool for browser extension marketing. Supports Twitter, TikTok, YouTube Shorts, and Instagram formats.

## Installation

```bash
cd projects/004-eurocheck/tools/video-creator
npm install
npm link  # Optional: makes 'video-creator' available globally
```

## Usage

### Record Screen
```bash
./video-creator.js record output.mp4 --duration 30 --width 1920 --height 1080
```

### Combine Clips
```bash
./video-creator.js combine clip1.mp4 clip2.mp4 clip3.mp4 -o combined.mp4 --transition fade
```

### Add Captions
```bash
./video-creator.js caption video.mp4 -o captioned.mp4 --text "EuroCheck helps you shop smarter!" --position bottom
```

### Add Background Music
```bash
./video-creator.js music video.mp4 -o with-music.mp4 --audio bgmusic.mp3 --volume 0.3 --ducking
```

### Export for Social Media
```bash
./video-creator.js export video.mp4 -o twitter-video.mp4 --preset twitter
./video-creator.js export video.mp4 -o tiktok-video.mp4 --preset tiktok
./video-creator.js export video.mp4 -o youtube-short.mp4 --preset youtube_shorts
```

### Quick Create (All-in-One)
```bash
./video-creator.js quick promo.mp4 --duration 30 --text "Check prices across EU!" --preset twitter --music bgm.mp3
```

### View Presets
```bash
./video-creator.js presets
```

## Available Presets

| Preset | Size | Aspect | Max Duration |
|--------|------|--------|--------------|
| twitter | 1280x720 | 16:9 | 2:20 |
| twitter_square | 720x720 | 1:1 | 2:20 |
| tiktok | 1080x1920 | 9:16 | 60s |
| youtube_shorts | 1080x1920 | 9:16 | 60s |
| instagram_reels | 1080x1920 | 9:16 | 90s |
| instagram_story | 1080x1920 | 9:16 | 15s |
| linkedin | 1920x1080 | 16:9 | 10m |
| gif | 480x270 | 16:9 | 10s |

## Dependencies

- ffmpeg (bundled via ffmpeg-static)
- Node.js 18+

## Examples

### Create Twitter promo video
```bash
# Record demo
./video-creator.js record demo.mp4 -d 30

# Add caption
./video-creator.js caption demo.mp4 -o demo-captioned.mp4 -t "Save money shopping in EU!"

# Export for Twitter
./video-creator.js export demo-captioned.mp4 -o twitter-promo.mp4 -p twitter
```

### Create TikTok vertical video
```bash
./video-creator.js export landscape.mp4 -o tiktok.mp4 --preset tiktok --crop fill
```

## Integration

This tool can be automated via cron jobs for scheduled content creation:

```bash
# In crontab
0 9 * * 1 /path/to/video-creator.js quick weekly-update.mp4 --text "Weekly stats update!"
```

## Author
Pekka @ EuroCheck
