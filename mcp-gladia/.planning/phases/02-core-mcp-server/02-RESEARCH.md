# Phase 2: Core MCP Server - Research

**Researched:** 2026-02-07
**Domain:** MCP Protocol Implementation
**Confidence:** HIGH

## Summary

Research focused on Model Context Protocol (MCP) server implementation patterns using the TypeScript SDK v1.26.0. MCP servers expose tools to LLM clients through a JSON-RPC 2.0 protocol, requiring proper tool registration, capabilities declaration, and error handling.

The standard approach uses `setRequestHandler` with `ListToolsRequestSchema` and `CallToolRequestSchema` to implement the core protocol. Key requirements include declaring `tools: {}` capabilities, handling empty tool arrays for foundation servers, implementing graceful error patterns, and maintaining stable stdio transport connections.

**Primary recommendation:** Use established `setRequestHandler` patterns with proper error boundaries and protocol compliance validation.

## Standard Stack

The established libraries/tools for MCP server development:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.26.0 | MCP protocol implementation | Official TypeScript SDK, stable v1.x recommended until Q1 2026 |
| zod | ^3.22.0 | Schema validation | Required for input validation, MCP SDK dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mcp-testing/server-tester | latest | MCP testing framework | Protocol compliance validation |
| MCP Inspector | latest | Visual testing tool | Manual testing and debugging |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| stdio transport | HTTP/SSE transport | stdio simpler for local, HTTP better for distributed |
| v1.26.0 SDK | v2 SDK (Q1 2026) | v1.x stable, v2 breaking changes expected |

**Installation:**
```bash
npm install @modelcontextprotocol/sdk@^1.26.0 zod@^3.22.0
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── server.ts           # Main server with capabilities and handlers
├── tools/             # Tool implementations (Phase 3+)
├── config/            # Environment and configuration
└── index.ts           # CLI entry point
```

### Pattern 1: Server Initialization with Capabilities
**What:** Create Server instance with tool capabilities declared
**When to use:** Foundation for all MCP servers
**Example:**
```typescript
// Source: Official MCP docs + verified examples
import { Server } from '@modelcontextprotocol/sdk/server/index.js'

export const server = new Server({
  name: 'mcp-gladia',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {
      listChanged: true  // Optional: notify clients of tool changes
    }
  }
})
```

### Pattern 2: List Tools Request Handler
**What:** Handle tools/list requests to expose available tools
**When to use:** Required for all MCP servers, even with empty tool array
**Example:**
```typescript
// Source: MCP TypeScript SDK documentation
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [] // Empty for Phase 2, populated in later phases
  }
})
```

### Pattern 3: Call Tool Request Handler
**What:** Handle tools/call requests to execute tool invocations
**When to use:** Required for protocol compliance, even with no tools
**Example:**
```typescript
// Source: MCP TypeScript SDK documentation  
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    isError: true,
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }]
  }
})
```

### Pattern 4: Connection and Transport Setup
**What:** Establish stdio transport with proper error handling
**When to use:** Required for stdio-based MCP servers
**Example:**
```typescript
// Source: MCP TypeScript SDK documentation
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

export async function main() {
  try {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('MCP server running on stdio') // Use stderr for logs
  } catch (error) {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  }
}
```

### Anti-Patterns to Avoid
- **Writing to stdout:** Protocol corruption - all logs must go to stderr
- **Missing tool handlers:** Protocol violation - always implement both list and call handlers
- **Unhandled errors:** Connection instability - wrap all operations in try-catch

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-RPC protocol | Custom message format | MCP SDK handlers | Complex protocol details, error codes, validation |
| Input validation | Manual checks | Zod schemas | Type safety, runtime validation, error messages |
| Transport management | Custom stdio handling | StdioServerTransport | Connection lifecycle, error recovery |
| Tool registration | Tool arrays | setRequestHandler pattern | Protocol compliance, type safety |

**Key insight:** MCP protocol has many edge cases and the SDK handles protocol-level concerns that are error-prone to implement manually.

## Common Pitfalls

### Pitfall 1: Stdout Corruption
**What goes wrong:** Writing logs or debug output to stdout breaks protocol communication
**Why it happens:** Stdio transport uses stdout exclusively for JSON-RPC messages
**How to avoid:** Always use `console.error()` or stderr for any logging
**Warning signs:** "Parse error" or "Invalid JSON" from MCP clients

### Pitfall 2: Missing Request Handlers
**What goes wrong:** Server fails protocol compliance checks and clients can't connect
**Why it happens:** Assuming optional handlers for servers with no tools
**How to avoid:** Always implement both `ListToolsRequestSchema` and `CallToolRequestSchema` handlers
**Warning signs:** "Method not found" errors from MCP Inspector

### Pitfall 3: Unhandled Promise Rejections
**What goes wrong:** Server process crashes on unexpected errors
**Why it happens:** Async handlers without proper error boundaries
**How to avoid:** Wrap all request handlers in try-catch and return error responses
**Warning signs:** Process exits, connection drops during operation

### Pitfall 4: Capability Mismatch
**What goes wrong:** Clients expect tools but server declares no capability
**Why it happens:** Missing or incorrect capabilities declaration in Server constructor
**How to avoid:** Always declare `capabilities: { tools: {} }` even for empty tool servers
**Warning signs:** Tools not discoverable by clients

## Code Examples

Verified patterns from official sources:

### Complete Server Setup
```typescript
// Source: MCP TypeScript SDK official documentation
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'

const server = new Server({
  name: 'mcp-gladia',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

// Handle list_tools requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: []
  }
})

// Handle call_tool requests  
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return {
    isError: true,
    content: [{
      type: "text", 
      text: `Unknown tool: ${request.params.name}`
    }]
  }
})

// Start server
async function main() {
  try {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('MCP server connected via stdio')
  } catch (error) {
    console.error('Server startup failed:', error)
    process.exit(1)
  }
}
```

### Error Handling Pattern
```typescript
// Source: MCP official documentation and community best practices
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Tool execution logic here (Phase 3+)
    
    // For Phase 2: no tools implemented
    throw new Error(`Tool not found: ${request.params.name}`)
    
  } catch (error) {
    return {
      isError: true,
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }]
    }
  }
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom JSON-RPC | MCP SDK handlers | Nov 2024 | Standardized protocol, better tooling |
| String-based handlers | Schema-based handlers | v1.20+ | Type safety, runtime validation |
| SSE transport | Stdio/HTTP transport | Dec 2024 | SSE deprecated, simpler transports |

**Deprecated/outdated:**
- Server-Sent Events (SSE) transport: deprecated, use stdio or HTTP
- v2 SDK preview: unstable until Q1 2026, stick with v1.26.0

## Open Questions

Things that couldn't be fully resolved:

1. **Connection Heartbeat/Keepalive**
   - What we know: MCP uses JSON-RPC 2.0 with timeout handling
   - What's unclear: Specific keepalive patterns for long-running connections
   - Recommendation: Implement basic timeout handling, monitor for disconnections

2. **Tool Discovery Notifications**
   - What we know: `listChanged: true` capability exists
   - What's unclear: When and how to notify clients of tool changes
   - Recommendation: Enable capability for future phases, don't implement notifications yet

## Sources

### Primary (HIGH confidence)
- MCP Official Documentation - https://modelcontextprotocol.io/docs/concepts/tools - Tool concepts and patterns
- MCP TypeScript SDK GitHub - https://github.com/modelcontextprotocol/typescript-sdk - Implementation patterns
- MCP SDK NPM page - https://www.npmjs.com/package/@modelcontextprotocol/sdk - Version info and usage

### Secondary (MEDIUM confidence)
- DEV.to MCP tutorial - https://dev.to/shadid12/how-to-build-mcp-servers-with-typescript-sdk-1c28 - Code examples verified against official docs
- MCP Inspector documentation - https://modelcontextprotocol.io/docs/tools/inspector - Testing and validation patterns

### Tertiary (LOW confidence)
- Community blog posts about MCP implementation patterns - marked for validation during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDK documentation and established patterns
- Architecture: HIGH - Verified examples from official sources and active community usage  
- Pitfalls: HIGH - Well-documented common issues with verified solutions

**Research date:** 2026-02-07
**Valid until:** March 7, 2026 (30 days - MCP v1.x stable, v2 expected Q1 2026)