# Architecture Patterns

**Domain:** MCP Server for Gladia.io Pre-recorded Speech-to-Text API
**Researched:** 2026-02-07

## Recommended Architecture

The TypeScript MCP server wrapping Gladia.io should follow the **Async Task Handler Pattern** with clear separation between protocol handling, API communication, and state management.

```
┌─────────────────────────────────────────────────────────────────┐
│                        MCP Host (Claude)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │ JSON-RPC 2.0 via stdio
                          v
┌─────────────────────────────────────────────────────────────────┐
│                    MCP Server (Node.js)                        │
│  ┌───────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │   Transport   │  │   Tool Registry   │  │  Task Manager  │  │
│  │   (stdio)     │  │                  │  │                │  │
│  └───────┬───────┘  └─────────┬────────┘  └─────────┬───────┘  │
│          │                    │                     │          │
│          v                    v                     v          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              Core Server (McpServer)                        │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
└──────────────────────────────┼─────────────────────────────────────┘
                               │
                               v
┌─────────────────────────────────────────────────────────────────┐
│                     Gladia API Layer                           │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  File Uploader  │  │   Transcriber │  │   Result Poller  │  │
│  │                 │  │              │  │                   │  │
│  └─────────┬───────┘  └──────┬───────┘  └─────────┬─────────┘  │
└───────────────┼─────────────────┼─────────────────────┼─────────┘
                v                 v                     v
┌─────────────────────────────────────────────────────────────────┐
│                      Gladia.io API                             │
│           POST /v2/upload → POST /v2/pre-recorded              │
│                    → GET result_url (polling)                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Transport Layer** | stdio JSON-RPC 2.0 message handling | MCP Host ↔ Core Server |
| **Core Server** | MCP protocol implementation, tool routing | Transport ↔ Tool Registry |
| **Tool Registry** | Tool definition, validation, execution dispatch | Core Server ↔ Task Manager |
| **Task Manager** | Async operation tracking, polling coordination | Tool Registry ↔ Gladia API |
| **File Uploader** | Binary data → Gladia upload endpoint | Task Manager ↔ Gladia API |
| **Transcriber** | Transcription job submission with config | Task Manager ↔ Gladia API |
| **Result Poller** | Status polling and result retrieval | Task Manager ↔ Gladia API |

### Data Flow

1. **Tool Invocation**: MCP Host → Transport → Core Server → Tool Registry
2. **File Upload** (if local file): Tool Registry → Task Manager → File Uploader → Gladia API
3. **Job Submission**: Task Manager → Transcriber → Gladia API
4. **Polling Loop**: Task Manager → Result Poller → Gladia API (until done)
5. **Result Return**: Gladia API → Result Poller → Task Manager → Tool Registry → Core Server → Transport → MCP Host

## Patterns to Follow

### Pattern 1: Async Task with MCP Tasks Primitive
**What:** Use MCP's new Tasks primitive (SEP-1686) for long-running transcription operations
**When:** For all transcription operations (inherently async)
**Example:**
```typescript
server.tool("transcribe-audio", {
  description: "Transcribe audio file using Gladia.io",
  inputSchema: {
    type: "object",
    properties: {
      audio_url: { type: "string" },
      language: { type: "string", enum: ["en", "fr", "es", "auto"] },
      enable_diarization: { type: "boolean" }
    },
    required: ["audio_url"]
  },
  execution: {
    taskSupport: "required" // Enable async task support
  }
}, async (args) => {
  const taskId = await taskManager.submitTranscription(args);
  return {
    task: {
      id: taskId,
      status: "running",
      message: "Transcription job submitted to Gladia"
    }
  };
});
```

### Pattern 2: State Machine for Transcription Jobs
**What:** Track job state transitions: submitted → processing → done/failed
**When:** Managing async operations with polling
**Example:**
```typescript
enum TranscriptionState {
  SUBMITTED = "submitted",
  PROCESSING = "processing", 
  DONE = "done",
  FAILED = "failed"
}

interface TranscriptionJob {
  id: string;
  gladiaJobId: string;
  resultUrl: string;
  state: TranscriptionState;
  config: TranscriptionConfig;
  result?: TranscriptionResult;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Pattern 3: Streaming File Upload with Progress
**What:** Handle binary file uploads with base64 encoding via MCP tools
**When:** Users provide local audio files
**Example:**
```typescript
server.tool("upload-audio-file", {
  description: "Upload local audio file for transcription",
  inputSchema: {
    type: "object", 
    properties: {
      file_data: { type: "string", description: "Base64 encoded audio file" },
      filename: { type: "string" },
      content_type: { type: "string", default: "audio/mpeg" }
    },
    required: ["file_data", "filename"]
  }
}, async (args) => {
  const buffer = Buffer.from(args.file_data, 'base64');
  const uploadResult = await gladiaClient.uploadFile(buffer, args.filename);
  return { audio_url: uploadResult.audio_url };
});
```

### Pattern 4: Unified Configuration Interface
**What:** Single tool with comprehensive Gladia feature toggles
**When:** Exposing audio intelligence features (diarization, translation, etc.)
**Example:**
```typescript
interface GladiaTranscriptionConfig {
  audio_url: string;
  language?: string;
  enable_diarization?: boolean;
  enable_translation?: boolean;
  target_languages?: string[];
  enable_summarization?: boolean;
  enable_sentiment_analysis?: boolean;
  enable_subtitles?: boolean;
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Blocking Synchronous Tools
**What:** Making MCP tools wait for full transcription completion
**Why bad:** Causes timeouts (30s+), poor UX, connection drops
**Instead:** Use MCP Tasks primitive for async operations

### Anti-Pattern 2: Naive Polling Without Backoff
**What:** Polling Gladia API every 1 second continuously
**Why bad:** Rate limiting, unnecessary API calls, poor performance
**Instead:** Exponential backoff: 1s → 2s → 5s → 10s intervals

### Anti-Pattern 3: Storing Large Results in Memory
**What:** Keeping full transcription results in task manager state
**Why bad:** Memory bloat, especially with long audio files and speaker diarization
**Instead:** Stream results directly from Gladia, minimal state tracking

### Anti-Pattern 4: Tool Explosion
**What:** Creating separate tools for every Gladia feature combination
**Why bad:** API surface explosion, poor discoverability
**Instead:** Single configurable `transcribe-audio` tool with feature flags

### Anti-Pattern 5: Logging to stdout in stdio Transport
**What:** Using `console.log()` for debugging in stdio-based MCP server
**Why bad:** Corrupts JSON-RPC messages, breaks protocol
**Instead:** Use stderr logging or file-based logging

## Scalability Considerations

| Concern | At 10 jobs | At 100 jobs | At 1000+ jobs |
|---------|------------|-------------|---------------|
| **Task Storage** | In-memory Map | In-memory Map with TTL cleanup | Redis/persistent store |
| **Polling** | Single interval timer | Batched polling requests | Queue-based polling with workers |
| **Memory** | Full results in memory | Stream large results | Stream + optional caching |
| **Rate Limiting** | Simple throttling | Exponential backoff | Advanced rate limiting with queues |
| **Error Handling** | Basic retry logic | Circuit breaker pattern | Dead letter queues |

## Suggested Build Order

Based on dependencies between components:

### Phase 1: Core Infrastructure
- MCP server setup with TypeScript SDK
- stdio transport configuration
- Basic tool registration framework
- Environment configuration (API keys, etc.)

### Phase 2: Basic Transcription Flow
- Gladia API client (HTTP wrapper)
- File upload tool (base64 → Gladia upload endpoint)
- Simple transcription tool (submit job, return job ID)
- Basic result polling tool (check status, return result)

### Phase 3: Async Task Integration  
- Task manager with state tracking
- MCP Tasks primitive implementation
- Unified transcription tool with async support
- Polling automation with backoff

### Phase 4: Feature Completeness
- Full Gladia config options (diarization, translation, etc.)
- Error handling and retry logic
- Result caching and cleanup
- Advanced audio intelligence features

### Phase 5: Production Readiness
- Comprehensive error handling
- Rate limiting and circuit breakers
- Performance monitoring
- Documentation and examples

**Build order rationale:**
- Phase 1 establishes the foundation for all MCP communication
- Phase 2 proves the Gladia integration works end-to-end
- Phase 3 addresses the async nature properly (critical for UX)
- Phase 4 exposes full Gladia capabilities
- Phase 5 hardens for production use

## Sources

**HIGH confidence:**
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official architecture guidance
- [MCP Tasks Specification (SEP-1686)](https://github.com/modelcontextprotocol/modelcontextprotocol/issues/1686) - Async operations pattern
- [Gladia Pre-recorded API Flow](https://docs.gladia.io/api-reference/pre-recorded-flow) - API structure and polling

**MEDIUM confidence:**
- [FastMCP Framework](https://github.com/punkpeye/fastmcp) - TypeScript patterns
- [MCP Async Operations Discussion](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/491) - Community patterns
- [FreeCodeCamp MCP Guide](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/) - Project structure examples