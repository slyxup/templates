#!/usr/bin/env node
/**
 * Feature Creator
 * 
 * Interactive tool to create new features
 * 
 * Usage:
 *   node scripts/create-feature.js <feature-name>
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_ROOT = path.join(__dirname, '../..');
const FEATURES_SRC = path.join(PROJECT_ROOT, 'templates/features');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

const FRAMEWORK_OPTIONS = [
  'react', 'vue', 'next', 'nuxt', 'svelte', 'astro', 'solid',
  'angular', 'express', 'fastify', 'nest', 'node'
];

async function createFeature() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║    SlyxUp Feature Creator v1.0.0     ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const featureName = process.argv[2];
  
  if (!featureName) {
    console.log('Usage: node scripts/create-feature.js <feature-name>');
    console.log('Examples:');
    console.log('  node scripts/create-feature.js redux');
    console.log('  node scripts/create-feature.js graphql');
    console.log('  node scripts/create-feature.js authentication\n');
    process.exit(1);
  }

  console.log(`Creating feature: ${featureName}\n`);

  // Get feature details
  const description = await question('Description: ');
  const category = await question('Category (styling/state/testing/database/auth/etc): ');
  const frameworks = await question(`Frameworks (comma-separated from: ${FRAMEWORK_OPTIONS.join(', ')}): `);
  const version = await question('Version (default 1.0.0): ') || '1.0.0';

  const featureDir = path.join(FEATURES_SRC, featureName, `v${version}`);
  
  if (fs.existsSync(featureDir)) {
    console.log(`\n❌ Feature '${featureName}' v${version} already exists!`);
    rl.close();
    return;
  }

  // Create feature directory
  fs.mkdirSync(featureDir, { recursive: true });

  const frameworkList = frameworks.split(',').map(f => f.trim());

  // Create manifest.json
  const manifest = {
    name: featureName,
    version,
    description,
    category,
    status: 'stable',
    frameworks: frameworkList,
    dependencies: [],
    devDependencies: [],
    peerDependencies: [],
    conflicts: [],
    files: [],
    scripts: {},
    instructions: `${featureName} has been added to your project!`,
    nextSteps: [
      "Run 'npm install' to install dependencies"
    ]
  };

  fs.writeFileSync(
    path.join(featureDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // Create files directory
  fs.mkdirSync(path.join(featureDir, 'files'), { recursive: true });

  // Create README
  const readme = `# ${featureName}

${description}

## Supported Frameworks

${frameworkList.map(f => `- ${f}`).join('\n')}

## Installation

\`\`\`bash
slyxup add ${featureName}
\`\`\`

## Usage

TODO: Add usage instructions

## Configuration

TODO: Add configuration details
`;

  fs.writeFileSync(path.join(featureDir, 'README.md'), readme, 'utf8');

  // Create example config file
  const exampleConfig = `// Example configuration file for ${featureName}
export default {
  // Add your configuration here
};
`;

  fs.writeFileSync(
    path.join(featureDir, 'files', `${featureName}.config.example`),
    exampleConfig,
    'utf8'
  );

  console.log('\n✅ Feature created successfully!');
  console.log(`\n📁 Location: ${featureDir}`);
  console.log('\n📝 Next steps:');
  console.log('  1. Add configuration files to files/ directory');
  console.log('  2. Update manifest.json with:');
  console.log('     - dependencies/devDependencies');
  console.log('     - files array with file actions');
  console.log('     - scripts to add to package.json');
  console.log('  3. Test the feature');
  console.log('  4. Run: npm run build:features');
  console.log('\n');

  rl.close();
}

createFeature().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
