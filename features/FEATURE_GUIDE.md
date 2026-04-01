# 🎨 SlyxUp Feature System (Shadcn-Style)

Create features that intelligently integrate with existing projects.

---

## 🎯 Overview

Features in SlyxUp work like shadcn/ui - they:
- ✅ Detect existing project structure
- ✅ Respect existing code and configuration
- ✅ Merge dependencies intelligently
- ✅ Add files without overwriting
- ✅ Show clear progress and duration
- ✅ Provide rollback on failure

---

## 📦 Feature Structure

```
features/
└── {feature-name}/
    └── v{version}/
        ├── feature.json          # Feature manifest
        ├── files/                # Files to add
        │   ├── src/
        │   └── config/
        ├── scripts/
        │   ├── pre-install.js    # Pre-installation checks
        │   ├── post-install.js   # Post-installation setup
        │   └── validate.js       # Validation
        └── README.md             # Documentation
```

---

## 📋 Feature Manifest (feature.json)

```json
{
  "id": "tailwind",
  "name": "Tailwind CSS",
  "version": "1.0.0",
  "description": "Utility-first CSS framework",
  "category": "styling",
  
  "compatibility": {
    "frameworks": ["react", "vue", "nextjs", "vite"],
    "minNodeVersion": "18.0.0"
  },
  
  "dependencies": {
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  },
  
  "devDependencies": {},
  
  "files": [
    {
      "source": "config/tailwind.config.js",
      "destination": "tailwind.config.js",
      "overwrite": false
    },
    {
      "source": "config/postcss.config.js",
      "destination": "postcss.config.js",
      "overwrite": false
    },
    {
      "source": "styles/tailwind.css",
      "destination": "src/index.css",
      "action": "prepend"
    }
  },
  
  "modifications": [
    {
      "file": "src/index.css",
      "action": "prepend",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
    }
  ],
  
  "scripts": {
    "preInstall": "scripts/pre-install.js",
    "postInstall": "scripts/post-install.js",
    "validate": "scripts/validate.js"
  },
  
  "instructions": [
    "Tailwind CSS has been added to your project",
    "Use utility classes like: className=\"flex items-center justify-center\"",
    "Customize theme in tailwind.config.js",
    "Learn more: https://tailwindcss.com/docs"
  ]
}
```

---

## 🔧 Feature Types

### Type 1: Configuration Feature (Tailwind, ESLint)

Adds configuration files and dependencies:

```json
{
  "id": "tailwind",
  "files": [
    {"source": "tailwind.config.js", "destination": "tailwind.config.js"}
  ],
  "modifications": [
    {
      "file": "src/index.css",
      "action": "prepend",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
    }
  ]
}
```

### Type 2: Component Library (shadcn, DaisyUI)

Adds components and utilities:

```json
{
  "id": "shadcn",
  "files": [
    {"source": "components/ui/button.tsx", "destination": "src/components/ui/button.tsx"},
    {"source": "lib/utils.ts", "destination": "src/lib/utils.ts"}
  ],
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

### Type 3: Authentication (Auth.js, Supabase)

Adds complete features with routes:

```json
{
  "id": "auth-supabase",
  "files": [
    {"source": "lib/supabase.ts", "destination": "src/lib/supabase.ts"},
    {"source": "components/AuthProvider.tsx", "destination": "src/components/AuthProvider.tsx"}
  ],
  "envVariables": [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
  ]
}
```

---

## 🛠️ Creating a Feature

### Step 1: Create Feature Directory

```bash
cd /home/ysr-hameed/Documents/Project/slyxup
mkdir -p features/tailwind/v1.0.0/{files,scripts}
cd features/tailwind/v1.0.0
```

### Step 2: Create feature.json

```json
{
  "id": "tailwind",
  "name": "Tailwind CSS",
  "version": "1.0.0",
  "description": "Utility-first CSS framework with instant UI development",
  "category": "styling",
  
  "compatibility": {
    "frameworks": ["react", "vue", "nextjs"],
    "requires": ["vite"]
  },
  
  "dependencies": {
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  },
  
  "files": [
    {
      "source": "files/tailwind.config.js",
      "destination": "tailwind.config.js",
      "overwrite": false
    },
    {
      "source": "files/postcss.config.js",
      "destination": "postcss.config.js",
      "overwrite": false
    }
  ],
  
  "modifications": [
    {
      "file": "src/index.css",
      "action": "prepend",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n",
      "marker": "@tailwind"
    }
  ],
  
  "instructions": [
    "✅ Tailwind CSS installed successfully!",
    "",
    "📝 Usage:",
    "  <div className=\"flex items-center justify-center h-screen\">",
    "    <h1 className=\"text-4xl font-bold text-blue-600\">Hello Tailwind!</h1>",
    "  </div>",
    "",
    "🎨 Customize:",
    "  Edit tailwind.config.js to customize your theme",
    "",
    "📚 Learn more: https://tailwindcss.com/docs"
  ]
}
```

### Step 3: Add Configuration Files

**files/tailwind.config.js:**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**files/postcss.config.js:**
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Step 4: Create Pre-Install Script

**scripts/pre-install.js:**
```javascript
#!/usr/bin/env node

// Check if project is compatible
export default async function preInstall(context) {
  const { projectPath, projectMetadata } = context;
  
  // Check if it's a Vite project
  const packageJson = await context.readJSON('package.json');
  
  if (!packageJson.devDependencies?.vite && !packageJson.dependencies?.vite) {
    throw new Error('Tailwind CSS feature requires Vite. This project does not use Vite.');
  }
  
  // Check if Tailwind is already installed
  if (packageJson.dependencies?.tailwindcss || packageJson.devDependencies?.tailwindcss) {
    const shouldContinue = await context.prompt.confirm(
      'Tailwind CSS is already installed. Do you want to continue?',
      false
    );
    
    if (!shouldContinue) {
      throw new Error('Installation cancelled by user');
    }
  }
  
  console.log('✅ Compatibility check passed');
  return true;
}
```

### Step 5: Create Post-Install Script

**scripts/post-install.js:**
```javascript
#!/usr/bin/env node

export default async function postInstall(context) {
  const { projectPath } = context;
  
  console.log('\n🎨 Setting up Tailwind CSS...\n');
  
  // Check if index.css already has Tailwind directives
  const indexCss = await context.readFile('src/index.css');
  
  if (!indexCss.includes('@tailwind')) {
    console.log('✅ Added Tailwind directives to src/index.css');
  } else {
    console.log('ℹ️  Tailwind directives already exist in src/index.css');
  }
  
  console.log('✅ Configuration files created');
  console.log('✅ Dependencies installed\n');
  
  return true;
}
```

### Step 6: Package Feature

```bash
cd /home/ysr-hameed/Documents/Project/slyxup/features

# Create package script
./scripts/package-tailwind.sh
```

**scripts/package-tailwind.sh:**
```bash
#!/bin/bash
set -e

FEATURE_DIR="$(pwd)/tailwind/v1.0.0"
OUTPUT_FILE="tailwind/v1.0.0/tailwind-1.0.0.tar.gz"

echo "📦 Packaging Tailwind CSS feature..."

rm -f "$OUTPUT_FILE"

cd "$FEATURE_DIR"
tar -czf "../tailwind-1.0.0.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  .

HASH=$(shasum -a 256 "../tailwind-1.0.0.tar.gz" | awk '{print $1}')

echo "✅ Package created"
echo "SHA-256: $HASH"
```

### Step 7: Update Registry

Add to `registry/registry.json`:

```json
{
  "features": [
    {
      "id": "tailwind",
      "name": "Tailwind CSS",
      "aliases": ["tailwindcss", "tailwind-css"],
      "description": "Utility-first CSS framework",
      "version": "1.0.0",
      "url": "https://cdn.slyxup.online/features/tailwind-1.0.0.tar.gz",
      "integrity": "sha256-...",
      "category": "styling",
      "tags": ["css", "styling", "tailwind", "utility"],
      "compatibility": {
        "frameworks": ["react", "vue", "nextjs"],
        "requires": ["vite"]
      }
    }
  ]
}
```

---

## 🎨 Feature Actions

### Action 1: Add Files
```json
{
  "files": [
    {
      "source": "components/Button.tsx",
      "destination": "src/components/ui/Button.tsx",
      "overwrite": false
    }
  ]
}
```

### Action 2: Prepend Content
```json
{
  "modifications": [
    {
      "file": "src/index.css",
      "action": "prepend",
      "content": "@tailwind base;\n",
      "marker": "@tailwind"
    }
  ]
}
```

### Action 3: Append Content
```json
{
  "modifications": [
    {
      "file": "vite.config.ts",
      "action": "append",
      "content": "\n// Custom plugin\n"
    }
  ]
}
```

### Action 4: Replace Content
```json
{
  "modifications": [
    {
      "file": "tsconfig.json",
      "action": "merge",
      "content": {
        "compilerOptions": {
          "paths": {
            "@/*": ["./src/*"]
          }
        }
      }
    }
  ]
}
```

---

## 🔍 Smart Detection

Features should detect and adapt:

```javascript
// Detect project type
export function detectFramework(packageJson) {
  if (packageJson.dependencies?.react) return 'react';
  if (packageJson.dependencies?.vue) return 'vue';
  if (packageJson.dependencies?.next) return 'nextjs';
  return 'unknown';
}

// Detect build tool
export function detectBuildTool(packageJson) {
  if (packageJson.devDependencies?.vite) return 'vite';
  if (packageJson.devDependencies?.webpack) return 'webpack';
  return 'unknown';
}

// Detect existing features
export function hasFeature(packageJson, featureName) {
  return !!(
    packageJson.dependencies?.[featureName] ||
    packageJson.devDependencies?.[featureName]
  );
}
```

---

## ⚡ Example Features

### 1. Tailwind CSS
- Adds CSS framework
- Configures PostCSS
- Updates styles

### 2. shadcn/ui
- Installs Tailwind (if needed)
- Adds component library
- Configures paths

### 3. Lucide Icons
- Adds icon library
- No configuration needed
- Usage examples

### 4. ESLint + Prettier
- Adds linting
- Configures rules
- Adds scripts

### 5. Supabase Auth
- Auth setup
- Environment variables
- Provider component

---

## 🎯 Feature Quality Checklist

- [ ] Clear feature.json manifest
- [ ] Compatibility checks
- [ ] Non-destructive installation
- [ ] Smart merging of configs
- [ ] Progress indicators
- [ ] Rollback support
- [ ] Clear instructions
- [ ] Documentation
- [ ] Example usage
- [ ] No conflicts

---

## 🚀 Usage

```bash
# Install feature
slyxup add tailwind

# Install multiple features
slyxup add tailwind shadcn lucide

# List available features
slyxup list features

# Remove feature (future)
slyxup remove tailwind
```

---

**Features should feel magical - just like shadcn/ui! ✨**
