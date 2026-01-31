/**
 * Thumbnail templates
 */

const TEMPLATES = {
  'eurocheck-basic': {
    width: 1280,
    height: 720,
    purpose: 'Standard YouTube/social media thumbnail',
    features: ['title', 'subtitle', 'logo', 'gradient-bg'],
    layout: {
      title: { x: 'center', y: '40%', fontSize: 72, fontWeight: 'bold' },
      subtitle: { x: 'center', y: '60%', fontSize: 36 },
      logo: { x: 50, y: 50, maxWidth: 200 },
      badge: { x: 'right-50', y: 50, fontSize: 24 }
    },
    colors: {
      background: '#1a1a2e',
      gradient: ['#16213e', '#0f3460'],
      primary: '#ffffff',
      accent: '#e94560'
    }
  },
  
  'eurocheck-comparison': {
    width: 1280,
    height: 720,
    purpose: 'Price comparison showing savings',
    features: ['split-view', 'price-tags', 'arrows', 'savings-badge'],
    layout: {
      leftTitle: { x: '25%', y: '30%', fontSize: 48 },
      rightTitle: { x: '75%', y: '30%', fontSize: 48 },
      leftPrice: { x: '25%', y: '50%', fontSize: 64 },
      rightPrice: { x: '75%', y: '50%', fontSize: 64 },
      savings: { x: 'center', y: '80%', fontSize: 36 }
    },
    colors: {
      background: '#0f0f0f',
      left: '#ff6b6b',
      right: '#4ecdc4',
      savings: '#feca57'
    }
  },
  
  'eurocheck-feature': {
    width: 1280,
    height: 720,
    purpose: 'Highlight a specific feature',
    features: ['icon-large', 'title', 'bullet-points'],
    layout: {
      icon: { x: '30%', y: 'center', size: 200 },
      title: { x: '65%', y: '30%', fontSize: 56, align: 'left' },
      bullets: { x: '65%', y: '50%', fontSize: 28, spacing: 40 }
    },
    colors: {
      background: '#2d3436',
      primary: '#ffffff',
      accent: '#00b894'
    }
  },
  
  'eurocheck-minimal': {
    width: 1280,
    height: 720,
    purpose: 'Clean minimal design',
    features: ['centered-text', 'subtle-gradient'],
    layout: {
      title: { x: 'center', y: 'center', fontSize: 80 }
    },
    colors: {
      background: '#ffffff',
      gradient: ['#f8f9fa', '#e9ecef'],
      primary: '#212529'
    }
  },
  
  'eurocheck-dark': {
    width: 1280,
    height: 720,
    purpose: 'Dark mode professional look',
    features: ['dark-theme', 'glow-effects'],
    layout: {
      title: { x: 'center', y: '35%', fontSize: 72 },
      subtitle: { x: 'center', y: '55%', fontSize: 32 },
      cta: { x: 'center', y: '80%', fontSize: 28 }
    },
    colors: {
      background: '#0d0d0d',
      primary: '#f1f1f1',
      accent: '#6c5ce7',
      glow: '#a29bfe'
    }
  },
  
  'social-square': {
    width: 1080,
    height: 1080,
    purpose: 'Instagram/social square format',
    features: ['square', 'centered'],
    layout: {
      title: { x: 'center', y: '40%', fontSize: 64 },
      subtitle: { x: 'center', y: '60%', fontSize: 32 }
    },
    colors: {
      background: '#1a1a2e',
      primary: '#ffffff',
      accent: '#e94560'
    }
  },
  
  'story-vertical': {
    width: 1080,
    height: 1920,
    purpose: 'Instagram/TikTok story format',
    features: ['vertical', 'swipe-cta'],
    layout: {
      title: { x: 'center', y: '30%', fontSize: 72 },
      subtitle: { x: 'center', y: '45%', fontSize: 36 },
      cta: { x: 'center', y: '85%', fontSize: 28 }
    },
    colors: {
      background: '#16213e',
      primary: '#ffffff',
      accent: '#e94560'
    }
  }
};

module.exports = {
  get(name) {
    const template = TEMPLATES[name];
    if (!template) {
      throw new Error(`Unknown template: ${name}. Available: ${Object.keys(TEMPLATES).join(', ')}`);
    }
    return { name, ...template };
  },
  
  list() {
    return TEMPLATES;
  },
  
  getColorSchemes() {
    return {
      vibrant: { bg: '#1a1a2e', primary: '#ffffff', accent: '#e94560' },
      ocean: { bg: '#0f3460', primary: '#ffffff', accent: '#00b4d8' },
      forest: { bg: '#1b4332', primary: '#ffffff', accent: '#95d5b2' },
      sunset: { bg: '#3d0066', primary: '#ffffff', accent: '#ff6b6b' },
      minimal: { bg: '#f8f9fa', primary: '#212529', accent: '#0d6efd' },
      dark: { bg: '#0d0d0d', primary: '#f1f1f1', accent: '#6c5ce7' }
    };
  }
};
