# TypeScript Path Alias Setup - Fixed ✅

## Problem Solved

The backend now properly resolves TypeScript path aliases (`@/...`) in both **development** and **production** environments.

---

## Solution Overview

We use a combination of tools to handle path aliases:

1. **Development**: `tsconfig-paths` with `ts-node-dev`
2. **Production**: `tsc-alias` for build + `module-alias` for runtime
3. **TypeScript**: Proper `tsconfig.json` configuration

---

## Configuration Files

### 1. tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    // ... other options
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  }
}
```

**Key Points:**
- `baseUrl: "./"` - Relative to project root
- `paths: { "@/*": ["src/*"] }` - Maps `@/` to `src/`
- `moduleResolution: "node"` - Standard Node.js resolution
- `ts-node.require` - Auto-loads tsconfig-paths for ts-node

### 2. package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only --exit-child -r tsconfig-paths/register src/server.ts",
    "build": "tsc --project tsconfig.json && tsc-alias",
    "start": "node dist/server.js"
  },
  "_moduleAliases": {
    "@": "dist"
  },
  "dependencies": {
    "module-alias": "^2.2.3",
    // ... other deps
  },
  "devDependencies": {
    "tsconfig-paths": "^4.2.0",
    "tsc-alias": "^1.8.10",
    // ... other deps
  }
}
```

**Key Points:**
- `dev` script: Uses `-r tsconfig-paths/register` flag
- `build` script: Runs `tsc` then `tsc-alias` to replace aliases
- `_moduleAliases`: Maps `@` to `dist` folder for production
- `module-alias`: Runtime alias resolution for production

### 3. server.ts

```typescript
import 'module-alias/register'; // MUST be first import
import http from 'http';
import { createApp } from './app';
// ... rest of imports
```

**Key Point:**
- `import 'module-alias/register'` MUST be the very first line
- This registers aliases for production runtime

---

## How It Works

### Development Mode (`npm run dev`)

1. `ts-node-dev` starts with `-r tsconfig-paths/register` flag
2. `tsconfig-paths` reads `tsconfig.json` paths
3. Aliases are resolved at runtime
4. Hot reload works perfectly

**Example:**
```typescript
import { config } from '@/config/env'; // ✅ Works
import { prisma } from '@/lib/prisma'; // ✅ Works
```

### Production Build (`npm run build`)

1. `tsc` compiles TypeScript to JavaScript
2. `tsc-alias` replaces all `@/` imports with relative paths
3. Output in `dist/` folder has proper relative imports

**Before tsc-alias:**
```javascript
const config = require('@/config/env');
```

**After tsc-alias:**
```javascript
const config = require('./config/env');
```

### Production Runtime (`npm start`)

1. `module-alias/register` is imported first in `server.ts`
2. It reads `_moduleAliases` from `package.json`
3. Maps `@` to `dist` folder
4. Node.js resolves imports correctly

---

## Installation

```bash
cd backend

# Install dependencies
npm install

# Install new packages
npm install module-alias
npm install --save-dev tsconfig-paths tsc-alias
```

---

## Usage Examples

### Import from config
```typescript
import { config } from '@/config/env';
import { REDIS_KEYS } from '@/config/constants';
```

### Import from lib
```typescript
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import logger from '@/lib/logger';
```

### Import from services
```typescript
import { jwtService } from '@/services/jwt.service';
import { twilioService } from '@/services/twilio.service';
```

### Import from modules
```typescript
import { authService } from '@/modules/auth/auth.service';
import { chatService } from '@/modules/chats/chats.service';
```

### Import from utils
```typescript
import { AppError } from '@/utils/errors';
import { successResponse } from '@/utils/response';
import { asyncHandler } from '@/utils/asyncHandler';
```

### Import from middleware
```typescript
import { authenticate } from '@/middleware/authenticate';
import { validate } from '@/middleware/validator';
```

### Import from types
```typescript
import type { User } from '@/types/index';
```

---

## Testing

### Test Development Mode
```bash
npm run dev
```

Should start without errors. Check logs for:
```
✓ PostgreSQL connected
✓ Redis connected
✓ Socket.IO initialized
🚀 Hey Backend Server Running
```

### Test Production Build
```bash
npm run build
```

Should compile successfully. Check `dist/` folder for compiled files.

### Test Production Runtime
```bash
npm start
```

Should start without module resolution errors.

---

## Troubleshooting

### Error: Cannot find module '@/config/env'

**Solution:**
1. Check `tsconfig.json` has correct `baseUrl` and `paths`
2. Ensure `tsconfig-paths` is installed
3. Verify dev script has `-r tsconfig-paths/register` flag

### Error in Production: Cannot find module '@/...'

**Solution:**
1. Ensure `module-alias` is in `dependencies` (not devDependencies)
2. Check `_moduleAliases` in `package.json`
3. Verify `import 'module-alias/register'` is first line in `server.ts`
4. Run `npm run build` to regenerate dist folder

### Build Error: Aliases not replaced

**Solution:**
1. Ensure `tsc-alias` is installed
2. Check build script: `tsc && tsc-alias`
3. Verify `tsconfig.json` has correct paths

### TypeScript Errors in IDE

**Solution:**
1. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Check `tsconfig.json` is in project root
3. Ensure `baseUrl` is `"./"` not `"."`

---

## Benefits

✅ **Clean Imports**: No more `../../../config/env`  
✅ **Maintainable**: Easy to refactor and move files  
✅ **Scalable**: Works with any project size  
✅ **IDE Support**: Full autocomplete and IntelliSense  
✅ **Production Ready**: Works in compiled JavaScript  
✅ **Hot Reload**: Works with ts-node-dev  

---

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts           ← import from '@/config/env'
│   │   └── constants.ts     ← import from '@/config/constants'
│   ├── lib/
│   │   ├── prisma.ts        ← import from '@/lib/prisma'
│   │   ├── redis.ts         ← import from '@/lib/redis'
│   │   └── logger.ts        ← import from '@/lib/logger'
│   ├── services/
│   │   ├── jwt.service.ts   ← import from '@/services/jwt.service'
│   │   └── twilio.service.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   └── chats/
│   ├── middleware/
│   ├── utils/
│   ├── types/
│   └── server.ts
├── tsconfig.json            ← Path alias configuration
├── package.json             ← Scripts and module aliases
└── PATH_ALIAS_SETUP.md      ← This file
```

---

## Alternative: Relative Imports

If you prefer relative imports, you can still use them:

```typescript
// Path alias (recommended)
import { config } from '@/config/env';

// Relative import (also works)
import { config } from '../config/env';
```

Both work, but path aliases are cleaner and more maintainable.

---

## Summary

The path alias setup is now **fully functional** for:

- ✅ Development with hot reload
- ✅ Production builds
- ✅ Production runtime
- ✅ TypeScript compilation
- ✅ IDE autocomplete
- ✅ All import scenarios

**No more module resolution errors!** 🎉
