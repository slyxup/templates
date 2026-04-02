#!/usr/bin/env node

/**
 * SlyxUp Templates Deploy Script
 * Cross-platform deployment for Mac, Windows, Linux, Ubuntu
 * Handles tar.gz packaging and R2 upload
 * 
 * Usage:
 *   node scripts/deploy.js              # Interactive mode
 *   node scripts/deploy.js local        # Package all for local testing
 *   node scripts/deploy.js prod         # Package all and upload to R2
 *   node scripts/deploy.js package      # Package all templates and features
 *   node scripts/deploy.js package:name # Package specific template/feature
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { createReadStream, createWriteStream } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const SLYXUP_ROOT = path.resolve(__dirname, '../..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const FEATURES_DIR = path.join(ROOT_DIR, 'features');
const PACKAGED_DIR = path.join(ROOT_DIR, 'packaged');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logStep(step, msg) {
  console.log(`${colors.cyan}[${step}]${colors.reset} ${msg}`);
}

function logSuccess(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function logError(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
}

function logWarning(msg) {
  console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
}

// Run command cross-platform
function runCommand(cmd, options = {}) {
  const { cwd = ROOT_DIR, silent = false, ignoreError = false } = options;
  
  try {
    if (!silent) {
      log(`  $ ${cmd}`, 'gray');
    }
    
    const result = execSync(cmd, {
      cwd,
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
      shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh',
    });
    
    return { success: true, output: result };
  } catch (error) {
    if (ignoreError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

// Get SHA-256 hash of file
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Get file size
function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get all templates
function getTemplates() {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  
  return fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const versionDirs = fs.readdirSync(path.join(PROJECTS_DIR, d.name), { withFileTypes: true })
        .filter(v => v.isDirectory() && v.name.startsWith('v'));
      
      return {
        name: d.name,
        path: path.join(PROJECTS_DIR, d.name),
        versions: versionDirs.map(v => v.name),
        latestVersion: versionDirs.length > 0 ? versionDirs[versionDirs.length - 1].name : null,
      };
    });
}

// Get all features
function getFeatures() {
  if (!fs.existsSync(FEATURES_DIR)) return [];
  
  return fs.readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.')) // Ignore hidden folders like .wrangler
    .map(d => {
      const featurePath = path.join(FEATURES_DIR, d.name);
      const versionDirs = fs.readdirSync(featurePath, { withFileTypes: true })
        .filter(v => v.isDirectory() && v.name.startsWith('v'));
      
      return {
        name: d.name,
        path: featurePath,
        versions: versionDirs.map(v => v.name),
        latestVersion: versionDirs.length > 0 ? versionDirs[versionDirs.length - 1].name : null,
      };
    });
}

// Create tar.gz archive (cross-platform using node-tar if available, fallback to tar command)
async function createTarGz(sourceDir, outputPath) {
  ensureDir(path.dirname(outputPath));
  
  // Try to use tar command (works on Mac, Linux, Ubuntu, and Git Bash on Windows)
  try {
    const sourceName = path.basename(sourceDir);
    const parentDir = path.dirname(sourceDir);
    
    // Use tar with proper cross-platform options
    const tarCmd = process.platform === 'win32'
      ? `tar -czf "${outputPath}" -C "${parentDir}" "${sourceName}"`
      : `tar -czf "${outputPath}" -C "${parentDir}" "${sourceName}"`;
    
    runCommand(tarCmd, { silent: true });
    return true;
  } catch (error) {
    // Fallback: try using node-tar package
    try {
      const tar = await import('tar');
      await tar.create(
        {
          gzip: true,
          file: outputPath,
          cwd: path.dirname(sourceDir),
        },
        [path.basename(sourceDir)]
      );
      return true;
    } catch {
      logError(`Failed to create archive: ${error.message}`);
      return false;
    }
  }
}

// Package a single template
async function packageTemplate(templateName, version = 'latest') {
  const template = getTemplates().find(t => t.name === templateName);
  
  if (!template) {
    logError(`Template not found: ${templateName}`);
    return null;
  }
  
  const targetVersion = version === 'latest' ? template.latestVersion : version;
  if (!targetVersion) {
    logError(`No version found for template: ${templateName}`);
    return null;
  }
  
  const sourceDir = path.join(template.path, targetVersion);
  const outputPath = path.join(PACKAGED_DIR, `${templateName}.tar.gz`);
  
  logStep('PACKAGE', `Packaging ${templateName} (${targetVersion})...`);
  
  if (!fs.existsSync(sourceDir)) {
    logError(`Source directory not found: ${sourceDir}`);
    return null;
  }
  
  const success = await createTarGz(sourceDir, outputPath);
  
  if (success) {
    const hash = getFileHash(outputPath);
    const size = getFileSize(outputPath);
    
    logSuccess(`Packaged ${templateName}.tar.gz (${size} bytes)`);
    log(`  SHA256: ${hash.substring(0, 32)}...`, 'gray');
    
    return { name: templateName, version: targetVersion, path: outputPath, hash, size };
  }
  
  return null;
}

// Package a single feature
async function packageFeature(featureName, version = 'latest') {
  const feature = getFeatures().find(f => f.name === featureName);
  
  if (!feature) {
    logError(`Feature not found: ${featureName}`);
    return null;
  }
  
  const targetVersion = version === 'latest' ? feature.latestVersion : version;
  if (!targetVersion) {
    logError(`No version found for feature: ${featureName}`);
    return null;
  }
  
  const sourceDir = path.join(feature.path, targetVersion);
  const outputPath = path.join(PACKAGED_DIR, `${featureName}.tar.gz`);
  
  logStep('PACKAGE', `Packaging ${featureName} (${targetVersion})...`);
  
  if (!fs.existsSync(sourceDir)) {
    logError(`Source directory not found: ${sourceDir}`);
    return null;
  }
  
  const success = await createTarGz(sourceDir, outputPath);
  
  if (success) {
    const hash = getFileHash(outputPath);
    const size = getFileSize(outputPath);
    
    logSuccess(`Packaged ${featureName}.tar.gz (${size} bytes)`);
    log(`  SHA256: ${hash.substring(0, 32)}...`, 'gray');
    
    return { name: featureName, version: targetVersion, path: outputPath, hash, size };
  }
  
  return null;
}

// Package all templates and features
async function packageAll() {
  logStep('BUILD', 'Packaging all templates and features...');
  
  ensureDir(PACKAGED_DIR);
  
  const results = {
    templates: [],
    features: [],
    failed: [],
  };
  
  // Package templates
  const templates = getTemplates();
  console.log(`\n${colors.cyan}Templates (${templates.length}):${colors.reset}`);
  
  for (const template of templates) {
    const result = await packageTemplate(template.name);
    if (result) {
      results.templates.push(result);
    } else {
      results.failed.push({ type: 'template', name: template.name });
    }
  }
  
  // Package features
  const features = getFeatures();
  console.log(`\n${colors.cyan}Features (${features.length}):${colors.reset}`);
  
  for (const feature of features) {
    const result = await packageFeature(feature.name);
    if (result) {
      results.features.push(result);
    } else {
      results.failed.push({ type: 'feature', name: feature.name });
    }
  }
  
  // Summary
  console.log(`
${colors.green}═══ Packaging Complete ═══${colors.reset}

  Templates: ${results.templates.length}/${templates.length}
  Features:  ${results.features.length}/${features.length}
  Failed:    ${results.failed.length}
`);
  
  if (results.failed.length > 0) {
    console.log(`${colors.yellow}Failed:${colors.reset}`);
    results.failed.forEach(f => console.log(`  - ${f.type}/${f.name}`));
  }
  
  return results;
}

// Update registry with new hashes
function updateRegistry(results) {
  logStep('REGISTRY', 'Updating registry.json with new hashes...');
  
  const registryPath = path.join(SLYXUP_ROOT, 'registry', 'registry.json');
  
  if (!fs.existsSync(registryPath)) {
    logWarning('registry.json not found');
    return;
  }
  
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  
  // Update templates
  for (const template of results.templates) {
    if (registry.templates[template.name]) {
      registry.templates[template.name][0].sha256 = template.hash;
      registry.templates[template.name][0].size = template.size;
    }
  }
  
  // Update features
  for (const feature of results.features) {
    if (registry.features[feature.name]) {
      registry.features[feature.name][0].sha256 = feature.hash;
      registry.features[feature.name][0].size = feature.size;
    }
  }
  
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
  logSuccess('Updated registry.json');
}

// Update local registry
function updateLocalRegistry(results) {
  logStep('LOCAL', 'Updating local-registry.json...');
  
  const registryPath = path.join(SLYXUP_ROOT, 'registry', 'registry.json');
  const localRegistryPath = path.join(SLYXUP_ROOT, 'registry', 'local-registry.json');
  
  if (!fs.existsSync(registryPath)) {
    logWarning('registry.json not found');
    return;
  }
  
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
  
  // Update with file:// URLs and current hashes
  for (const template of results.templates) {
    if (registry.templates[template.name]) {
      registry.templates[template.name][0].downloadUrl = `file://${template.path}`;
      registry.templates[template.name][0].sha256 = template.hash;
      registry.templates[template.name][0].size = template.size;
    }
  }
  
  for (const feature of results.features) {
    if (registry.features[feature.name]) {
      registry.features[feature.name][0].downloadUrl = `file://${feature.path}`;
      registry.features[feature.name][0].sha256 = feature.hash;
      registry.features[feature.name][0].size = feature.size;
    }
  }
  
  fs.writeFileSync(localRegistryPath, JSON.stringify(registry, null, 2) + '\n');
  logSuccess('Updated local-registry.json');
  
  console.log(`
${colors.bright}To use local registry:${colors.reset}

${colors.cyan}# Linux/Mac:${colors.reset}
export SLYXUP_REGISTRY_URL="file://${localRegistryPath}"

${colors.cyan}# Windows PowerShell:${colors.reset}
$env:SLYXUP_REGISTRY_URL="file://${localRegistryPath}"
`);
}

// List all templates and features
function listAll() {
  console.log(`\n${colors.cyan}═══ Available Templates ═══${colors.reset}\n`);
  
  const templates = getTemplates();
  for (const t of templates) {
    const tarPath = path.join(PACKAGED_DIR, `${t.name}.tar.gz`);
    const hasPackage = fs.existsSync(tarPath);
    const status = hasPackage ? colors.green + '●' : colors.red + '○';
    
    console.log(`  ${status}${colors.reset} ${t.name}`);
    console.log(`    ${colors.gray}Versions: ${t.versions.join(', ') || 'none'}${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}═══ Available Features ═══${colors.reset}\n`);
  
  const features = getFeatures();
  for (const f of features) {
    const tarPath = path.join(PACKAGED_DIR, `${f.name}.tar.gz`);
    const hasPackage = fs.existsSync(tarPath);
    const status = hasPackage ? colors.green + '●' : colors.red + '○';
    
    console.log(`  ${status}${colors.reset} ${f.name}`);
    console.log(`    ${colors.gray}Versions: ${f.versions.join(', ') || 'none'}${colors.reset}`);
  }
  
  console.log(`
${colors.gray}Legend: ${colors.green}●${colors.gray} = packaged, ${colors.red}○${colors.gray} = not packaged${colors.reset}
`);
}

// Clean packaged directory
function clean() {
  logStep('CLEAN', 'Cleaning packaged directory...');
  
  if (fs.existsSync(PACKAGED_DIR)) {
    const files = fs.readdirSync(PACKAGED_DIR);
    for (const file of files) {
      if (file.endsWith('.tar.gz')) {
        fs.unlinkSync(path.join(PACKAGED_DIR, file));
      }
    }
    logSuccess(`Removed ${files.length} packages`);
  }
}

// Interactive prompt
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Interactive menu
async function interactiveMenu() {
  console.log(`
${colors.cyan}╔═══════════════════════════════════════════╗
║   ${colors.bright}SlyxUp Templates Deploy Script${colors.reset}${colors.cyan}          ║
╚═══════════════════════════════════════════╝${colors.reset}

Select operation:

  ${colors.green}1)${colors.reset} Local Setup    - Package all and generate local registry
  ${colors.yellow}2)${colors.reset} Production     - Package all and update main registry
  ${colors.blue}3)${colors.reset} Package All    - Package all templates and features
  ${colors.cyan}4)${colors.reset} List           - Show all templates and features
  ${colors.gray}5)${colors.reset} Clean          - Remove all packaged files
  ${colors.gray}6)${colors.reset} Exit
`);

  const choice = await prompt('Enter choice (1-6): ');
  
  switch (choice) {
    case '1':
    case 'local':
      await runLocalSetup();
      break;
    case '2':
    case 'prod':
    case 'production':
      await runProductionDeploy();
      break;
    case '3':
    case 'package':
      await packageAll();
      break;
    case '4':
    case 'list':
      listAll();
      break;
    case '5':
    case 'clean':
      clean();
      break;
    case '6':
    case 'exit':
    case 'q':
      log('Bye!', 'gray');
      process.exit(0);
    default:
      logError('Invalid choice');
      await interactiveMenu();
  }
}

// Local setup workflow
async function runLocalSetup() {
  console.log(`\n${colors.cyan}═══ Local Setup ═══${colors.reset}\n`);
  
  const results = await packageAll();
  updateLocalRegistry(results);
  
  console.log(`
${colors.green}═══ Local Setup Complete ═══${colors.reset}

${colors.bright}Test with CLI:${colors.reset}
  cd ../cli
  npm run build
  npm link
  export SLYXUP_REGISTRY_URL="file://${path.join(SLYXUP_ROOT, 'registry', 'local-registry.json')}"
  slyxup list templates
  slyxup init react test-app
`);
}

// Production deployment workflow
async function runProductionDeploy() {
  console.log(`\n${colors.yellow}═══ Production Deployment ═══${colors.reset}\n`);
  
  const results = await packageAll();
  updateRegistry(results);
  
  // Ask about uploading to R2
  const uploadR2 = await prompt('Upload packages to Cloudflare R2? (y/n): ');
  if (uploadR2 === 'y' || uploadR2 === 'yes') {
    const r2Script = path.join(SLYXUP_ROOT, 'registry', 'scripts', 'upload-to-r2.js');
    if (fs.existsSync(r2Script)) {
      runCommand(`node ${r2Script}`, { cwd: path.join(SLYXUP_ROOT, 'registry') });
    } else {
      logWarning('upload-to-r2.js not found');
    }
  }
  
  console.log(`
${colors.green}═══ Production Deployment Complete ═══${colors.reset}

${colors.bright}Next steps:${colors.reset}
  1. Update registry.json with CDN URLs (if not done)
  2. Deploy registry: cd ../registry && node scripts/deploy.js prod
  3. Publish CLI: cd ../cli && node scripts/deploy.js prod
`);
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'local':
      await runLocalSetup();
      break;
    case 'prod':
    case 'production':
      await runProductionDeploy();
      break;
    case 'package':
    case 'build':
      await packageAll();
      break;
    case 'list':
      listAll();
      break;
    case 'clean':
      clean();
      break;
    case 'template':
      if (args[1]) {
        await packageTemplate(args[1], args[2]);
      } else {
        logError('Usage: node deploy.js template <name> [version]');
      }
      break;
    case 'feature':
      if (args[1]) {
        await packageFeature(args[1], args[2]);
      } else {
        logError('Usage: node deploy.js feature <name> [version]');
      }
      break;
    default:
      await interactiveMenu();
  }
}

main().catch((error) => {
  logError(`Deploy failed: ${error.message}`);
  process.exit(1);
});
