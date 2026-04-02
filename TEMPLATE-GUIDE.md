# SlyxUp Templates & Features Guide

This guide explains how to create, manage, and deploy templates and features for SlyxUp.

## Directory Structure

```
templates/
├── projects/              # Project templates
│   ├── react/
│   │   └── v1.0.0/       # Versioned template
│   │       ├── manifest.json
│   │       ├── package.json
│   │       └── src/
│   ├── vue/
│   ├── next/
│   ├── express/
│   └── discord/
├── features/              # Feature packages
│   ├── tailwind/
│   │   └── v1.0.0/
│   │       └── manifest.json
│   ├── eslint/
│   ├── prettier/
│   └── ...
├── packaged/              # Built tar.gz archives
├── scripts/               # Build and deploy scripts
└── package.json
```

## Creating a New Template

### 1. Create Directory Structure

```bash
cd templates
mkdir -p projects/mytemplate/v1.0.0
cd projects/mytemplate/v1.0.0
```

### 2. Create manifest.json

```json
{
  "name": "mytemplate",
  "version": "1.0.0",
  "description": "Description of your template",
  "framework": "react",
  "frameworkVersion": "React 18",
  "structure": {
    "sourceDir": "src",
    "componentsDir": "src/components",
    "pagesDir": "src/pages",
    "stylesDir": "src/styles",
    "configDir": "."
  },
  "defaultFeatures": [],
  "recommendedFeatures": ["typescript", "eslint", "prettier", "tailwind"],
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### 3. Add Template Files

Create your template files in the version directory:

```
v1.0.0/
├── manifest.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    └── index.css
```

### 4. Use Placeholders

Use these placeholders in your files (they'll be replaced during scaffolding):

| Placeholder | Description |
|-------------|-------------|
| `{{projectName}}` | The project name |
| `{{packageName}}` | npm-safe package name |
| `{{description}}` | Project description |
| `{{author}}` | Author name |
| `{{year}}` | Current year |

Example `package.json`:
```json
{
  "name": "{{packageName}}",
  "version": "0.1.0",
  "description": "{{description}}",
  "author": "{{author}}"
}
```

### 5. Test Locally

```bash
cd templates
node scripts/deploy.js template mytemplate
```

## Creating a New Feature

### 1. Create Directory Structure

```bash
cd templates
mkdir -p features/myfeature/v1.0.0
cd features/myfeature/v1.0.0
```

### 2. Create manifest.json

```json
{
  "name": "myfeature",
  "version": "1.0.0",
  "description": "Description of your feature",
  "frameworks": ["react", "next", "vue", "*"],
  "frameworkVersion": "MyFeature 1.0",
  "status": "stable",
  "category": "styling",
  "dependencies": {
    "some-package": "^1.0.0"
  },
  "devDependencies": {
    "some-dev-package": "^1.0.0"
  },
  "files": [
    {
      "path": "tailwind.config.js",
      "content": "module.exports = { ... }"
    }
  ],
  "modifications": [
    {
      "file": "package.json",
      "type": "merge",
      "content": {
        "scripts": {
          "lint": "eslint ."
        }
      }
    }
  ],
  "scripts": {
    "postinstall": "npx tailwindcss init -p"
  },
  "instructions": "Feature has been added! Run `npm install` to install dependencies.",
  "aliases": ["myfeature-alias"],
  "tags": ["tag1", "tag2"]
}
```

### 3. Feature Manifest Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Feature identifier |
| `version` | string | Yes | Semantic version |
| `description` | string | Yes | Brief description |
| `frameworks` | string[] | Yes | Compatible frameworks (`*` for all) |
| `frameworkVersion` | string | No | Display version (e.g., "Tailwind 3.4") |
| `status` | string | No | `stable`, `beta`, `coming-soon` |
| `category` | string | No | Feature category for grouping |
| `dependencies` | object | No | npm dependencies to add |
| `devDependencies` | object | No | npm devDependencies to add |
| `files` | array | No | Files to create |
| `modifications` | array | No | Files to modify |
| `scripts` | object | No | npm scripts to add |
| `instructions` | string | No | Post-install message |
| `aliases` | string[] | No | Alternative names |
| `tags` | string[] | No | Searchable tags |

### 4. File Modifications

#### Create New File
```json
{
  "files": [
    {
      "path": "tailwind.config.js",
      "content": "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: ['./src/**/*.{js,ts,jsx,tsx}'],\n  theme: { extend: {} },\n  plugins: []\n}"
    }
  ]
}
```

#### Modify Existing File
```json
{
  "modifications": [
    {
      "file": "src/index.css",
      "type": "prepend",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
    }
  ]
}
```

#### Merge JSON
```json
{
  "modifications": [
    {
      "file": "package.json",
      "type": "merge",
      "content": {
        "scripts": {
          "format": "prettier --write ."
        }
      }
    }
  ]
}
```

### 5. Framework-Specific Configuration

For features that need different config per framework:

```json
{
  "frameworks": ["react", "next", "vue"],
  "frameworkConfig": {
    "react": {
      "files": [
        { "path": "src/styles/tailwind.css", "content": "..." }
      ]
    },
    "next": {
      "files": [
        { "path": "app/globals.css", "content": "..." }
      ]
    },
    "vue": {
      "files": [
        { "path": "src/assets/main.css", "content": "..." }
      ]
    }
  }
}
```

## Packaging

### Package All
```bash
cd templates
node scripts/deploy.js package
```

### Package Specific Template
```bash
node scripts/deploy.js template react
```

### Package Specific Feature
```bash
node scripts/deploy.js feature tailwind
```

## Testing Locally

### 1. Package Everything
```bash
cd templates
node scripts/deploy.js local
```

### 2. Set Environment Variable
```bash
export SLYXUP_REGISTRY_URL="file:///path/to/slyxup/registry/local-registry.json"
```

### 3. Test Template
```bash
slyxup init mytemplate test-project
cd test-project
npm install
npm run dev
```

### 4. Test Feature
```bash
slyxup add myfeature
```

## Adding to Registry

### 1. Update registry.json

Add your template/feature to `registry/registry.json`:

```json
{
  "templates": {
    "mytemplate": [
      {
        "name": "mytemplate",
        "version": "1.0.0",
        "description": "My template description",
        "framework": "react",
        "frameworkVersion": "React 18",
        "status": "stable",
        "downloadUrl": "https://cdn.slyxup.online/templates/mytemplate.tar.gz",
        "sha256": "...",
        "size": 0,
        "aliases": ["my-template"],
        "tags": ["react", "vite"],
        "category": "frontend"
      }
    ]
  }
}
```

### 2. Update Hashes

After packaging:
```bash
cd registry
node scripts/deploy.js hash
```

### 3. Validate
```bash
node scripts/deploy.js validate
```

## Deploying to Production

### Using Master Sync Script
```bash
cd /path/to/slyxup
node sync.js prod
```

### Manual Deployment

1. Package templates:
   ```bash
   cd templates
   node scripts/deploy.js package
   ```

2. Upload to R2:
   ```bash
   cd registry
   node scripts/upload-to-r2.js
   ```

3. Deploy registry:
   ```bash
   npx wrangler pages deploy . --project-name=slyxup-registry
   ```

## Best Practices

### Template Best Practices

1. **Keep it minimal** - Include only essential files
2. **Use TypeScript** - Default to TypeScript for better DX
3. **Document clearly** - Include README and comments
4. **Test thoroughly** - Test on clean systems
5. **Version properly** - Follow semantic versioning

### Feature Best Practices

1. **Framework compatibility** - Test on all supported frameworks
2. **Non-destructive** - Don't overwrite user files without warning
3. **Idempotent** - Running twice shouldn't break things
4. **Clear instructions** - Provide helpful post-install messages
5. **Good defaults** - Sensible configuration out of the box

### Security Considerations

1. **No secrets** - Never include API keys or credentials
2. **Validate inputs** - Always validate user-provided data
3. **SHA-256 hashes** - All packages are hash-verified
4. **Review dependencies** - Audit npm packages before adding

## Troubleshooting

### Package Not Found

1. Check if packaged file exists:
   ```bash
   ls -la templates/packaged/myfeature.tar.gz
   ```

2. Regenerate local registry:
   ```bash
   cd registry
   node scripts/deploy.js local
   ```

### Hash Mismatch

Regenerate hashes:
```bash
cd registry
node scripts/deploy.js hash
```

### Feature Not Working

1. Enable verbose mode:
   ```bash
   slyxup add myfeature --verbose
   ```

2. Check manifest.json syntax:
   ```bash
   cat templates/features/myfeature/v1.0.0/manifest.json | jq .
   ```

3. Test dry run:
   ```bash
   slyxup add myfeature --dry-run
   ```

## Example: Adding Tailwind Feature

Here's a complete example of the Tailwind feature manifest:

```json
{
  "name": "tailwind",
  "version": "1.0.0",
  "description": "Tailwind CSS v3.4 utility-first CSS framework",
  "frameworks": ["react", "next", "vue", "svelte", "astro"],
  "frameworkVersion": "Tailwind 3.4",
  "status": "stable",
  "category": "styling",
  "devDependencies": {
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.18"
  },
  "files": [
    {
      "path": "tailwind.config.js",
      "content": "/** @type {import('tailwindcss').Config} */\nexport default {\n  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}"
    },
    {
      "path": "postcss.config.js",
      "content": "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}"
    }
  ],
  "modifications": [
    {
      "file": "src/index.css",
      "type": "prepend",
      "content": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n"
    }
  ],
  "instructions": "Tailwind CSS has been added! Run `npm install` to install dependencies.",
  "aliases": ["tailwindcss", "tailwind-css", "tw"],
  "tags": ["tailwind", "css", "styling", "utility-first"]
}
```
