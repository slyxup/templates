# SlyxUp Templates

Official templates for SlyxUp CLI.

## 📦 Available Templates

### React
- **Version**: 1.0.0
- **Stack**: React 18 + Vite + TypeScript
- **Location**: `templates/react/v1.0.0/`
- **Status**: ✅ Ready

### Vue
- **Version**: 1.0.0
- **Stack**: Vue 3 + Vite + TypeScript
- **Location**: `templates/vue/v1.0.0/`
- **Status**: ⏳ Coming soon

### Next.js
- **Version**: 1.0.0
- **Stack**: Next.js 14 + TypeScript
- **Location**: `templates/nextjs/v1.0.0/`
- **Status**: ⏳ Coming soon

## 🏗️ Template Structure

Each template follows this structure:

```
templates/
├── react/
│   └── v1.0.0/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       ├── public/
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── App.css
│           └── index.css
```

## 📝 Creating a New Template

1. Create version directory:
   ```bash
   mkdir -p templates/my-framework/v1.0.0
   ```

2. Add all template files

3. Package the template:
   ```bash
   cd templates/my-framework/v1.0.0
   tar -czf my-framework-1.0.0.tar.gz .
   ```

4. Generate SHA-256 hash:
   ```bash
   sha256sum my-framework-1.0.0.tar.gz
   # or on macOS:
   shasum -a 256 my-framework-1.0.0.tar.gz
   ```

5. Upload to CDN

6. Update registry.json with:
   - Download URL
   - SHA-256 hash
   - File size

## 🧪 Testing Templates

Test template extraction:

```bash
cd templates/react/v1.0.0
tar -tzf react-1.0.0.tar.gz  # List contents
tar -xzf react-1.0.0.tar.gz -C /tmp/test  # Test extraction
```

## 📄 License

MIT License
