#!/usr/bin/env node
/**
 * Feature Testing Suite
 * 
 * Tests all features across all supported frameworks
 * 
 * Usage:
 *   npm run test:features           # Test all features
 *   npm run test:features tailwind  # Test specific feature
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '../..');
const TEST_DIR = path.join(PROJECT_ROOT, 'test-projects');
const CLI_PATH = path.join(PROJECT_ROOT, 'cli/dist/cli.js');
const LOCAL_REGISTRY = path.join(PROJECT_ROOT, 'registry/local-registry.json');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test project templates
const TEST_PROJECTS = {
  react: {
    create: 'npx create-vite@latest test-react-auto --template react-ts',
    framework: 'react',
    features: ['tailwind', 'eslint', 'prettier', 'vitest', 'zustand', 'react-query', 'axios', 'zod']
  },
  next: {
    create: 'npx create-next-app@latest test-next-auto --typescript --tailwind --app --no-src-dir',
    framework: 'next',
    features: ['eslint', 'prettier', 'prisma', 'shadcn', 'next-auth', 'zod', 'axios']
  },
  vue: {
    create: 'npm create vue@latest test-vue-auto -- --typescript --router',
    framework: 'vue',
    features: ['tailwind', 'eslint', 'prettier', 'vitest', 'pinia', 'axios', 'zod']
  }
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function cleanup(projectPath) {
  if (fs.existsSync(projectPath)) {
    fs.rmSync(projectPath, { recursive: true, force: true });
  }
}

function createTestProject(projectType, config) {
  const projectPath = path.join(TEST_DIR, `test-${projectType}-auto`);
  
  log(`\n📦 Creating ${projectType} test project...`, 'blue');
  
  cleanup(projectPath);
  ensureDir(TEST_DIR);
  
  try {
    // Create project
    execSync(config.create, {
      cwd: TEST_DIR,
      stdio: 'pipe'
    });
    
    // Install dependencies
    if (fs.existsSync(path.join(projectPath, 'package.json'))) {
      log(`  ✓ Installing dependencies...`, 'gray');
      execSync('npm install', {
        cwd: projectPath,
        stdio: 'pipe'
      });
    }
    
    return projectPath;
  } catch (error) {
    log(`  ✗ Failed to create project: ${error.message}`, 'red');
    return null;
  }
}

function testFeature(projectPath, featureName, framework) {
  log(`  🔧 Testing ${featureName}...`, 'blue');
  
  try {
    const result = execSync(
      `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add ${featureName} --yes`,
      {
        cwd: projectPath,
        stdio: 'pipe',
        encoding: 'utf8'
      }
    );
    
    // Check if installation was successful
    if (result.includes('installed successfully') || result.includes('Added 1 feature')) {
      log(`    ✓ ${featureName} installed successfully`, 'green');
      return { success: true, feature: featureName };
    } else if (result.includes('already installed')) {
      log(`    ⚠ ${featureName} already installed`, 'yellow');
      return { success: true, feature: featureName, warning: 'already installed' };
    } else {
      log(`    ✗ ${featureName} installation unclear`, 'yellow');
      return { success: false, feature: featureName, error: 'unclear result' };
    }
  } catch (error) {
    const errorMsg = error.message || error.toString();
    
    // Check for known acceptable errors
    if (errorMsg.includes('requires') || errorMsg.includes('conflicts with')) {
      log(`    ⚠ ${featureName} has dependencies/conflicts`, 'yellow');
      return { success: false, feature: featureName, error: 'dependency issue' };
    }
    
    log(`    ✗ ${featureName} failed: ${errorMsg.split('\n')[0]}`, 'red');
    return { success: false, feature: featureName, error: errorMsg.split('\n')[0] };
  }
}

async function runTests() {
  log('\n╔═══════════════════════════════════════╗', 'blue');
  log('║     Feature Testing Suite v1.0.0     ║', 'blue');
  log('╚═══════════════════════════════════════╝\n', 'blue');

  const testFeatureName = process.argv[2];
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // Load local registry to get available features
  const registry = JSON.parse(fs.readFileSync(LOCAL_REGISTRY, 'utf8'));
  const availableFeatures = Object.keys(registry.features);
  
  log(`📋 Available features: ${availableFeatures.length}`, 'gray');
  
  if (testFeatureName) {
    log(`🎯 Testing specific feature: ${testFeatureName}\n`, 'yellow');
  }

  for (const [projectType, config] of Object.entries(TEST_PROJECTS)) {
    log(`\n${'='.repeat(60)}`, 'gray');
    log(`Testing ${projectType.toUpperCase()} project`, 'blue');
    log('='.repeat(60), 'gray');
    
    const projectPath = createTestProject(projectType, config);
    
    if (!projectPath) {
      log(`  ✗ Skipping ${projectType} tests\n`, 'red');
      continue;
    }
    
    log(`  ✓ Project created: ${projectPath}`, 'green');
    
    // Test features
    const featuresToTest = testFeatureName 
      ? [testFeatureName]
      : config.features.filter(f => availableFeatures.includes(f));
    
    for (const feature of featuresToTest) {
      const result = testFeature(projectPath, feature, config.framework);
      results.total++;
      
      if (result.success) {
        if (result.warning) {
          results.warnings++;
        } else {
          results.passed++;
        }
      } else {
        results.failed++;
      }
      
      results.details.push({
        project: projectType,
        ...result
      });
    }
    
    // Cleanup
    log(`\n  🧹 Cleaning up test project...`, 'gray');
    cleanup(projectPath);
  }

  // Print summary
  log('\n' + '='.repeat(60), 'gray');
  log('📊 Test Summary', 'blue');
  log('='.repeat(60), 'gray');
  log(`Total tests: ${results.total}`, 'gray');
  log(`✓ Passed: ${results.passed}`, 'green');
  log(`⚠ Warnings: ${results.warnings}`, 'yellow');
  log(`✗ Failed: ${results.failed}`, 'red');
  
  // Print failures
  if (results.failed > 0) {
    log('\n❌ Failed Tests:', 'red');
    results.details
      .filter(d => !d.success && !d.warning)
      .forEach(d => {
        log(`  • ${d.project}/${d.feature}: ${d.error}`, 'red');
      });
  }
  
  log('\n');
  
  // Exit with error code if tests failed
  process.exit(results.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  log(`\n❌ Test suite error: ${error.message}`, 'red');
  process.exit(1);
});
