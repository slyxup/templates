# 📦 SlyxUp Template Creation Guide

Complete guide to creating secure, high-quality templates for SlyxUp.

---

## 🎯 Template Structure

```
templates/
└── {template-name}/
    └── v{version}/
        ├── src/              # Source code
        ├── public/           # Static assets (optional)
        ├── package.json      # Dependencies
        ├── tsconfig.json     # TypeScript config (if applicable)
        ├── vite.config.ts    # Build tool config
        ├── .gitignore        # Git ignore rules
        ├── README.md         # Template documentation
        └── .slyxupignore     # Files to exclude from package (optional)
```

---

## ✅ Security Checklist

### MUST HAVE (Required)
- [ ] **No hardcoded secrets** (API keys, tokens, passwords)
- [ ] **No malicious code** (no eval, no exec, no dangerous patterns)
- [ ] **Locked dependency versions** (use `^` or `~` carefully)
- [ ] **Safe file paths** (no `../`, no absolute paths)
- [ ] **XSS protection** (sanitize user inputs)
- [ ] **HTTPS only** (no HTTP links in production code)

### SHOULD HAVE (Recommended)
- [ ] **Environment variables** for configuration
- [ ] **Input validation** where applicable
- [ ] **Error boundaries** (React) or error handlers
- [ ] **TypeScript** for type safety
- [ ] **ESLint configuration** for code quality
- [ ] **Security headers** (if applicable)

### MUST NOT HAVE (Forbidden)
- ❌ **No `dangerouslySetInnerHTML`** without sanitization
- ❌ **No `eval()` or `new Function()`**
- ❌ **No inline event handlers** in HTML
- ❌ **No CDN scripts** from untrusted sources
- ❌ **No outdated dependencies** with known vulnerabilities
- ❌ **No tracking scripts** or analytics without opt-in

---

## 📋 Step-by-Step: Create a Template

### Step 1: Create Directory Structure

```bash
cd /home/ysr-hameed/Documents/Project/slyxup/templates

# Create new template directory
mkdir -p {template-name}/v1.0.0
cd {template-name}/v1.0.0
```

### Step 2: Add Template Files

Create your project files:

```bash
# Example: Vue template
├── src/
│   ├── main.ts
│   ├── App.vue
│   └── components/
├── public/
│   └── favicon.ico
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
└── README.md
```

### Step 3: Security Audit

Run security checks:

```bash
# Check for secrets
grep -r "api[_-]key\|password\|secret\|token" .

# Check for dangerous patterns
grep -r "eval\|dangerouslySetInnerHTML\|innerHTML" .

# Audit dependencies
npm audit

# Check for hardcoded URLs
grep -r "http://" . | grep -v "localhost"
```

### Step 4: Test Template Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Check build output
ls dist/
```

### Step 5: Package Template

```bash
# Create packaging script
cd ../..
./scripts/package-{template-name}.sh
```

**Packaging script template:**

```bash
#!/bin/bash
# scripts/package-{template-name}.sh

set -e

TEMPLATE_DIR="$(pwd)/{template-name}/v1.0.0"
OUTPUT_FILE="{template-name}/v1.0.0/{template-name}.tar.gz"

echo "📦 Packaging {template-name} template..."

# Clean up old package
rm -f "$OUTPUT_FILE"

# Create archive (exclude node_modules, .git, etc.)
cd "$TEMPLATE_DIR"
tar -czf "../{template-name}.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.DS_Store' \
  --exclude='*.log' \
  .

echo "✅ Package created: $OUTPUT_FILE"

# Generate SHA-256 hash
HASH=$(shasum -a 256 "../{template-name}.tar.gz" | awk '{print $1}')
echo ""
echo "SHA-256: $HASH"
echo ""
echo "📝 Add this to registry.json:"
echo "{
  \"id\": \"{template-name}\",
  \"name\": \"{Template Display Name}\",
  \"description\": \"Description here\",
  \"version\": \"1.0.0\",
  \"url\": \"https://cdn.slyxup.online/templates/{template-name}.tar.gz\",
  \"integrity\": \"sha256-$HASH\",
  \"tags\": [\"tag1\", \"tag2\"],
  \"category\": \"frontend\"
}"
```

### Step 6: Update Registry

Add to `registry/registry.json`:

```json
{
  "templates": [
    {
      "id": "react",
      "name": "React",
      "aliases": ["react-app", "vite-react"],
      "description": "Modern React 18 with Vite and TypeScript",
      "version": "1.0.0",
      "url": "https://cdn.slyxup.online/templates/react.tar.gz",
      "integrity": "sha256-...",
      "tags": ["react", "vite", "typescript", "frontend"],
      "category": "frontend"
    }
  ]
}
```

### Step 7: Upload to CDN

```bash
cd ../../registry
npm run upload:r2
```

### Step 8: Test Installation

```bash
# Test locally first
cd /tmp
slyxup init {template-name} test-app
cd test-app
npm install
npm run dev
```

---

## 🎨 Template Best Practices

### 1. **Clean Code**
- Use consistent formatting (Prettier)
- Add meaningful comments
- Follow framework conventions
- Use TypeScript for type safety

### 2. **Developer Experience**
- Include helpful README
- Add code examples
- Provide clear error messages
- Include useful scripts in package.json

### 3. **Performance**
- Minimal initial bundle size
- Lazy loading where appropriate
- Optimized images
- Tree-shakeable imports

### 4. **Accessibility**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader support

### 5. **Modern Standards**
- ES6+ features
- Modern CSS (Flexbox, Grid)
- Responsive design
- Dark mode support (optional)

---

## 📦 Example Templates

### React Template (Frontend)

```
react/v1.0.0/
├── src/
│   ├── main.tsx          # Entry point
│   ├── App.tsx           # Main component
│   ├── App.css           # Styles
│   └── index.css         # Global styles
├── public/
│   └── vite.svg          # Favicon
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── .gitignore
└── README.md
```

### Flask Template (Backend)

```
flask/v1.0.0/
├── app/
│   ├── __init__.py       # App factory
│   ├── routes.py         # API routes
│   └── models.py         # Database models
├── requirements.txt      # Python dependencies
├── .env.example          # Environment variables
├── .gitignore
├── README.md
└── run.py                # Entry point
```

### Next.js Template (Full-stack)

```
nextjs/v1.0.0/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
├── components/
├── public/
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## 🔒 Security Review Process

Before publishing a template:

### 1. **Dependency Audit**
```bash
npm audit
npm outdated
```

### 2. **Code Scan**
```bash
# Check for secrets
git secrets --scan

# Or use grep
grep -r "password\|secret\|key\|token" . | grep -v "node_modules"
```

### 3. **Manual Review**
- Check all configuration files
- Review build scripts
- Inspect package.json scripts
- Verify all external links
- Test in clean environment

### 4. **Automated Tests** (Optional but recommended)
```bash
npm test
npm run lint
npm run type-check
```

---

## 🚫 Common Security Issues

### ❌ Issue 1: Hardcoded Secrets
```javascript
// BAD
const API_KEY = "sk_live_abc123xyz"

// GOOD
const API_KEY = import.meta.env.VITE_API_KEY
```

### ❌ Issue 2: Dangerous HTML
```javascript
// BAD
<div dangerouslySetInnerHTML={{__html: userInput}} />

// GOOD
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

### ❌ Issue 3: Eval Usage
```javascript
// BAD
eval(userCode)

// GOOD
// Don't allow arbitrary code execution
```

### ❌ Issue 4: Insecure Dependencies
```json
// BAD - old version with vulnerabilities
{
  "dependencies": {
    "lodash": "4.17.20"
  }
}

// GOOD - updated version
{
  "dependencies": {
    "lodash": "^4.17.21"
  }
}
```

---

## 📝 Template Documentation

Every template should include a README.md:

```markdown
# {Template Name}

Brief description of the template.

## Features

- Feature 1
- Feature 2
- Feature 3

## What's Included

- Framework/Library versions
- Build tool
- Linting setup
- Type checking
- Pre-configured features

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── main.tsx
├── App.tsx
└── components/
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Customization

Instructions on how to customize the template.

## Learn More

- [Framework Docs](link)
- [Build Tool Docs](link)
```

---

## 🎯 Template Quality Metrics

Good templates should have:

- ✅ **Fast installation** (< 2 minutes)
- ✅ **Small package size** (< 10MB)
- ✅ **Clear documentation**
- ✅ **Working out of the box**
- ✅ **Modern dependencies**
- ✅ **No vulnerabilities**
- ✅ **Type safety**
- ✅ **Good DX**

---

## 📊 Template Lifecycle

1. **Create** - Build and test locally
2. **Audit** - Run security checks
3. **Package** - Create tar.gz with SHA-256
4. **Upload** - Push to CDN (R2)
5. **Register** - Add to registry.json
6. **Test** - Install via CLI
7. **Maintain** - Update dependencies regularly
8. **Deprecate** - Mark old versions as deprecated

---

## 🔄 Updating Templates

When creating a new version:

```bash
# Create new version directory
mkdir -p {template-name}/v1.1.0

# Copy files
cp -r {template-name}/v1.0.0/* {template-name}/v1.1.0/

# Make changes
cd {template-name}/v1.1.0
# Update files...

# Package new version
cd ../..
./scripts/package-{template-name}.sh

# Update registry with new version
# Upload to CDN
# Test installation
```

---

## 🆘 Need Help?

- Review existing templates in `templates/` directory
- Check security guidelines above
- Test locally before publishing
- Ask for code review if unsure

---

**Remember: Security and quality are top priorities!**
