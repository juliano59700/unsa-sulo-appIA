# Domain Pitfalls: MCP Speech-to-Text Server

**Domain:** MCP server wrapping Gladia.io async transcription API
**Researched:** 2025-02-07

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: MCP Timeout vs Long Transcription Jobs
**What goes wrong:** MCP tools execute synchronously within request-response cycle, but speech-to-text transcription can take minutes for large files. The TypeScript SDK has a known 60-second timeout that ignores progress updates, causing tools to fail with `McpError: MCP error -32001: Request timed out`.
**Why it happens:** Developers assume MCP tools work like web APIs with configurable timeouts, but current MCP implementations have hardcoded limits designed for quick operations.
**Consequences:** Transcription jobs >60 seconds always fail, making the tool unusable for real-world audio files.
**Prevention:** 
- Implement asynchronous hand-off pattern: return immediately with a job ID, provide separate polling tool
- Use MCP Tasks (2025-11-25 spec) if supported by client - allows call-now/fetch-later workflow
- Consider HTTP transport instead of stdio for better timeout control
**Detection:** Tool calls consistently timeout on audio files >5 minutes duration
**Phase warning:** Core tool design phase must address this or entire architecture fails

### Pitfall 2: Binary Data Over stdio Corruption
**What goes wrong:** Audio files passed as binary data over stdio transport corrupt JSON-RPC messages, breaking the entire MCP connection.
**Why it happens:** MCP over stdio uses JSON-RPC 2.0 protocol - any stdout pollution breaks message parsing.
**Consequences:** Server becomes completely unusable, requiring restart.
**Prevention:**
- Always base64-encode binary data in tool parameters
- Never write raw binary to stdout (corrupts protocol)
- Use file URLs/paths instead of direct binary transfer when possible
- Consider HTTP transport for binary-heavy workloads
**Detection:** JSON parse errors, connection drops when handling audio files
**Phase warning:** File handling design must get this right from day 1

### Pitfall 3: API Key Exposure in MCP Context
**What goes wrong:** API keys stored in environment variables get logged, exposed in error messages, or inherited by child processes in MCP server context.
**Why it happens:** 88% of MCP servers use static API keys via environment variables with poor isolation practices.
**Consequences:** API keys leaked in logs, inherited by spawned processes, or visible in process lists.
**Prevention:**
- Never log environment variables or API keys
- Use dedicated secret managers in production (AWS Secrets Manager, Azure Key Vault)
- Validate API key format at startup, fail fast if missing
- Use TypeScript config service with proper error handling (don't leak keys in stack traces)
**Detection:** API keys appear in logs, error messages, or process environment dumps
**Phase warning:** Authentication setup phase needs security-first design

### Pitfall 4: Command Injection via Filename Parameters
**What goes wrong:** Audio filenames containing shell metacharacters (`;`, `|`, `&`) get passed to system commands, enabling remote code execution.
**Why it happens:** MCP servers commonly use `os.system()` or similar with unsanitized input for file operations.
**Consequences:** Complete server compromise, arbitrary code execution.
**Prevention:**
- Never use `os.system()` with user input
- Sanitize all file paths and parameters
- Use parameterized commands or safe file handling libraries
- Validate file extensions and paths against allowlists
**Detection:** Unusual system processes, unexpected file system changes
**Phase warning:** File handling security must be addressed in core design

### Pitfall 5: Memory Leaks from Large Transcripts
**What goes wrong:** Transcripts for long audio files (hours of content) consume gigabytes of memory, causing crashes or system instability.
**Why it happens:** Node.js accumulates large JSON responses in memory without streaming or cleanup mechanisms.
**Consequences:** Server crashes, system slowdown, affects other processes.
**Prevention:**
- Stream large responses instead of loading fully into memory
- Implement transcript chunking for very long audio
- Set memory limits and monitoring
- Use backpressure mechanisms for large data flows
**Detection:** Memory usage spikes during transcription, eventual OOM crashes
**Phase warning:** Response handling architecture needs streaming from start

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

### Pitfall 1: Aggressive Polling Causing Rate Limits
**What goes wrong:** Polling Gladia API every few seconds for job status triggers rate limiting (429 errors), causing delays or blocking.
**Why it happens:** Developers implement naive polling without considering API limits or backoff strategies.
**Prevention:**
- Implement exponential backoff (start at 5s, increase to 30s max)
- Respect HTTP 429 responses and Retry-After headers
- Use webhook callbacks when available instead of polling
- Cache job status to avoid redundant requests

### Pitfall 2: Missing Error Context from Gladia API
**What goes wrong:** Gladia returns generic error codes (400, 402) without preserving original error context, making debugging difficult.
**Why it happens:** API wrappers catch and rethrow errors without preserving full context.
**Prevention:**
- Preserve original error responses and status codes
- Map Gladia error codes to meaningful messages
- Include request context (file size, format, config) in error logs
- Implement structured error logging

### Pitfall 3: npm Package bin Entry Misconfiguration
**What goes wrong:** CLI doesn't work after `npm install -g` due to missing shebang, wrong file permissions, or incorrect bin path.
**Why it happens:** Multiple steps required for working CLI (shebang, permissions, correct path) and easy to miss one.
**Prevention:**
- Always add `#!/usr/bin/env node` shebang to CLI entry point
- Set executable permissions with `chmod +x` 
- Test with `npm link` during development
- Use build tools banner option to inject shebang in compiled output
- Point bin path to compiled/built file, not source

### Pitfall 4: Inconsistent Progress Reporting
**What goes wrong:** Users get no feedback during long transcriptions, leading to perception that tool is broken.
**Why it happens:** MCP progress notifications not implemented or inconsistently used.
**Prevention:**
- Implement MCP progress notifications for jobs >10 seconds
- Report meaningful progress (% complete, time remaining)
- Use consistent progress update intervals (every 5-10 seconds)
- Provide fallback messaging when exact progress unavailable

### Pitfall 5: Environment Variable Validation Missing
**What goes wrong:** Server starts successfully but fails at runtime when API key is invalid or missing, providing poor error experience.
**Why it happens:** Environment validation happens during first API call rather than startup.
**Prevention:**
- Validate all required environment variables at server startup
- Use TypeScript config service with proper typing
- Fail fast with clear error messages
- Provide .env.example with required variables documented

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 1: Gladia Custom Vocabulary Not Used
**What goes wrong:** Technical terms, brand names, acronyms transcribed incorrectly despite being correctable.
**Why it happens:** Developers don't implement custom vocabulary feature from Gladia API.
**Prevention:**
- Support custom_vocabulary parameter in tool configuration
- Provide examples of technical vocabulary setup
- Document vocabulary format requirements

### Pitfall 2: Poor Audio Quality Detection
**What goes wrong:** Users submit low-quality audio and get poor transcription without guidance.
**Why it happens:** No pre-processing or quality checks before expensive transcription.
**Prevention:**
- Implement audio format validation
- Check sample rate, bitrate, duration before submission
- Provide guidance for optimal audio settings
- Use speech_threshold parameter for low-quality audio

### Pitfall 3: No Cancellation Support
**What goes wrong:** Users can't cancel long-running transcription jobs, wasting API quota and time.
**Why it happens:** MCP cancellation not implemented for async operations.
**Prevention:**
- Implement AbortController for job cancellation
- Store job references for cleanup
- Support MCP cancellation notifications
- Clean up resources on timeout/cancellation

### Pitfall 4: Logging to stdout in stdio Mode
**What goes wrong:** Debug logs written to stdout corrupt MCP protocol messages, breaking communication.
**Why it happens:** JavaScript `console.log()` writes to stdout by default.
**Prevention:**
- Use `console.error()` for all logging in stdio mode
- Configure logging framework to avoid stdout
- Add startup warning about stdout corruption
- Use structured logging to stderr

### Pitfall 5: No Audio Format Support Documentation
**What goes wrong:** Users try unsupported audio formats and get cryptic errors.
**Why it happens:** Tool doesn't document supported formats or validate input.
**Prevention:**
- Document supported audio formats clearly
- Validate file extensions and MIME types
- Provide clear error messages for unsupported formats
- Include format conversion guidance

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Core Architecture | MCP timeout vs async operations | Design polling/task pattern from start |
| File Handling | Binary data over stdio | Use base64 encoding, validate approach early |
| Security | API key exposure patterns | Implement secure credential handling first |
| Error Handling | Generic error wrapping | Design structured error context preservation |
| Performance | Memory usage with large responses | Plan streaming architecture upfront |
| CLI Setup | npm bin configuration | Test full install/publish flow early |
| Integration | Gladia API specifics | Research rate limits and best practices |
| User Experience | Progress reporting gaps | Implement feedback mechanisms for long operations |

## Confidence Levels

| Area | Confidence | Source |
|------|------------|--------|
| MCP timeout issues | HIGH | Official MCP spec, TypeScript SDK issues |
| Binary data over stdio | HIGH | MCP protocol documentation, community issues |
| Security patterns | MEDIUM | MCP security research, general Node.js practices |
| Gladia API specifics | LOW | Limited official documentation found |
| npm publishing | MEDIUM | Multiple community sources, npm documentation |
| Memory management | MEDIUM | Node.js best practices, community reports |

## Sources

- [MCP Security Survival Guide - Towards Data Science](https://towardsdatascience.com/the-mcp-security-survival-guide-best-practices-pitfalls-and-real-world-lessons/)
- [MCP TypeScript SDK Issue #245](https://github.com/modelcontextprotocol/typescript-sdk/issues/245) (timeout bug)
- [MCP Protocol Lifecycle Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle)
- [Building Timeout-Proof MCP Tools](https://www.arsturn.com/blog/no-more-timeouts-how-to-build-long-running-mcp-tools-that-actually-finish-the-job)
- [TypeScript Async API Wrapper Best Practices](https://blog.logrocket.com/async-await-typescript/)
- [Node.js Environment Variables Security](https://www.ionicframeworks.com/2025/09/how-to-secure-environment-variables-and.html)
- [npm Package Publishing Guide](https://dev.to/mir_mursalin_ankur/publishing-your-first-npm-package-a-real-world-guide-that-actually-helps-4l4)
- [Node.js Memory Leak Prevention](https://betterstack.com/community/guides/scaling-nodejs/high-performance-nodejs/nodejs-memory-leaks/)
- [API Rate Limiting Best Practices 2025](https://zuplo.com/learning-center/10-best-practices-for-api-rate-limiting-in-2025)