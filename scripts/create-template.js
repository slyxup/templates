#!/usr/bin/env node
/**
 * Template Creator
 * 
 * Interactive tool to create new project templates
 * 
 * Usage:
 *   node scripts/create-template.js <template-name>
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_ROOT = path.join(__dirname, '../..');
const TEMPLATES_SRC = path.join(PROJECT_ROOT, 'templates/src');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createTemplate() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║    SlyxUp Template Creator v1.0.0    ║');
  console.log('╚═══════════════════════════════════════╝\n');

  const templateName = process.argv[2];
  
  if (!templateName) {
    console.log('Usage: node scripts/create-template.js <template-name>');
    console.log('Examples:');
    console.log('  node scripts/create-template.js next');
    console.log('  node scripts/create-template.js vue');
    console.log('  node scripts/create-template.js express\n');
    process.exit(1);
  }

  console.log(`Creating template: ${templateName}\n`);

  // Get template details
  const description = await question('Description: ');
  const framework = await question('Framework: ');
  const frameworkVersion = await question('Framework Version (e.g., Next.js 14): ');
  const category = await question('Category (frontend/backend/fullstack): ');
  const tags = await question('Tags (comma-separated): ');

  const templateDir = path.join(TEMPLATES_SRC, templateName);
  
  if (fs.existsSync(templateDir)) {
    console.log(`\n❌ Template '${templateName}' already exists!`);
    rl.close();
    return;
  }

  // Create template directory
  fs.mkdirSync(templateDir, { recursive: true });

  // Create template.json manifest
  const manifest = {
    name: templateName,
    version: '1.0.0',
    description,
    framework,
    frameworkVersion,
    status: 'stable',
    category,
    tags: tags.split(',').map(t => t.trim()),
    aliases: [],
    features: []
  };

  fs.writeFileSync(
    path.join(templateDir, 'template.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  // Create basic structure
  fs.mkdirSync(path.join(templateDir, 'src'), { recursive: true });
  fs.mkdirSync(path.join(templateDir, 'public'), { recursive: true });

  // Create package.json
  const packageJson = {
    name: `${templateName}-app`,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'echo "Add your dev script here"',
      build: 'echo "Add your build script here"',
      start: 'echo "Add your start script here"'
    },
    dependencies: {},
    devDependencies: {}
  };

  fs.writeFileSync(
    path.join(templateDir, 'package.json'),
    JSON.stringify(packageJson, null, 2),
    'utf8'
  );

  // Create README
  const readme = `# ${frameworkVersion} Template

${description}

## Features

- TODO: Add features here

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Project Structure

\`\`\`
├── src/          # Source files
├── public/       # Static assets
└── package.json  # Dependencies
\`\`\`
`;

  fs.writeFileSync(path.join(templateDir, 'README.md'), readme, 'utf8');

  // Create .gitignore
  const gitignore = `node_modules/
.next/
.nuxt/
dist/
build/
.DS_Store
*.log
.env
.env.local
`;

  fs.writeFileSync(path.join(templateDir, '.gitignore'), gitignore, 'utf8');

  console.log('\n✅ Template created successfully!');
  console.log(`\n📁 Location: ${templateDir}`);
  console.log('\n📝 Next steps:');
  console.log('  1. Add your template files to the directory');
  console.log('  2. Update package.json with proper dependencies');
  console.log('  3. Test the template');
  console.log('  4. Run: npm run build:templates');
  console.log('\n');

  rl.close();
}

createTemplate().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
