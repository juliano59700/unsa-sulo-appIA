# Project Research Summary

**Project:** MCP server for Gladia.io API
**Domain:** Speech-to-text API wrapper with async transcription
**Researched:** 2026-02-07
**Confidence:** MEDIUM

## Executive Summary

This project creates an MCP server that wraps Gladia.io's speech-to-text API, enabling Claude and other MCP clients to transcribe audio files with advanced features like speaker diarization and sentiment analysis. Based on research, the recommended approach is to build an outcome-focused TypeScript server using the official MCP SDK with async task patterns to handle long-running transcription jobs.

The architecture should follow the Async Task Handler Pattern with three core tools: unified transcription, status checking, and batch processing. This avoids the common anti-pattern of creating 7+ micro-tools that agents struggle to orchestrate. The primary technical risk is MCP's 60-second timeout conflicting with transcription jobs that can take minutes - this requires implementing async handoff with job polling from the start.

Critical success factors include proper binary data handling over stdio (base64 encoding), secure API key management, and streaming response handling to prevent memory issues with large transcripts. The technology stack is well-established with high confidence in the MCP SDK and TypeScript toolchain.

## Key Findings

### Recommended Stack

The technology stack is mature and well-supported with the official MCP TypeScript SDK as the foundation. Modern TypeScript tooling provides fast development cycles with tsup for building and vitest for testing.

**Core technologies:**
- @modelcontextprotocol/sdk 1.26.0: MCP server implementation — official SDK with 23k+ projects using it
- TypeScript 5.3+: Type safety — required for MCP SDK, robust development experience  
- tsup 8.0+: Build tool — fast bundler designed for TypeScript libraries
- vitest 1.3+: Test runner — modern alternative to Jest with better ESM/TS support
- zod 3.25+: Schema validation — required peer dependency for MCP SDK

### Expected Features

Research shows clear feature priorities based on user expectations and competitive analysis in the speech-to-text domain.

**Must have (table stakes):**
- Basic transcription tool — core purpose, users expect file upload → text output
- Async transcription status — long audio files require polling mechanism  
- Multiple audio formats — users have diverse sources, Gladia handles conversion
- Language detection/selection — global audience expects multilingual support
- Error handling & validation — audio files can be corrupted, need clear error messages

**Should have (competitive):**
- Speaker diarization — "who said what" essential for meetings/interviews
- Sentiment analysis per speaker — business intelligence differentiator
- Smart tool composition — one tool handles upload→transcribe→analyze pipeline
- Bulk processing — efficiency for batch workflows

**Defer (v2+):**
- Audio intelligence (NER, summarization) — need to understand workflows first
- Real-time transcription — different use cases, complex implementation
- Custom vocabulary management — advanced feature for power users
- Translation capabilities — beta feature that may change

### Architecture Approach

The recommended architecture follows the Async Task Handler Pattern with clear separation between MCP protocol handling, API communication, and state management. This addresses the inherent async nature of speech-to-text processing while maintaining clean component boundaries.

**Major components:**
1. Transport Layer — stdio JSON-RPC 2.0 message handling with MCP Host  
2. Task Manager — async operation tracking and polling coordination
3. Gladia API Layer — file upload, transcription submission, and result polling
4. Tool Registry — unified tools with outcome-focused design rather than API mapping

### Critical Pitfalls

Research identified several domain-specific pitfalls that can cause project failure if not addressed early.

1. **MCP timeout vs async operations** — transcription jobs >60 seconds fail with hardcoded MCP timeouts, requires async handoff pattern from start
2. **Binary data over stdio corruption** — raw audio files corrupt JSON-RPC messages, must use base64 encoding always
3. **API key exposure patterns** — environment variables get logged/inherited, need secure credential handling
4. **Memory leaks from large transcripts** — long audio generates gigabytes of JSON, requires streaming architecture  
5. **Aggressive polling rate limits** — naive polling triggers 429 errors, need exponential backoff strategy

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core MCP Infrastructure
**Rationale:** Foundation must be solid before building Gladia integration - MCP protocol handling is complex and easy to break
**Delivers:** Working MCP server with basic tool registration and stdio transport
**Addresses:** MCP timeout issues through proper async patterns
**Avoids:** Protocol corruption from logging to stdout

### Phase 2: Basic Transcription Flow  
**Rationale:** Prove Gladia integration works end-to-end before adding complexity
**Delivers:** File upload, job submission, and manual result polling
**Addresses:** Basic transcription (table stakes feature)
**Uses:** TypeScript SDK for MCP, direct Gladia API calls
**Implements:** Gladia API Layer component

### Phase 3: Async Task Integration
**Rationale:** Long transcription jobs require proper async handling - this enables real-world usage
**Delivers:** Unified transcription tool with automatic polling and job management
**Addresses:** Async transcription status, progress feedback
**Avoids:** MCP timeout pitfall through task handoff pattern
**Implements:** Task Manager with state tracking

### Phase 4: Feature Completeness
**Rationale:** Add competitive features once core flow is proven stable  
**Delivers:** Speaker diarization, sentiment analysis, bulk processing
**Addresses:** Competitive differentiation features
**Uses:** Full Gladia configuration options
**Implements:** Enhanced tool parameters and result processing

### Phase 5: Production Hardening
**Rationale:** Security and reliability features needed for real-world deployment
**Delivers:** Error handling, rate limiting, security improvements
**Avoids:** API key exposure, memory leak pitfalls
**Addresses:** Production deployment concerns

### Phase Ordering Rationale

- Phases 1-2 establish proven MCP integration before tackling async complexity
- Phase 3 addresses the critical timeout issue that makes or breaks the project
- Phase 4 builds on stable foundation to add competitive features
- Dependency order prevents rework: protocol → API → async → features → hardening

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** MCP Tasks primitive implementation — new spec, limited examples
- **Phase 4:** Gladia advanced features — sparse documentation on audio intelligence APIs

Phases with standard patterns (skip research-phase):
- **Phase 1:** MCP server setup — well-documented official examples
- **Phase 2:** HTTP API client — standard patterns, good documentation
- **Phase 5:** Security hardening — established Node.js practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official MCP SDK well documented, TypeScript tooling mature |
| Features | MEDIUM | Table stakes clear from market analysis, differentiators based on Gladia docs |
| Architecture | HIGH | MCP patterns well established, async handling documented |
| Pitfalls | HIGH | Timeout issues confirmed in GitHub issues, security patterns proven |

**Overall confidence:** MEDIUM

### Gaps to Address

Several areas need validation during implementation rather than upfront research:

- **Gladia API limits**: Rate limiting and quota details not fully documented, need testing
- **MCP Tasks spec**: New async primitive (2025-11-25) - actual client support unclear
- **Performance thresholds**: Memory usage patterns for large audio files need real testing
- **Error scenarios**: Gladia error code mapping incomplete, needs discovery during integration

## Sources

### Primary (HIGH confidence)
- [@modelcontextprotocol/sdk on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — MCP integration patterns, TypeScript implementation
- [Official MCP Build Server Docs](https://modelcontextprotocol.io/docs/develop/build-server) — server architecture and best practices
- [MCP TypeScript SDK Issue #245](https://github.com/modelcontextprotocol/typescript-sdk/issues/245) — timeout bug confirmation

### Secondary (MEDIUM confidence)  
- [MCP Security Survival Guide - Towards Data Science](https://towardsdatascience.com/the-mcp-security-survival-guide-best-practices-pitfalls-and-real-world-lessons/) — security pitfalls research
- [Gladia Pre-recorded API Flow](https://docs.gladia.io/api-reference/pre-recorded-flow) — API structure and async patterns
- [2025 TypeScript tooling best practices](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb) — build tool selection

### Tertiary (LOW confidence)
- Multiple speech-to-text API comparison articles — table stakes feature identification, needs validation
- GitHub MCP server examples — implementation patterns, varying quality

---
*Research completed: 2026-02-07*
*Ready for roadmap: yes*