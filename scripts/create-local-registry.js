#!/usr/bin/env node
/**
 * Create a local testing registry with file:// URLs
 * This allows testing features without a CDN
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PROJECT_ROOT = path.join(__dirname, '../..');
const PACKAGED_DIR = path.join(PROJECT_ROOT, 'templates/packaged');
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'registry/registry.json');
const LOCAL_REGISTRY_PATH = path.join(PROJECT_ROOT, 'registry/local-registry.json');

// Calculate SHA256 checksum
function calculateSHA256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

// Get file size
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

// Main function
function main() {
  console.log('Creating local testing registry...\n');

  // Read the main registry
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  const localRegistry = JSON.parse(JSON.stringify(registry)); // Deep clone

  // Update feature URLs and checksums
  console.log('Processing features:');
  for (const [featureName, versions] of Object.entries(localRegistry.features)) {
    // Filter out versions that don't have packages
    localRegistry.features[featureName] = versions.filter(feature => {
      const tarballName = `${featureName}.tar.gz`;
      const tarballPath = path.join(PACKAGED_DIR, tarballName);

      if (fs.existsSync(tarballPath)) {
        const sha256 = calculateSHA256(tarballPath);
        const size = getFileSize(tarballPath);

        feature.downloadUrl = tarballPath; // Use absolute path instead of file:// URL
        feature.sha256 = sha256;
        feature.size = size;

        console.log(`  ✓ ${featureName}: ${size} bytes, SHA256: ${sha256.substring(0, 16)}...`);
        return true; // Keep this version
      } else {
        console.log(`  ⚠ ${featureName}: Package not found, removing from local registry`);
        return false; // Remove this version
      }
    });
    
    // Remove empty feature arrays
    if (localRegistry.features[featureName].length === 0) {
      delete localRegistry.features[featureName];
    }
  }

  // Update template URLs and checksums (if they exist)
  console.log('\nProcessing templates:');
  for (const [templateName, versions] of Object.entries(localRegistry.templates)) {
    // Filter out versions that don't have packages
    localRegistry.templates[templateName] = versions.filter(template => {
      const tarballName = `${templateName}.tar.gz`;
      const tarballPath = path.join(PACKAGED_DIR, tarballName);

      if (fs.existsSync(tarballPath)) {
        const sha256 = calculateSHA256(tarballPath);
        const size = getFileSize(tarballPath);

        template.downloadUrl = tarballPath;
        template.sha256 = sha256;
        template.size = size;

        console.log(`  ✓ ${templateName}: ${size} bytes, SHA256: ${sha256.substring(0, 16)}...`);
        return true; // Keep this version
      } else {
        console.log(`  ⚠ ${templateName}: Package not found (status: ${template.status}), removing from local registry`);
        return false; // Remove this version
      }
    });
    
    // Remove empty template arrays
    if (localRegistry.templates[templateName].length === 0) {
      delete localRegistry.templates[templateName];
    }
  }

  // Write the local registry
  fs.writeFileSync(LOCAL_REGISTRY_PATH, JSON.stringify(localRegistry, null, 2), 'utf8');
  console.log(`\n✓ Local registry created: ${LOCAL_REGISTRY_PATH}`);
  console.log(`  Templates: ${Object.keys(localRegistry.templates).length}`);
  console.log(`  Features: ${Object.keys(localRegistry.features).length}`);
  console.log('\nTo use the local registry, set:');
  console.log(`  export SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY_PATH}`);
}

main();
