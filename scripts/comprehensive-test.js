#!/usr/bin/env node
/**
 * Comprehensive Feature Test Suite
 * 
 * Tests ALL scenarios:
 * - Clean projects
 * - Broken/messy projects (beginner mistakes)
 * - Projects with existing features
 * - Large projects
 * - Edge cases
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '../..');
const TEST_DIR = path.join(PROJECT_ROOT, 'test-projects');
const CLI_PATH = path.join(PROJECT_ROOT, 'cli/dist/cli.js');
const LOCAL_REGISTRY = path.join(PROJECT_ROOT, 'registry/local-registry.json');

// Colors
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(msg, color = 'reset') {
  console.log(`${c[color]}${msg}${c.reset}`);
}

function exec(cmd, cwd, silent = false) {
  try {
    return execSync(cmd, {
      cwd,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    if (!silent) throw error;
    return null;
  }
}

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  scenarios: []
};

function testScenario(name, fn) {
  stats.total++;
  log(`\n${'='.repeat(70)}`, 'gray');
  log(`📝 Test: ${name}`, 'cyan');
  log('='.repeat(70), 'gray');
  
  try {
    const result = fn();
    if (result === false) {
      stats.failed++;
      stats.scenarios.push({ name, status: 'failed' });
      log(`  ✗ FAILED`, 'red');
    } else if (result === 'warning') {
      stats.warnings++;
      stats.scenarios.push({ name, status: 'warning' });
      log(`  ⚠ WARNING`, 'yellow');
    } else {
      stats.passed++;
      stats.scenarios.push({ name, status: 'passed' });
      log(`  ✓ PASSED`, 'green');
    }
  } catch (error) {
    stats.failed++;
    stats.scenarios.push({ name, status: 'failed', error: error.message });
    log(`  ✗ FAILED: ${error.message}`, 'red');
  }
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(TEST_DIR, { recursive: true });
}

function createBrokenProject(name, type) {
  const projectPath = path.join(TEST_DIR, name);
  fs.mkdirSync(projectPath, { recursive: true });
  
  // Create package.json with issues
  const packageJson = {
    name: name,
    version: "0.1.0",
    // Missing dependencies section (common beginner mistake)
  };
  
  if (type === 'missing-deps') {
    // No dependencies at all
  } else if (type === 'broken-syntax') {
    // Will create broken files
  } else if (type === 'messy') {
    packageJson.dependencies = {
      "react": "^18.0.0",
      // Duplicate or conflicting deps
      "React": "^17.0.0" // Wrong casing
    };
  }
  
  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create src with broken code
  fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
  
  if (type === 'broken-syntax') {
    fs.writeFileSync(
      path.join(projectPath, 'src/App.jsx'),
      `import React from 'react
      // Missing closing quote and semicolon
      export default function App() {
        return <div>Broken</div>
      `
    );
  } else if (type === 'messy') {
    // Messy formatting, mixed styles
    fs.writeFileSync(
      path.join(projectPath, 'src/App.jsx'),
      `import    React    from    "react"
import {useState} from "react";
      const App=()=>{
const[count,setCount]=useState(0)
        return(<div className="app" style={{margin:0,padding:0}}>
    <h1>Count: {count}</h1>
      <button onClick={()=>setCount(count+1)}>Increment</button>
          </div>)
}
export default App`
    );
  }
  
  // Create vite.config with or without issues
  if (type !== 'missing-config') {
    fs.writeFileSync(
      path.join(projectPath, 'vite.config.js'),
      `export default { plugins: [] }`
    );
  }
  
  return projectPath;
}

function createProjectWithExistingFeature(name, feature) {
  const projectPath = path.join(TEST_DIR, name);
  exec('npx create-vite@latest ' + name + ' --template react-ts', TEST_DIR, true);
  
  // Add the feature manually (simulate existing installation)
  if (feature === 'tailwind') {
    fs.writeFileSync(
      path.join(projectPath, 'tailwind.config.js'),
      `export default { content: ["./src/**/*.{js,jsx,ts,tsx}"] }`
    );
    
    const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies.tailwindcss = '^3.3.0';
    fs.writeFileSync(
      path.join(projectPath, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
  }
  
  return projectPath;
}

function testFeatureInstall(projectPath, feature, shouldFail = false) {
  const result = exec(
    `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add ${feature} --yes`,
    projectPath,
    true
  );
  
  if (shouldFail) {
    return result === null; // Should fail
  } else {
    return result && (result.includes('installed successfully') || result.includes('already installed'));
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

log('\n╔═══════════════════════════════════════════════════════════════╗', 'blue');
log('║         Comprehensive SlyxUp Feature Test Suite v2.0         ║', 'blue');
log('╚═══════════════════════════════════════════════════════════════╝\n', 'blue');

log('🧹 Cleaning up old test projects...', 'gray');
cleanup();

// SCENARIO 1: Clean React Project
testScenario('Install Tailwind in Clean React Project', () => {
  exec('npx create-vite@latest test-clean-react --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-clean-react');
  exec('npm install', projectPath, true);
  
  return testFeatureInstall(projectPath, 'tailwind');
});

// SCENARIO 2: Project with Missing Dependencies Section
testScenario('Install in Project with Missing package.json Dependencies', () => {
  const projectPath = createBrokenProject('test-missing-deps', 'missing-deps');
  const result = testFeatureInstall(projectPath, 'prettier');
  
  // Should still work - CLI should add dependencies section
  return result;
});

// SCENARIO 3: Project with Broken Syntax
testScenario('Install in Project with Broken JavaScript Syntax', () => {
  const projectPath = createBrokenProject('test-broken-syntax', 'broken-syntax');
  
  // Should still install config files even if source has syntax errors
  return testFeatureInstall(projectPath, 'eslint');
});

// SCENARIO 4: Messy Project (Beginner Code)
testScenario('Install in Messy Beginner Project', () => {
  const projectPath = createBrokenProject('test-messy', 'messy');
  
  // Should work despite messy formatting
  return testFeatureInstall(projectPath, 'prettier');
});

// SCENARIO 5: Feature Already Exists (Manual Installation)
testScenario('Install Feature That Already Exists Manually', () => {
  const projectPath = createProjectWithExistingFeature('test-existing-tailwind', 'tailwind');
  exec('npm install', projectPath, true);
  
  const result = exec(
    `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add tailwind --yes`,
    projectPath,
    true
  );
  
  // Should detect and skip or ask to replace
  return result && (result.includes('already installed') || result.includes('exists'));
});

// SCENARIO 6: Installing Conflicting Features
testScenario('Install Vitest When Jest Already Installed', () => {
  exec('npx create-vite@latest test-conflict --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-conflict');
  exec('npm install', projectPath, true);
  
  // Install Jest first
  const jest = testFeatureInstall(projectPath, 'jest');
  if (!jest) return false;
  
  // Try to install Vitest (should fail/warn)
  const vitest = exec(
    `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add vitest --yes`,
    projectPath,
    true
  );
  
  return vitest && vitest.includes('conflicts with');
});

// SCENARIO 7: Installing Feature with Missing Dependencies
testScenario('Install Shadcn Without Tailwind', () => {
  exec('npx create-vite@latest test-shadcn-no-tw --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-shadcn-no-tw');
  exec('npm install', projectPath, true);
  
  const result = exec(
    `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add shadcn --yes`,
    projectPath,
    true
  );
  
  // Should fail with dependency error
  return result && (result.includes('requires tailwind') || result.includes('requires'));
});

// SCENARIO 8: Installing Multiple Features Together
testScenario('Install Multiple Features (Tailwind + Prettier + ESLint)', () => {
  exec('npx create-vite@latest test-multiple --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-multiple');
  exec('npm install', projectPath, true);
  
  const result = exec(
    `SLYXUP_REGISTRY_URL=${LOCAL_REGISTRY} node ${CLI_PATH} add tailwind prettier eslint --yes`,
    projectPath,
    true
  );
  
  return result && result.includes('installed successfully');
});

// SCENARIO 9: Project Without node_modules
testScenario('Install in Project Without node_modules', () => {
  exec('npx create-vite@latest test-no-modules --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-no-modules');
  // Don't run npm install
  
  // Should still add to package.json
  return testFeatureInstall(projectPath, 'axios');
});

// SCENARIO 10: Large Project Simulation
testScenario('Install in Large Project with Many Files', () => {
  exec('npx create-vite@latest test-large --template react-ts', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-large');
  exec('npm install', projectPath, true);
  
  // Create many files
  const srcPath = path.join(projectPath, 'src');
  for (let i = 0; i < 50; i++) {
    fs.writeFileSync(
      path.join(srcPath, `Component${i}.tsx`),
      `export default function Component${i}() { return <div>Component ${i}</div> }`
    );
  }
  
  // Should still work
  return testFeatureInstall(projectPath, 'zustand');
});

// SCENARIO 11: Next.js Project
testScenario('Install in Next.js Project', () => {
  exec('npx create-next-app@latest test-next --typescript --tailwind --app --no-src-dir', TEST_DIR, true);
  const projectPath = path.join(TEST_DIR, 'test-next');
  exec('npm install', projectPath, true);
  
  return testFeatureInstall(projectPath, 'prisma');
});

// SCENARIO 12: Project with Nested Structure
testScenario('Install in Monorepo/Nested Structure', () => {
  const projectPath = path.join(TEST_DIR, 'test-monorepo/packages/app');
  fs.mkdirSync(projectPath, { recursive: true });
  
  exec('npx create-vite@latest app --template react-ts', path.join(TEST_DIR, 'test-monorepo/packages'), true);
  exec('npm install', projectPath, true);
  
  return testFeatureInstall(projectPath, 'vitest');
});

// ============================================================================
// PRINT RESULTS
// ============================================================================

log('\n' + '='.repeat(70), 'gray');
log('📊 TEST SUMMARY', 'blue');
log('='.repeat(70), 'gray');

log(`\nTotal Tests: ${stats.total}`, 'gray');
log(`✓ Passed: ${stats.passed}`, 'green');
log(`⚠ Warnings: ${stats.warnings}`, 'yellow');
log(`✗ Failed: ${stats.failed}`, 'red');

if (stats.failed > 0) {
  log('\n❌ Failed Tests:', 'red');
  stats.scenarios
    .filter(s => s.status === 'failed')
    .forEach(s => {
      log(`  • ${s.name}`, 'red');
      if (s.error) log(`    ${s.error}`, 'gray');
    });
}

if (stats.warnings > 0) {
  log('\n⚠️  Warnings:', 'yellow');
  stats.scenarios
    .filter(s => s.status === 'warning')
    .forEach(s => log(`  • ${s.name}`, 'yellow'));
}

log('\n🧹 Cleaning up test projects...', 'gray');
cleanup();

const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
log(`\n✓ Test Suite Complete - ${successRate}% Success Rate\n`, 'green');

process.exit(stats.failed > 0 ? 1 : 0);
