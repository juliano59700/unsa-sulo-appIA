# Technology Stack

**Project:** MCP server for Gladia.io API
**Researched:** 2025-02-07

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @modelcontextprotocol/sdk | 1.26.0 | MCP server implementation | Official TypeScript SDK, actively maintained, 23k+ projects using it |
| zod | 3.25+ | Schema validation | Required peer dependency for MCP SDK, maintains compatibility with v4 |
| typescript | 5.3+ | Type safety | Required for MCP SDK, provides robust development experience |

### Build & Development Tools
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| tsup | 8.0+ | Build tool | Fast TypeScript bundler, simple dual ESM/CJS output |
| tsx | 4.6+ | TypeScript executor | Fast TS execution for development, replacement for ts-node |
| @types/node | 20.10+ | Node.js types | TypeScript definitions for Node.js APIs |

### Code Quality & Linting
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| eslint | 9.0+ | Linting engine | Flat config support, best-in-class static analysis |
| @typescript-eslint/parser | 7.0+ | TypeScript parsing | Official parser for ESLint + TypeScript |
| @typescript-eslint/eslint-plugin | 7.0+ | TypeScript rules | TypeScript-specific lint rules |
| prettier | 3.2+ | Code formatting | Consistent formatting, industry standard |
| eslint-config-prettier | 9.1+ | ESLint integration | Prevents ESLint/Prettier conflicts |

### Testing Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| vitest | 1.3+ | Test runner | Modern, fast, native ESM/TS support, better than Jest for 2025 |
| @vitest/coverage-v8 | 1.3+ | Coverage reporting | V8 coverage provider for accurate metrics |

### Development Workflow
| Technology | Version | Purpose | When to Use |
|------------|---------|---------|-------------|
| husky | 9.0+ | Git hooks | Pre-commit quality checks |
| lint-staged | 15.2+ | Staged file processing | Run linters only on changed files |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| SDK | @modelcontextprotocol/sdk | FastMCP | Official SDK is more stable, better documented |
| Build Tool | tsup | rollup, webpack | tsup is simpler, designed for libraries |
| Test Runner | vitest | jest | Vitest has better ESM/TS support, faster |
| TypeScript Runner | tsx | ts-node | tsx is significantly faster |

## Package.json Configuration

```json
{
  "name": "mcp-gladia",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "bin": {
    "mcp-gladia": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "prepare": "husky install"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitest/coverage-v8": "^1.3.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.1.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.0",
    "tsup": "^8.0.0",
    "tsx": "^4.6.0",
    "typescript": "^5.3.0",
    "vitest": "^1.3.0"
  }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16", 
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Build Configuration (tsup.config.ts)

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node18',
  banner: {
    js: '#!/usr/bin/env node'
  }
})
```

## Installation

```bash
# Core dependencies
npm install @modelcontextprotocol/sdk zod

# Dev dependencies  
npm install -D typescript @types/node tsup tsx
npm install -D vitest @vitest/coverage-v8
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier
npm install -D husky lint-staged
```

## Key Design Decisions

### ESM-Only Strategy
- **Why:** MCP ecosystem is ESM-first, simpler configuration
- **Confidence:** HIGH - Official MCP examples use ESM-only

### tsup Over Other Bundlers
- **Why:** Designed for TypeScript libraries, handles dual publishing well
- **Confidence:** HIGH - Widely adopted in TypeScript library ecosystem

### Vitest Over Jest
- **Why:** Native ESM support, faster, better TypeScript integration
- **Confidence:** MEDIUM - Jest still more popular but Vitest momentum strong

### Version Strategy
- **MCP SDK:** Use ^1.26.0, stable v1.x branch recommended for production
- **TypeScript:** 5.3+ for latest language features
- **Node:** Target 18+ (MCP requirement)

## Deployment Considerations

### npm Publishing
- Include only `dist/` folder in published package
- Ensure shebang in index.js for CLI execution  
- Use exact version for prettier, semver ranges for others

### Environment Variables
- GLADIA_API_KEY via environment variable
- No configuration files needed for simple API wrapper

## Sources

- [@modelcontextprotocol/sdk on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - v1.26.0 (HIGH confidence)
- [Official MCP Build Server Docs](https://modelcontextprotocol.io/docs/develop/build-server) (HIGH confidence)  
- [TypeScript SDK on GitHub](https://github.com/modelcontextprotocol/typescript-sdk) (HIGH confidence)
- [2025 TypeScript tooling best practices](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb) (MEDIUM confidence)
- [Node.js 2025 Guide: TypeScript, ESLint, Prettier](https://medium.com/@gabrieldrouin/node-js-2025-guide-how-to-setup-express-js-with-typescript-eslint-and-prettier-b342cd21c30d) (MEDIUM confidence)