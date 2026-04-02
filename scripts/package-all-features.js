#!/usr/bin/env node
/**
 * Package all features as tar.gz files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '../..');
const FEATURES_DIR = path.join(PROJECT_ROOT, 'templates/features');
const PACKAGED_DIR = path.join(PROJECT_ROOT, 'templates/packaged');

// Ensure packaged directory exists
if (!fs.existsSync(PACKAGED_DIR)) {
  fs.mkdirSync(PACKAGED_DIR, { recursive: true });
}

// Get all feature directories
const features = fs.readdirSync(FEATURES_DIR).filter(item => {
  const fullPath = path.join(FEATURES_DIR, item);
  return fs.statSync(fullPath).isDirectory();
});

console.log(`Found ${features.length} features to package\n`);

let packaged = 0;
let skipped = 0;

for (const feature of features) {
  const featurePath = path.join(FEATURES_DIR, feature);
  const versionDirs = fs.readdirSync(featurePath).filter(item => {
    const fullPath = path.join(featurePath, item);
    return fs.statSync(fullPath).isDirectory() && item.startsWith('v');
  });

  if (versionDirs.length === 0) {
    console.log(`⚠ ${feature}: No version directory found, skipping`);
    skipped++;
    continue;
  }

  // Use the first version directory (assuming v1.0.0 for most)
  const versionDir = versionDirs[0];
  const sourcePath = path.join(featurePath, versionDir);
  const tarballName = `${feature}.tar.gz`;
  const tarballPath = path.join(PACKAGED_DIR, tarballName);

  // Remove existing tarballs for this feature (both versioned and non-versioned)
  const existingFiles = fs.readdirSync(PACKAGED_DIR).filter(f => f.startsWith(feature));
  for (const file of existingFiles) {
    const filePath = path.join(PACKAGED_DIR, file);
    fs.unlinkSync(filePath);
    console.log(`  Removed old: ${file}`);
  }

  try {
    // Create tarball
    execSync(`tar -czf "${tarballPath}" -C "${sourcePath}" .`, {
      stdio: 'pipe'
    });

    const stats = fs.statSync(tarballPath);
    console.log(`✓ ${feature}: ${stats.size} bytes (${versionDir})`);
    packaged++;
  } catch (error) {
    console.log(`✗ ${feature}: Failed to package - ${error.message}`);
    skipped++;
  }
}

console.log(`\nPackaged ${packaged} features, skipped ${skipped}`);
console.log(`Output directory: ${PACKAGED_DIR}`);
