# Install Missing Dependencies

Run this command to install all required dependencies for path alias resolution:

```bash
cd backend
npm install module-alias
npm install --save-dev tsconfig-paths tsc-alias ts-node
```

Or install everything at once:

```bash
cd backend
npm install
```

This will install:
- **module-alias** - Runtime path alias resolution for production
- **tsconfig-paths** - Path alias resolution for ts-node-dev
- **tsc-alias** - Replaces path aliases in compiled JavaScript
- **ts-node** - TypeScript execution engine

After installation, you can run:

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production
npm start
```

All path aliases (`@/...`) will work correctly! ✅
