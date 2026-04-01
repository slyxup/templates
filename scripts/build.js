#!/usr/bin/env node
/**
 * SlyxUp Build System
 * 
 * Automatically builds, packages, and deploys templates and features
 * 
 * Usage:
 *   npm run build:all           # Build everything
 *   npm run build:templates     # Build only templates
 *   npm run build:features      # Build only features
 *   npm run build:registry      # Generate registries
 *   npm run deploy              # Deploy to CDN
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '../..');
const TEMPLATES_SRC = path.join(PROJECT_ROOT, 'templates/src');
const FEATURES_SRC = path.join(PROJECT_ROOT, 'templates/features');
const BUILD_DIR = path.join(PROJECT_ROOT, 'templates/build');
const PACKAGED_DIR = path.join(PROJECT_ROOT, 'templates/packaged');
const REGISTRY_DIR = path.join(PROJECT_ROOT, 'registry');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Build Templates
 */
function buildTemplates() {
  log('\n📦 Building Templates...', 'bright');
  log('=' .repeat(50), 'gray');
  
  ensureDir(BUILD_DIR);
  ensureDir(PACKAGED_DIR);
  
  if (!fs.existsSync(TEMPLATES_SRC)) {
    log('⚠ Templates source directory not found. Creating...', 'yellow');
    fs.mkdirSync(TEMPLATES_SRC, { recursive: true });
    return { built: 0, skipped: 0 };
  }

  const templates = fs.readdirSync(TEMPLATES_SRC).filter(item => {
    const fullPath = path.join(TEMPLATES_SRC, item);
    return fs.statSync(fullPath).isDirectory();
  });

  let built = 0;
  let skipped = 0;

  for (const template of templates) {
    const templatePath = path.join(TEMPLATES_SRC, template);
    const manifestPath = path.join(templatePath, 'template.json');
    
    if (!fs.existsSync(manifestPath)) {
      log(`  ⚠ ${template}: No template.json found, skipping`, 'yellow');
      skipped++;
      continue;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = manifest.version || '1.0.0';
    
    // Create versioned build directory
    const buildPath = path.join(BUILD_DIR, template, `v${version}`);
    ensureDir(buildPath);
    
    // Copy template files (excluding template.json and build artifacts)
    log(`  📁 ${template} v${version}`, 'blue');
    execSync(`rsync -av --exclude='template.json' --exclude='*.tar.gz' --exclude='node_modules' "${templatePath}/" "${buildPath}/"`, {
      stdio: 'pipe'
    });
    
    // Create tarball
    const tarballName = `${template}-${version}.tar.gz`;
    const tarballPath = path.join(PACKAGED_DIR, tarballName);
    
    try {
      execSync(`tar -czf "${tarballPath}" -C "${buildPath}" .`, { stdio: 'pipe' });
      const size = getFileSize(tarballPath);
      const sha256 = calculateSHA256(tarballPath);
      
      log(`    ✓ Built: ${(size / 1024).toFixed(2)} KB`, 'green');
      log(`    ✓ SHA256: ${sha256.substring(0, 16)}...`, 'gray');
      built++;
    } catch (error) {
      log(`    ✗ Failed to build: ${error.message}`, 'red');
      skipped++;
    }
  }

  log(`\n✓ Templates: ${built} built, ${skipped} skipped`, 'green');
  return { built, skipped };
}

/**
 * Build Features
 */
function buildFeatures() {
  log('\n🔧 Building Features...', 'bright');
  log('=' .repeat(50), 'gray');
  
  ensureDir(PACKAGED_DIR);

  if (!fs.existsSync(FEATURES_SRC)) {
    log('⚠ Features directory not found', 'yellow');
    return { built: 0, skipped: 0 };
  }

  const features = fs.readdirSync(FEATURES_SRC).filter(item => {
    const fullPath = path.join(FEATURES_SRC, item);
    return fs.statSync(fullPath).isDirectory();
  });

  let built = 0;
  let skipped = 0;

  for (const feature of features) {
    const featurePath = path.join(FEATURES_SRC, feature);
    
    // Find version directories
    const versionDirs = fs.readdirSync(featurePath).filter(item => {
      const fullPath = path.join(featurePath, item);
      return fs.statSync(fullPath).isDirectory() && item.startsWith('v');
    });

    if (versionDirs.length === 0) {
      log(`  ⚠ ${feature}: No version directory found, skipping`, 'yellow');
      skipped++;
      continue;
    }

    // Build each version
    for (const versionDir of versionDirs) {
      const version = versionDir.replace('v', '');
      const sourcePath = path.join(featurePath, versionDir);
      const manifestPath = path.join(sourcePath, 'manifest.json');
      
      if (!fs.existsSync(manifestPath)) {
        log(`  ⚠ ${feature} ${versionDir}: No manifest.json, skipping`, 'yellow');
        skipped++;
        continue;
      }

      const tarballName = `${feature}-${version}.tar.gz`;
      const tarballPath = path.join(PACKAGED_DIR, tarballName);

      log(`  🔧 ${feature} v${version}`, 'blue');
      
      try {
        execSync(`tar -czf "${tarballPath}" -C "${sourcePath}" .`, { stdio: 'pipe' });
        const size = getFileSize(tarballPath);
        const sha256 = calculateSHA256(tarballPath);
        
        log(`    ✓ Built: ${(size / 1024).toFixed(2)} KB`, 'green');
        log(`    ✓ SHA256: ${sha256.substring(0, 16)}...`, 'gray');
        built++;
      } catch (error) {
        log(`    ✗ Failed to build: ${error.message}`, 'red');
        skipped++;
      }
    }
  }

  log(`\n✓ Features: ${built} built, ${skipped} skipped`, 'green');
  return { built, skipped };
}

/**
 * Generate Registries
 */
function generateRegistries() {
  log('\n📝 Generating Registries...', 'bright');
  log('=' .repeat(50), 'gray');
  
  const mainRegistryPath = path.join(REGISTRY_DIR, 'registry.json');
  const localRegistryPath = path.join(REGISTRY_DIR, 'local-registry.json');
  
  if (!fs.existsSync(mainRegistryPath)) {
    log('⚠ Main registry not found, skipping', 'yellow');
    return;
  }

  const registry = JSON.parse(fs.readFileSync(mainRegistryPath, 'utf8'));
  const localRegistry = JSON.parse(JSON.stringify(registry));
  
  let templatesUpdated = 0;
  let featuresUpdated = 0;

  // Update templates
  for (const [templateName, versions] of Object.entries(localRegistry.templates)) {
    localRegistry.templates[templateName] = versions.filter(template => {
      const tarballName = `${templateName}-${template.version}.tar.gz`;
      const tarballPath = path.join(PACKAGED_DIR, tarballName);

      if (fs.existsSync(tarballPath)) {
        template.downloadUrl = tarballPath;
        template.sha256 = calculateSHA256(tarballPath);
        template.size = getFileSize(tarballPath);
        templatesUpdated++;
        return true;
      }
      return false;
    });
    
    if (localRegistry.templates[templateName].length === 0) {
      delete localRegistry.templates[templateName];
    }
  }

  // Update features
  for (const [featureName, versions] of Object.entries(localRegistry.features)) {
    localRegistry.features[featureName] = versions.filter(feature => {
      const tarballName = `${featureName}-${feature.version}.tar.gz`;
      const tarballPath = path.join(PACKAGED_DIR, tarballName);

      if (fs.existsSync(tarballPath)) {
        feature.downloadUrl = tarballPath;
        feature.sha256 = calculateSHA256(tarballPath);
        feature.size = getFileSize(tarballPath);
        featuresUpdated++;
        return true;
      }
      return false;
    });
    
    if (localRegistry.features[featureName].length === 0) {
      delete localRegistry.features[featureName];
    }
  }

  fs.writeFileSync(localRegistryPath, JSON.stringify(localRegistry, null, 2), 'utf8');
  
  log(`  ✓ Local registry: ${templatesUpdated} templates, ${featuresUpdated} features`, 'green');
  log(`  ✓ Saved to: ${localRegistryPath}`, 'gray');
}

/**
 * Clean build artifacts
 */
function clean() {
  log('\n🧹 Cleaning build artifacts...', 'bright');
  
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true, force: true });
    log('  ✓ Cleaned build directory', 'green');
  }
  
  if (fs.existsSync(PACKAGED_DIR)) {
    fs.rmSync(PACKAGED_DIR, { recursive: true, force: true });
    log('  ✓ Cleaned packaged directory', 'green');
  }
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  log('\n╔═══════════════════════════════════════╗', 'bright');
  log('║     SlyxUp Build System v1.0.0       ║', 'bright');
  log('╚═══════════════════════════════════════╝\n', 'bright');

  const startTime = Date.now();

  switch (command) {
    case 'clean':
      clean();
      break;
      
    case 'templates':
      buildTemplates();
      break;
      
    case 'features':
      buildFeatures();
      break;
      
    case 'registry':
      generateRegistries();
      break;
      
    case 'all':
    default:
      buildTemplates();
      buildFeatures();
      generateRegistries();
      break;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const localRegistryPath = path.join(REGISTRY_DIR, 'local-registry.json');
  log(`\n✓ Build completed in ${duration}s`, 'bright');
  log(`\n💡 To use local registry:`, 'blue');
  log(`   export SLYXUP_REGISTRY_URL=${localRegistryPath}\n`, 'gray');
}

main();
