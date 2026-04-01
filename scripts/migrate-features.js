#!/usr/bin/env node
/**
 * Migrate old feature structure to new format with manifest.json
 */

const fs = require('fs');
const path = require('path');

const FEATURES_DIR = path.join(__dirname, '..', 'templates/features');

function migrateFeature(featureName, versionDir) {
  const versionPath = path.join(FEATURES_DIR, featureName, versionDir);
  const featureJsonPath = path.join(versionPath, 'feature.json');
  const manifestPath = path.join(versionPath, 'manifest.json');
  
  // Skip if manifest already exists
  if (fs.existsSync(manifestPath)) {
    console.log(`  ✓ ${featureName} ${versionDir}: manifest.json already exists`);
    return true;
  }
  
  // Check if feature.json exists
  if (!fs.existsSync(featureJsonPath)) {
    console.log(`  ⚠ ${featureName} ${versionDir}: No feature.json found, creating basic manifest`);
    
    // Create basic manifest
    const manifest = {
      name: featureName,
      version: versionDir.replace('v', ''),
      description: `${featureName} integration`,
      category: "general",
      status: "stable",
      frameworks: ["react", "vue", "next", "nuxt"],
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      conflicts: [],
      files: [],
      scripts: {},
      instructions: `${featureName} has been added to your project!`,
      nextSteps: ["Run 'npm install' to install dependencies"]
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`    → Created basic manifest.json`);
    return true;
  }
  
  // Read and migrate feature.json
  const featureJson = JSON.parse(fs.readFileSync(featureJsonPath, 'utf8'));
  
  // Create manifest from feature.json
  const manifest = {
    name: featureJson.name || featureName,
    version: featureJson.version || versionDir.replace('v', ''),
    description: featureJson.description || `${featureName} integration`,
    category: featureJson.category || "general",
    status: featureJson.status || "stable",
    frameworks: featureJson.frameworks || featureJson.supportedFrameworks || ["react", "vue", "next"],
    dependencies: featureJson.dependencies || [],
    devDependencies: featureJson.devDependencies || [],
    peerDependencies: featureJson.peerDependencies || [],
    conflicts: featureJson.conflicts || [],
    files: featureJson.files || [],
    scripts: featureJson.scripts || {},
    instructions: featureJson.postInstallMessage || featureJson.instructions || `${featureName} has been added to your project!`,
    nextSteps: featureJson.nextSteps || ["Run 'npm install' to install dependencies"]
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`  ✓ ${featureName} ${versionDir}: Migrated feature.json → manifest.json`);
  
  return true;
}

function main() {
  console.log('\n🔄 Migrating features to new format...\n');
  
  const features = fs.readdirSync(FEATURES_DIR).filter(item => {
    const fullPath = path.join(FEATURES_DIR, item);
    return fs.statSync(fullPath).isDirectory();
  });
  
  let migrated = 0;
  let skipped = 0;
  
  for (const feature of features) {
    const featurePath = path.join(FEATURES_DIR, feature);
    const versionDirs = fs.readdirSync(featurePath).filter(item => {
      const fullPath = path.join(featurePath, item);
      return fs.statSync(fullPath).isDirectory() && item.startsWith('v');
    });
    
    if (versionDirs.length === 0) {
      console.log(`  ⚠ ${feature}: No version directory`);
      skipped++;
      continue;
    }
    
    for (const versionDir of versionDirs) {
      if (migrateFeature(feature, versionDir)) {
        migrated++;
      } else {
        skipped++;
      }
    }
  }
  
  console.log(`\n✓ Migration complete: ${migrated} migrated, ${skipped} skipped\n`);
}

main();
