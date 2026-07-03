# Phase 5: Job Management - Research

**Researched:** 2026-02-07
**Domain:** Gladia API v2 Transcription Job Management
**Confidence:** HIGH

## Summary

Research has identified the complete Gladia API v2 endpoints needed for transcription job management. The API provides dedicated endpoints for listing transcriptions (`GET /v2/transcription`), deleting jobs (`DELETE /v2/pre-recorded/{id}`), and checking status (existing `GET /v2/pre-recorded/{id}`). The list endpoint offers comprehensive pagination and filtering capabilities with detailed metadata for each transcription job.

Key findings: The existing `get_transcription_status` tool already covers requirement TRANS-06, so Phase 5 primarily needs to implement list and delete operations. The API uses consistent authentication via `x-gladia-key` header and follows RESTful patterns.

**Primary recommendation:** Implement two new MCP tools: `list_transcription_jobs` and `delete_transcription_job` using the official Gladia API v2 endpoints.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @modelcontextprotocol/sdk | ^1.26.0 | MCP tool framework | Existing project standard |
| zod | latest | Input validation | Existing project pattern |
| Native fetch | Node.js 18+ | HTTP requests | Existing project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GladiaClient | current | API wrapper | Extend existing class with new methods |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native fetch | axios/got | No benefit - fetch works fine for this use case |
| Custom pagination | Library | Not needed - API provides pagination URLs |

**Installation:**
```bash
# No new dependencies needed - use existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/gladia.ts        # Extend GladiaClient with new methods
├── tools/               # Add new tool files
│   ├── list_jobs.ts    # List transcription jobs
│   └── delete_job.ts   # Delete transcription job
└── types/gladia.ts     # Add new response types
```

### Pattern 1: Extend GladiaClient Class
**What:** Add listJobs() and deleteJob() methods to existing GladiaClient class
**When to use:** Follows established project pattern
**Example:**
```typescript
// Source: Existing pattern in src/lib/gladia.ts
class GladiaClient {
  async listTranscriptionJobs(options?: ListJobsOptions): Promise<TranscriptionListResponse> {
    const url = new URL(`${GLADIA_API_URL}/v2/transcription`)
    // Add query parameters
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'x-gladia-key': this.apiKey }
    })
    // Handle response
  }
  
  async deleteTranscriptionJob(jobId: string): Promise<void> {
    const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded/${jobId}`, {
      method: 'DELETE',
      headers: { 'x-gladia-key': this.apiKey }
    })
    // Handle response
  }
}
```

### Pattern 2: MCP Tool Structure
**What:** Follow existing tool pattern with definition and handler
**When to use:** All MCP tools in this project
**Example:**
```typescript
// Source: Existing pattern in src/tools/transcription_status.ts
export const listJobsTool = {
  definition: {
    name: 'list_transcription_jobs',
    description: '...',
    inputSchema: { /* ... */ }
  },
  handler: async (arguments_: any) => {
    // Validation, API call, error handling
  }
}
```

### Anti-Patterns to Avoid
- **Multiple API clients:** Use single GladiaClient instance pattern
- **Direct fetch in tools:** Use GladiaClient methods for consistency
- **Missing error handling:** All API calls must handle 401/403/404 properly

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date filtering | Custom date parsing | URL searchParams with ISO dates | API expects specific format |
| Pagination | Custom pagination logic | Use API-provided URLs (next, first, current) | API handles complex pagination state |
| Status filtering | Custom enum validation | Zod enum schema | Type safety and validation |
| Error parsing | Generic error handling | Specific Gladia error response format | API returns structured errors |

**Key insight:** Gladia API provides well-designed pagination and filtering - use it rather than implementing client-side logic.

## Common Pitfalls

### Pitfall 1: Endpoint Confusion
**What goes wrong:** Using deprecated `/v2/transcription/{id}` DELETE endpoint instead of `/v2/pre-recorded/{id}`
**Why it happens:** API has both endpoints, documentation shows deprecated one first
**How to avoid:** Always use `/v2/pre-recorded/{id}` for DELETE operations
**Warning signs:** 404 errors on deletion when job exists

### Pitfall 2: Pagination State Management
**What goes wrong:** Trying to calculate pagination manually instead of using provided URLs
**Why it happens:** Assuming simple offset/limit pattern
**How to avoid:** Use `next`, `current`, `first` URLs from API response
**Warning signs:** Inconsistent results or missing items across pages

### Pitfall 3: Missing Query Parameter Encoding
**What goes wrong:** Date filters not working due to improper URL encoding
**Why it happens:** Special characters in ISO date format
**How to avoid:** Use URL.searchParams.set() for all query parameters
**Warning signs:** Filter parameters ignored by API

### Pitfall 4: TRANS-06 Tool Overlap
**What goes wrong:** Creating duplicate functionality for checking job status
**Why it happens:** Not recognizing existing `get_transcription_status` tool
**How to avoid:** Document that TRANS-06 is already implemented
**Warning signs:** User confusion about which tool to use

## Code Examples

Verified patterns from official sources:

### List Transcriptions with Filtering
```typescript
// Source: https://docs.gladia.io/api-reference/v2/transcription/list
async listTranscriptionJobs(options?: {
  offset?: number
  limit?: number
  status?: 'queued' | 'processing' | 'done' | 'error'
  after_date?: string
  before_date?: string
  kind?: 'pre-recorded' | 'live'
}): Promise<TranscriptionListResponse> {
  const url = new URL(`${GLADIA_API_URL}/v2/transcription`)
  
  if (options) {
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, value.toString())
      }
    })
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'x-gladia-key': this.apiKey }
  })
  
  if (!response.ok) {
    throw new Error(`Failed to list transcriptions: ${response.status}`)
  }
  
  return response.json()
}
```

### Delete Transcription Job
```typescript
// Source: https://docs.gladia.io/api-reference/v2/pre-recorded/delete
async deleteTranscriptionJob(jobId: string): Promise<void> {
  const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded/${jobId}`, {
    method: 'DELETE',
    headers: { 'x-gladia-key': this.apiKey }
  })
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Transcription job ${jobId} not found`)
    }
    if (response.status === 403) {
      throw new Error(`Transcription job ${jobId} is not in a deletable state`)
    }
    throw new Error(`Failed to delete transcription: ${response.status}`)
  }
  
  // Success - no response body for 202
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `/v2/transcription/{id}` DELETE | `/v2/pre-recorded/{id}` DELETE | 2024 | Use pre-recorded endpoint for consistency |
| Manual pagination | API-provided URLs | API v2 release | Simpler, more reliable pagination |
| Single status endpoint | Dedicated list endpoint | API v2 release | Bulk operations now possible |

**Deprecated/outdated:**
- `DELETE /v2/transcription/{id}`: Use `/v2/pre-recorded/{id}` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Soft Delete vs Hard Delete**
   - What we know: API says "delete transcription and all its data"
   - What's unclear: Whether this is recoverable or permanent
   - Recommendation: Document as permanent deletion, add confirmation

2. **Rate Limiting on List Endpoint**
   - What we know: No explicit rate limits documented
   - What's unclear: Safe pagination frequency
   - Recommendation: Implement reasonable defaults (limit=20, no rapid polling)

## Sources

### Primary (HIGH confidence)
- https://docs.gladia.io/api-reference/v2/transcription/list - List endpoint specification
- https://docs.gladia.io/api-reference/v2/pre-recorded/delete - Delete endpoint specification
- Existing codebase patterns in src/lib/gladia.ts and src/tools/

### Secondary (MEDIUM confidence)
- Gladia API v2 workflow documentation - General patterns

### Tertiary (LOW confidence)
- None - all findings verified with official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project dependencies
- Architecture: HIGH - Following established patterns in codebase
- Pitfalls: HIGH - Verified with official API documentation
- API endpoints: HIGH - Official Gladia documentation

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - API is stable)