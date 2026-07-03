# Phase 4: Basic Transcription - Research

**Researched:** 2026-02-07
**Domain:** Gladia API v2 transcription, async polling patterns, MCP timeout handling
**Confidence:** HIGH

## Summary

Researched Gladia's v2 pre-recorded transcription API for implementing configurable transcription jobs with language selection, diarization, and subtitle generation. The API follows a two-step workflow: initiate transcription (POST /v2/pre-recorded) and poll for results (GET /v2/pre-recorded/{id}). Key challenge is handling long-running transcription jobs (can take minutes) within MCP's request-response model.

The standard approach is polling-based with exponential backoff. Gladia provides comprehensive configuration options for language detection, speaker diarization, subtitle generation, and custom vocabulary. Results include detailed utterances with word-level timestamps.

**Primary recommendation:** Implement immediate job submission with separate status polling tool to handle MCP timeout constraints.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native fetch | Node.js 18+ | HTTP client | Already used in codebase, no additional dependencies |
| Zod | ^3.22.0 | Schema validation | Already used for input validation, excellent TypeScript integration |
| @modelcontextprotocol/sdk | ^1.26.0 | MCP server framework | Required for MCP tool definitions |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| AbortController | Native | Request cancellation | Long polling cancellation |
| setTimeout | Native | Polling intervals | Status check delays |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native fetch | axios/got | Additional dependency for minimal benefit |
| Polling pattern | Webhooks | Requires external endpoint setup |

**Installation:**
```bash
# No additional packages needed - using existing stack
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   └── gladia.ts        # Extended with transcription methods
├── types/
│   └── gladia.ts        # Transcription types added
├── tools/
│   ├── upload.ts        # Existing
│   ├── transcribe.ts    # New: Start transcription job
│   └── status.ts        # New: Check job status
└── server.ts            # Tool routing extended
```

### Pattern 1: Two-Tool Async Flow
**What:** Split transcription into job submission and status checking
**When to use:** Long-running operations that exceed MCP timeouts
**Example:**
```typescript
// Source: MCP async patterns + Gladia workflow
// Tool 1: Submit transcription
const transcribeResult = await gladiaClient.startTranscription(audioUrl, config)
// Returns: { jobId, status: "queued", estimatedDuration }

// Tool 2: Check status (called separately)
const statusResult = await gladiaClient.getTranscriptionStatus(jobId)
// Returns: { status, progress?, result? }
```

### Pattern 2: Configuration Builder
**What:** Structured configuration object for Gladia API options
**When to use:** Multiple optional parameters with validation
**Example:**
```typescript
// Source: Gladia API documentation
interface TranscriptionConfig {
  language?: string
  detect_language?: boolean
  diarization?: boolean
  diarization_config?: {
    number_of_speakers?: number
    min_speakers?: number
    max_speakers?: number
  }
  subtitles?: boolean
  subtitles_config?: {
    formats: ('srt' | 'vtt')[]
  }
  custom_vocabulary?: string[]
}
```

### Anti-Patterns to Avoid
- **Blocking poll within single tool:** Risk MCP timeout for long files
- **Hardcoded poll intervals:** Should be configurable based on estimated duration
- **Missing cancellation:** Long polls need AbortController for cleanup

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP polling with backoff | Custom retry logic | Exponential backoff pattern | Handles rate limits, network issues |
| Transcription result formatting | Custom text processing | Gladia's utterances structure | Word-level timestamps, speaker info |
| Audio format validation | File header parsing | Gladia's upload endpoint | Server-side validation, error messages |
| Job status management | In-memory state | Gladia's result URLs | Persistent, resumable |

**Key insight:** Gladia's two-step workflow (submit → poll) is designed for async handling; don't try to make it synchronous.

## Common Pitfalls

### Pitfall 1: MCP Timeout on Long Audio
**What goes wrong:** Single tool tries to poll until completion, hits MCP timeout
**Why it happens:** Transcription can take 2-5 minutes for long audio files
**How to avoid:** Split into separate tools: submit job + check status
**Warning signs:** Tools timing out on files > 10-15 minutes of audio

### Pitfall 2: Poll Rate Too Aggressive
**What goes wrong:** Hitting Gladia API rate limits with rapid status checks
**Why it happens:** No delay between polls, or fixed short interval
**How to avoid:** Exponential backoff starting at 5s, max 30s intervals
**Warning signs:** 429 rate limit errors from status endpoint

### Pitfall 3: Missing Error Context
**What goes wrong:** Generic "transcription failed" without actionable details
**Why it happens:** Not parsing Gladia's detailed error responses
**How to avoid:** Extract error_code and detailed messages from API response
**Warning signs:** Users can't determine why jobs fail

### Pitfall 4: Lost Job State
**What goes wrong:** User loses job ID, can't retrieve completed results
**Why it happens:** No persistent state between tool calls
**How to avoid:** Return job ID + result URL to user, let them track it
**Warning signs:** "How do I check my job from yesterday?"

## Code Examples

Verified patterns from official sources:

### Submit Transcription Job
```typescript
// Source: https://docs.gladia.io/api-reference/v2/pre-recorded/init
async startTranscription(audioUrl: string, config: TranscriptionConfig) {
  const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-gladia-key': this.apiKey
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      ...config
    })
  })

  if (!response.ok) {
    const error: GladiaErrorResponse = await response.json()
    throw new Error(error.error?.message || 'Transcription submission failed')
  }

  return await response.json() as TranscriptionJobResponse
}
```

### Poll for Results with Backoff
```typescript
// Source: Node.js async polling best practices + Gladia workflow
async getTranscriptionStatus(jobId: string): Promise<TranscriptionStatusResponse> {
  const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded/${jobId}`, {
    method: 'GET',
    headers: {
      'x-gladia-key': this.apiKey
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Transcription job ${jobId} not found`)
    }
    throw new Error(`Failed to get transcription status: ${response.status}`)
  }

  return await response.json()
}
```

### Configuration Validation
```typescript
// Source: Gladia API parameter documentation
const transcriptionConfigSchema = z.object({
  language: z.string().optional(),
  detect_language: z.boolean().default(true),
  diarization: z.boolean().default(false),
  diarization_config: z.object({
    number_of_speakers: z.number().min(1).max(20).optional(),
    min_speakers: z.number().min(1).optional(),
    max_speakers: z.number().min(1).max(20).optional()
  }).optional(),
  subtitles: z.boolean().default(false),
  subtitles_config: z.object({
    formats: z.array(z.enum(['srt', 'vtt'])).default(['srt'])
  }).optional(),
  custom_vocabulary: z.array(z.string()).optional()
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| V1 single endpoint | V2 two-step workflow | 2024-2025 | Better async handling, no lost results |
| Prediction array | result.transcription.utterances | V2 migration | Cleaner structure, word-level timestamps |
| Channel string | Channel integer | V2 migration | Better multi-channel support |
| Sync expectations | Async-first design | MCP evolution | Handles long-running jobs properly |

**Deprecated/outdated:**
- Gladia V1 API: Use V2 endpoints exclusively
- Blocking poll patterns: Use two-tool async flow

## Open Questions

Things that couldn't be fully resolved:

1. **MCP SEP-1391 Async Support**
   - What we know: Token-based async proposal exists, not yet implemented
   - What's unclear: Timeline for MCP SDK async support
   - Recommendation: Implement two-tool pattern now, migrate when SEP-1391 available

2. **Optimal Poll Intervals**
   - What we know: Exponential backoff 5s→30s recommended
   - What's unclear: Audio length vs processing time correlation
   - Recommendation: Start conservative, adjust based on user feedback

3. **Job Result Persistence**
   - What we know: Gladia keeps results available via result_url
   - What's unclear: How long results are stored
   - Recommendation: Document that users should retrieve results promptly

## Sources

### Primary (HIGH confidence)
- Gladia API v2 documentation - https://docs.gladia.io/api-reference/v2/pre-recorded/init
- Gladia pre-recorded workflow - https://docs.gladia.io/api-reference/pre-recorded-flow
- MCP SDK types and patterns - @modelcontextprotocol/sdk v1.26.0 codebase

### Secondary (MEDIUM confidence)
- Node.js async polling patterns - Web search verified with official Node.js docs
- SEP-1391 MCP async proposal - GitHub modelcontextprotocol/modelcontextprotocol#1391

### Tertiary (LOW confidence)
- Gladia processing time estimates - Community discussions, needs validation
- MCP timeout specifics - Inferred from community reports, not officially documented

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using established codebase patterns
- Architecture: HIGH - Based on official Gladia workflow and MCP constraints  
- Pitfalls: MEDIUM - Combination of documented issues and informed predictions

**Research date:** 2026-02-07
**Valid until:** 2026-03-07 (30 days - stable API patterns)