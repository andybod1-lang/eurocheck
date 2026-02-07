#!/usr/bin/env node
/**
 * Thumbnail Generator CLI
 * Create marketing thumbnails with templates, text overlays, and A/B testing variants
 */

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const generator = require('./lib/generator');
const templates = require('./lib/templates');
const abTesting = require('./lib/ab-testing');

program
  .name('thumbnail-generator')
  .description('CLI for creating marketing thumbnails')
  .version('1.0.0');

// Generate thumbnail from template
program
  .command('create')
  .description('Create thumbnail from template')
  .requiredOption('-o, --output <file>', 'Output file path')
  .option('-t, --template <name>', 'Template name', 'eurocheck-basic')
  .option('--title <text>', 'Main title text')
  .option('--subtitle <text>', 'Subtitle text')
  .option('--badge <text>', 'Badge/tag text (e.g., "NEW", "SALE")')
  .option('--logo <file>', 'Logo image file')
  .option('--background <file>', 'Background image')
  .option('--bg-color <hex>', 'Background color', '#1a1a2e')
  .option('--primary-color <hex>', 'Primary text color', '#ffffff')
  .option('--accent-color <hex>', 'Accent color', '#e94560')
  .option('-w, --width <pixels>', 'Width', '1280')
  .option('-h, --height <pixels>', 'Height', '720')
  .action(async (options) => {
    try {
      console.log(`🎨 Creating thumbnail with "${options.template}" template...`);
      const result = await generator.create({
        output: options.output,
        template: options.template,
        title: options.title,
        subtitle: options.subtitle,
        badge: options.badge,
        logo: options.logo,
        background: options.background,
        bgColor: options.bgColor,
        primaryColor: options.primaryColor,
        accentColor: options.accentColor,
        width: parseInt(options.width),
        height: parseInt(options.height)
      });
      console.log(`✅ Created: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Generate A/B test variants
program
  .command('ab-variants')
  .description('Generate multiple variants for A/B testing')
  .requiredOption('-o, --output-dir <dir>', 'Output directory')
  .option('-t, --template <name>', 'Base template', 'eurocheck-basic')
  .option('--title <text>', 'Main title')
  .option('--vary-colors', 'Generate color variants', false)
  .option('--vary-layout', 'Generate layout variants', false)
  .option('--vary-text', 'Generate text variants', false)
  .option('-n, --count <number>', 'Number of variants', '4')
  .action(async (options) => {
    try {
      console.log(`🧪 Generating ${options.count} A/B test variants...`);
      const results = await abTesting.generateVariants({
        outputDir: options.outputDir,
        template: options.template,
        title: options.title,
        varyColors: options.varyColors,
        varyLayout: options.varyLayout,
        varyText: options.varyText,
        count: parseInt(options.count)
      });
      console.log(`✅ Created ${results.length} variants:`);
      results.forEach(r => console.log(`   - ${r}`));
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Batch generate from CSV
program
  .command('batch <csvFile>')
  .description('Batch generate thumbnails from CSV')
  .requiredOption('-o, --output-dir <dir>', 'Output directory')
  .option('-t, --template <name>', 'Template for all', 'eurocheck-basic')
  .action(async (csvFile, options) => {
    try {
      console.log(`📦 Batch generating from ${csvFile}...`);
      const results = await generator.batch({
        csvFile,
        outputDir: options.outputDir,
        template: options.template
      });
      console.log(`✅ Created ${results.length} thumbnails`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// List templates
program
  .command('templates')
  .description('List available templates')
  .action(() => {
    console.log('\n📐 Available Templates:\n');
    const all = templates.list();
    for (const [name, t] of Object.entries(all)) {
      console.log(`  ${name}:`);
      console.log(`    Size: ${t.width}x${t.height}`);
      console.log(`    Purpose: ${t.purpose}`);
      console.log(`    Features: ${t.features.join(', ')}\n`);
    }
  });

// Export for platform
program
  .command('export <input>')
  .description('Export thumbnail for specific platform')
  .requiredOption('-o, --output <file>', 'Output file')
  .option('-p, --platform <name>', 'Platform: youtube, twitter, facebook, instagram, linkedin', 'youtube')
  .action(async (input, options) => {
    try {
      const sizes = {
        youtube: { width: 1280, height: 720 },
        twitter: { width: 1200, height: 675 },
        facebook: { width: 1200, height: 630 },
        instagram: { width: 1080, height: 1080 },
        linkedin: { width: 1200, height: 627 }
      };
      const size = sizes[options.platform] || sizes.youtube;
      console.log(`📤 Exporting for ${options.platform} (${size.width}x${size.height})...`);
      const result = await generator.resize(input, options.output, size.width, size.height);
      console.log(`✅ Exported: ${result}`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

// Quick social media set
program
  .command('social-set')
  .description('Generate thumbnails for all major platforms at once')
  .requiredOption('-o, --output-dir <dir>', 'Output directory')
  .option('-t, --template <name>', 'Template', 'eurocheck-basic')
  .option('--title <text>', 'Title text')
  .option('--subtitle <text>', 'Subtitle')
  .action(async (options) => {
    try {
      console.log('📱 Generating social media set...');
      const platforms = ['youtube', 'twitter', 'facebook', 'instagram', 'linkedin'];
      
      for (const platform of platforms) {
        const sizes = {
          youtube: { width: 1280, height: 720 },
          twitter: { width: 1200, height: 675 },
          facebook: { width: 1200, height: 630 },
          instagram: { width: 1080, height: 1080 },
          linkedin: { width: 1200, height: 627 }
        };
        const size = sizes[platform];
        const output = path.join(options.outputDir, `${platform}.png`);
        
        await generator.create({
          output,
          template: options.template,
          title: options.title,
          subtitle: options.subtitle,
          ...size
        });
        console.log(`  ✅ ${platform}: ${output}`);
      }
      console.log('✅ Social media set complete!');
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
