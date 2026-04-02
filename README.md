# SlyxUp Templates

Official templates for SlyxUp CLI.

## 📦 Folder Structure

```
templates/
├── projects/           # Project templates (starter projects)
│   └── react/
│       └── v1.0.0/
│           ├── manifest.json
│           ├── package.json
│           └── ...
├── features/           # Feature templates (add-on packages)
│   ├── tailwind/
│   │   └── v1.0.0/
│   │       ├── manifest.json     # Registry metadata
│   │       ├── feature.json      # Feature installation config
│   │       └── files/            # Files to copy/modify
│   └── ...
├── packaged/           # Packaged tar.gz archives
│   ├── react-1.0.0.tar.gz
│   └── tailwind-1.0.0.tar.gz
└── scripts/           # Build and packaging scripts
```

## 📦 Available Projects

### React
- **Version**: 1.0.0
- **Stack**: React 18 + Vite + TypeScript
- **Location**: `projects/react/v1.0.0/`
- **Status**: ✅ Ready

### Vue, Next.js, Express, Discord
- **Status**: ⏳ Coming soon

## 🧩 Available Features

| Feature | Version | Category | Frameworks |
|---------|---------|----------|------------|
| tailwind | 1.0.0 | styling | react, vue, next, nuxt, svelte... |
| eslint | 1.0.0 | tooling | * (all) |
| prettier | 1.0.0 | tooling | * (all) |
| zod | 1.0.0 | validation | * (all) |
| prisma | 1.0.0 | database | next, express, fastify... |
| drizzle | 1.0.0 | database | next, express, fastify... |
| zustand | 1.0.0 | state | react, next |
| react-query | 1.0.0 | data | react, next |
| trpc | 1.0.0 | api | next, express, fastify |
| docker | 1.0.0 | devops | * (all) |
| ... | | | |

## 📄 License

MIT License
