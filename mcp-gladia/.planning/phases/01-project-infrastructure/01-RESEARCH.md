# Phase 1: Project Infrastructure - Research

**Researched:** 2026-02-07
**Domain:** TypeScript npm package development with MCP SDK
**Confidence:** HIGH

## Summary

Researched the technical requirements for setting up a publishable npm package that functions as an MCP server with CLI capabilities. The standard approach involves TypeScript with ESM-only configuration, using the official MCP SDK with stdio transport, and tsup for building with proper shebang injection.

Key findings indicate that the MCP ecosystem is ESM-first with strong TypeScript support. The @modelcontextprotocol/sdk v1.26.0 is stable and production-ready. Environment variable validation with Zod is essential for reliable server initialization. The stdio transport is the universal standard for MCP server connectivity.

**Primary recommendation:** Use ESM-only TypeScript with @modelcontextprotocol/sdk, tsup for building with shebang injection, and Zod for environment variable validation.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | 1.26.0 | MCP server implementation | Official SDK, 23k+ projects, stable v1.x for production |
| typescript | 5.3+ | Type safety | Required by MCP SDK, latest language features |
| zod | 3.25+ | Schema validation | Peer dependency for MCP SDK, environment validation |
| tsup | 8.0+ | Build tool | Fast bundler, ESM-first, banner injection for shebangs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tsx | 4.6+ | TypeScript execution | Development server, faster than ts-node |
| @types/node | 20.10+ | Node.js types | TypeScript definitions for Node.js APIs |
| vitest | 1.3+ | Testing | Native ESM/TS support, faster than Jest |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @modelcontextprotocol/sdk | FastMCP | Official SDK more stable, better documented |
| tsup | rollup, webpack | tsup simpler, designed for libraries |
| tsx | ts-node | tsx significantly faster |

**Installation:**
```bash
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsup tsx vitest
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── index.ts         # CLI entry point with shebang
├── server.ts        # MCP server implementation
├── config/          # Environment variable validation
├── tools/           # MCP tool implementations
└── types/           # TypeScript type definitions
```

### Pattern 1: MCP Server with Stdio Transport
**What:** Standard MCP server initialization with stdio transport
**When to use:** All MCP servers for desktop LLM clients
**Example:**
```typescript
// Source: Official MCP SDK docs
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server({ name: "mcp-gladia", version: "1.0.0" }, { capabilities: {} });

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server started on stdio");
}

main().catch(console.error);
```

### Pattern 2: Environment Variable Validation with Zod
**What:** Type-safe environment variable parsing at startup
**When to use:** Always for production MCP servers
**Example:**
```typescript
// Source: Zod environment validation best practices
import { z } from "zod";

const envSchema = z.object({
  GLADIA_API_KEY: z.string().min(1, "GLADIA_API_KEY is required"),
  NODE_ENV: z.enum(["development", "production"]).default("production"),
});

export const env = envSchema.parse(process.env);
```

### Pattern 3: CLI Entry Point with Shebang
**What:** Proper npm binary setup for npx execution
**When to use:** All published CLI tools
**Example:**
```typescript
#!/usr/bin/env node
// Source: npm CLI best practices
import "./server.js";
```

### Anti-Patterns to Avoid
- **console.log in stdio transport:** Use console.error for logging, stdout is reserved for MCP protocol
- **Missing environment validation:** Runtime failures are harder to debug than startup validation errors
- **Relative imports without extensions:** ESM requires explicit .js extensions in imports

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Environment validation | Custom env parsing | Zod schema validation | Type safety, clear errors, validation rules |
| MCP protocol implementation | Custom JSON-RPC | @modelcontextprotocol/sdk | Official implementation, handles edge cases |
| TypeScript compilation | Custom build scripts | tsup with configuration | Handles shebang injection, ESM output, declarations |
| CLI argument parsing | String manipulation | commander.js or yargs | Proper help text, type validation, error handling |

**Key insight:** MCP protocol complexity and TypeScript ESM configuration have many edge cases that official tools handle correctly.

## Common Pitfalls

### Pitfall 1: Missing Shebang in Built CLI
**What goes wrong:** npm binary doesn't execute, "Permission denied" errors
**Why it happens:** TypeScript compilation strips shebangs, tsup doesn't add them by default
**How to avoid:** Use tsup banner configuration or chmod +x in build script
**Warning signs:** `npx package-name` fails with permission errors

### Pitfall 2: stdout Pollution in Stdio Transport
**What goes wrong:** MCP client receives malformed JSON, connection fails
**Why it happens:** console.log, print statements write to stdout which carries MCP protocol
**How to avoid:** Use console.error for all logging, stderr is safe for MCP stdio
**Warning signs:** "Invalid JSON" errors in MCP client logs

### Pitfall 3: ESM Import Path Extensions
**What goes wrong:** "Module not found" errors in production
**Why it happens:** TypeScript allows extensionless imports but ESM runtime requires .js extensions
**How to avoid:** Always use .js extensions in import paths, even for .ts files
**Warning signs:** Works in development with tsx but fails in built package

### Pitfall 4: Missing Environment Variable Validation
**What goes wrong:** Cryptic runtime errors when API key is invalid or missing
**Why it happens:** process.env values are always strings, need validation and typing
**How to avoid:** Validate env vars with Zod schema at startup
**Warning signs:** Server starts but API calls fail with authentication errors

### Pitfall 5: Incorrect package.json Type Configuration
**What goes wrong:** "require() of ES modules is not supported" errors
**Why it happens:** Missing "type": "module" field causes Node to treat files as CommonJS
**How to avoid:** Set "type": "module" in package.json for ESM-only packages
**Warning signs:** Import/export syntax errors in published package

## Code Examples

Verified patterns from official sources:

### MCP Server Initialization
```typescript
// Source: Official MCP SDK documentation
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "mcp-gladia", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Add tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // Tool implementation
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP server started on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
```

### Environment Configuration
```typescript
// Source: Zod environment validation patterns
import { z } from "zod";

const envSchema = z.object({
  GLADIA_API_KEY: z.string().min(1, "GLADIA_API_KEY is required"),
  NODE_ENV: z.enum(["development", "production"]).default("production"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export const env = envSchema.parse(process.env);
export type Environment = z.infer<typeof envSchema>;
```

### tsup Configuration for CLI
```typescript
// Source: tsup CLI configuration best practices
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "node18",
  banner: {
    js: "#!/usr/bin/env node"
  }
});
```

### package.json for npm CLI
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
    "test": "vitest"
  },
  "engines": {
    "node": ">=18"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CommonJS modules | ESM-only packages | 2024-2025 | Simpler config, better tree-shaking |
| ts-node for development | tsx for execution | 2023-2024 | 10x faster TypeScript execution |
| Jest for testing | Vitest for testing | 2024-2025 | Native ESM support, faster |
| Manual shebang handling | tsup banner injection | 2023-2024 | Automatic executable permissions |
| Manual env parsing | Zod schema validation | 2022-2024 | Type safety, better errors |

**Deprecated/outdated:**
- ts-node: replaced by tsx for significantly better performance
- Manual environment parsing: Zod provides type safety and validation
- CJS/ESM dual publishing: ESM-only simplifies configuration

## Open Questions

Things that couldn't be fully resolved:

1. **MCP SDK v2 Migration Timeline**
   - What we know: v2 is in pre-alpha, stable release Q1 2026
   - What's unclear: Breaking changes from v1 to v2
   - Recommendation: Stay with v1.26.0 for Phase 1, plan migration after v2 stable

2. **Environment Variable Security**
   - What we know: GLADIA_API_KEY should be validated
   - What's unclear: Additional security measures needed
   - Recommendation: Validate format but don't implement additional security in v1

## Sources

### Primary (HIGH confidence)
- Official MCP SDK docs - https://modelcontextprotocol.io/docs/develop/build-server
- @modelcontextprotocol/sdk npm package - v1.26.0 current
- TypeScript ESM tutorial - https://2ality.com/2025/02/typescript-esm-packages.html

### Secondary (MEDIUM confidence)
- MCP server examples - https://github.com/bsmi021/mcp-npm_docs-server
- Zod environment validation - Multiple blog posts from 2024-2025
- tsup banner configuration - GitHub issues and examples

### Tertiary (LOW confidence)
- npm package publishing best practices - General web search results
- CLI tool development patterns - Community discussions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDK and established TypeScript tooling
- Architecture: HIGH - Well-documented MCP patterns and TypeScript best practices
- Pitfalls: MEDIUM - Based on community experience and documentation gaps

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable ecosystem)