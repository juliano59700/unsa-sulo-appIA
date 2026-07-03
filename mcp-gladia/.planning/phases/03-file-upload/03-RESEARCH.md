# Phase 3: File Upload & Basic API - Research

**Researched:** 2026-02-07
**Domain:** Audio/video file upload with Gladia API integration
**Confidence:** HIGH

## Summary

Research focused on implementing file upload functionality to Gladia's API using Node.js native capabilities and MCP SDK patterns. The standard approach uses Node.js 18+ native `fetch` with `FormData` for multipart uploads, avoiding external HTTP libraries. File validation should combine size checks (before reading), extension validation, and optionally magic number detection for security.

Gladia provides a straightforward upload API at `/v2/upload` accepting multipart/form-data with generous limits (1GB file size, 135 minutes duration). The MCP SDK uses Zod schemas for tool registration with clear patterns for input validation and error handling.

**Primary recommendation:** Build a shared Gladia API client module with file validation, then expose a single MCP tool for file uploads using the native Node.js stack.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native fetch | Node.js 18+ | HTTP requests | Built-in, no external deps, supports FormData |
| Native fs/promises | Node.js 18+ | File operations | Built-in async file reading with proper error handling |
| @modelcontextprotocol/sdk | ^1.26.0 | MCP server framework | Official MCP TypeScript SDK |
| zod | ^3.22.0 | Schema validation | Required by MCP SDK for input validation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| path | Built-in | File path manipulation | Extension extraction and validation |
| file-type | Optional | Magic number detection | Enhanced security validation if needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native fetch | axios/node-fetch | External dependency vs built-in capability |
| fs/promises | fs callbacks | Promise-based vs callback-based API |

**Installation:**
```bash
# No additional packages needed - using Node.js built-ins
# Zod and MCP SDK already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── tools/           # MCP tool implementations
│   └── upload.ts    # File upload tool
├── lib/             # Shared modules
│   └── gladia.ts    # Gladia API client
└── types/           # Type definitions
    └── gladia.ts    # API response types
```

### Pattern 1: Shared Gladia API Client
**What:** Centralized HTTP client for all Gladia API interactions
**When to use:** For consistent auth, error handling, and base URL management
**Example:**
```typescript
// src/lib/gladia.ts
// Source: Gladia API documentation + Node.js fetch patterns
export class GladiaClient {
  private readonly baseURL = 'https://api.gladia.io';
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async uploadFile(filePath: string): Promise<GladiaUploadResponse> {
    const fileBuffer = await readFile(filePath);
    const blob = new Blob([fileBuffer]);
    const formData = new FormData();
    formData.set('audio', blob, path.basename(filePath));

    const response = await fetch(`${this.baseURL}/v2/upload`, {
      method: 'POST',
      headers: {
        'x-gladia-key': this.apiKey,
        // DO NOT set Content-Type - let fetch set boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}
```

### Pattern 2: MCP Tool Registration with File Validation
**What:** Tool registration with comprehensive input validation
**When to use:** For all file upload tools requiring validation
**Example:**
```typescript
// src/tools/upload.ts
// Source: MCP SDK documentation
import { z } from 'zod';

const uploadSchema = z.object({
  filePath: z.string().min(1).describe('Path to the audio or video file to upload'),
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'upload_file',
        description: 'Upload an audio or video file to Gladia for transcription',
        inputSchema: {
          type: 'object',
          properties: {
            filePath: {
              type: 'string',
              description: 'Path to the audio or video file to upload',
            },
          },
          required: ['filePath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'upload_file') {
    const { filePath } = uploadSchema.parse(request.params.arguments);
    
    try {
      // Validate file before upload
      await validateFile(filePath);
      const result = await gladiaClient.uploadFile(filePath);
      
      return {
        content: [
          {
            type: 'text',
            text: `File uploaded successfully. URL: ${result.audio_url}`,
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Upload failed: ${error.message}`,
          },
        ],
      };
    }
  }
});
```

### Pattern 3: File Validation Pipeline
**What:** Multi-step file validation before upload
**When to use:** For all file operations requiring security and limits
**Example:**
```typescript
// Source: Node.js fs documentation + file validation patterns
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi', '.flac'];
const MAX_FILE_SIZE = 1000 * 1024 * 1024; // 1GB in bytes

async function validateFile(filePath: string): Promise<void> {
  // Check if file exists and get stats
  const stats = await stat(filePath).catch(() => {
    throw new Error(`File not found: ${filePath}`);
  });

  if (stats.isDirectory()) {
    throw new Error(`Path is a directory, not a file: ${filePath}`);
  }

  // Check file size
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase();
  if (!SUPPORTED_FORMATS.includes(ext)) {
    throw new Error(`Unsupported format: ${ext}. Supported: ${SUPPORTED_FORMATS.join(', ')}`);
  }
}
```

### Anti-Patterns to Avoid
- **Setting Content-Type manually:** Let FormData set the boundary automatically
- **Reading large files into memory:** Use stat() to check size first
- **Extension-only validation:** Combine with magic number checks for security
- **Blocking synchronous file operations:** Use fs/promises for async operations

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP multipart uploads | Custom FormData encoding | Native FormData + fetch | Handles boundary generation, encoding automatically |
| File extension validation | String manipulation | path.extname() | Handles edge cases, cross-platform paths |
| File size checking | Manual file reading | fs.stat() | Avoids loading large files into memory |
| MIME type detection | Extension mapping | file-type package | Detects actual file type from magic numbers |
| API error handling | Generic error catching | Status code specific handling | Provides actionable error messages |

**Key insight:** File upload involves many edge cases (CORS, boundaries, encoding) that native APIs handle correctly.

## Common Pitfalls

### Pitfall 1: Manual Content-Type Header
**What goes wrong:** Setting `'Content-Type': 'multipart/form-data'` manually causes empty request body
**Why it happens:** Missing boundary parameter that FormData auto-generates
**How to avoid:** Never set Content-Type when using FormData - let fetch handle it
**Warning signs:** Upload fails with empty body or boundary errors

### Pitfall 2: Loading Large Files into Memory
**What goes wrong:** Using readFile() without size validation causes OOM errors
**Why it happens:** Attempting to load 1GB+ files entirely into Node.js heap
**How to avoid:** Use fs.stat() to check size before readFile()
**Warning signs:** Memory usage spikes, process crashes on large files

### Pitfall 3: Extension-Only File Validation
**What goes wrong:** Users can upload malicious files by changing extensions
**Why it happens:** Only checking filename, not actual file content
**How to avoid:** Combine extension checks with magic number validation
**Warning signs:** Security vulnerabilities, unexpected file types processed

### Pitfall 4: Undici CRLF Compatibility Issue
**What goes wrong:** Some servers reject multipart requests from Node.js fetch
**Why it happens:** Node.js undici doesn't add trailing CRLF that some servers expect
**How to avoid:** Use latest Node.js version (23.6.0+) or upgrade undici
**Warning signs:** 400/422 errors from servers that worked with other HTTP clients

### Pitfall 5: Path Traversal in File Paths
**What goes wrong:** Accepting user file paths without validation allows directory traversal
**Why it happens:** Not sanitizing paths with '../' sequences
**How to avoid:** Validate paths are within expected directories, use path.resolve()
**Warning signs:** Security audit failures, access to unintended files

## Code Examples

Verified patterns from official sources:

### File Upload with Native fetch
```typescript
// Source: Node.js documentation + Gladia API docs
import { readFile } from 'node:fs/promises';

async function uploadToGladia(filePath: string, apiKey: string) {
  const fileBuffer = await readFile(filePath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.set('audio', blob, path.basename(filePath));

  const response = await fetch('https://api.gladia.io/v2/upload', {
    method: 'POST',
    headers: {
      'x-gladia-key': apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gladia API error: ${response.status} ${errorText}`);
  }

  return await response.json();
}
```

### MCP Tool with Error Handling
```typescript
// Source: MCP SDK documentation
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== 'upload_file') {
    return {
      isError: true,
      content: [{ type: 'text', text: `Unknown tool: ${request.params.name}` }],
    };
  }

  try {
    const args = request.params.arguments;
    if (!args || typeof args !== 'object' || !('filePath' in args)) {
      throw new Error('Missing required parameter: filePath');
    }

    const result = await handleFileUpload(args.filePath);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      ],
    };
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| node-fetch + form-data | Native fetch + FormData | Node.js 18.0 (2022) | Remove external dependencies |
| Callbacks (fs) | fs/promises | Node.js 10.0 (2018) | Cleaner async code |
| Manual multipart encoding | FormData auto-encoding | Always available | Fewer encoding bugs |
| Zod v3 | Zod v4 | MCP SDK v2 (Q1 2026) | Better TypeScript integration |

**Deprecated/outdated:**
- node-fetch: Native fetch covers all use cases in Node.js 18+
- form-data package: Native FormData handles multipart uploads
- fs callback API: fs/promises is the modern standard

## Open Questions

Things that couldn't be fully resolved:

1. **File magic number validation priority**
   - What we know: file-type package provides magic number detection
   - What's unclear: Whether it's worth the dependency for this use case
   - Recommendation: Start with extension validation, add magic numbers if security requirements demand it

2. **Optimal error message granularity**
   - What we know: Gladia returns HTTP status codes and error messages
   - What's unclear: How detailed error messages should be for end users
   - Recommendation: Map common HTTP errors to user-friendly messages, log full details

3. **File upload progress reporting**
   - What we know: MCP tools return single responses, no streaming
   - What's unclear: How to handle large file upload progress in MCP context
   - Recommendation: Add size validation to prevent files requiring progress reporting

## Sources

### Primary (HIGH confidence)
- Gladia API Documentation - Authentication, upload endpoint, response format
- Node.js Documentation - fs/promises, fetch, FormData, error handling
- MCP TypeScript SDK Documentation - Tool registration patterns, schema validation

### Secondary (MEDIUM confidence)
- Node.js FormData + fetch patterns - Verified with official documentation
- File validation approaches - Cross-referenced with security best practices

### Tertiary (LOW confidence)
- Community blog posts on undici CRLF issues - Mark for validation in testing

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation for all components
- Architecture: HIGH - Patterns verified with official examples
- Pitfalls: MEDIUM - Combination of documentation and community experience

**Research date:** 2026-02-07
**Valid until:** 30 days (stable APIs, minimal change expected)