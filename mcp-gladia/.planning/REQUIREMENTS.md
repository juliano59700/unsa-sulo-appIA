# Requirements: MCP Gladia

**Defined:** 2026-02-07
**Core Value:** LLMs can transcribe and analyze any audio/video content through Gladia's API

## v1 Requirements

### Core Transcription

- [x] **TRANS-01**: User can upload an audio/video file to Gladia and get a URL back
- [x] **TRANS-02**: User can submit a pre-recorded transcription job with configurable options (language, diarization, subtitles, custom vocabulary)
- [x] **TRANS-03**: User can retrieve transcription results with automatic polling until completion (with timeout fallback to manual status checking for long-running jobs)
- [x] **TRANS-04**: User can list past transcription jobs
- [x] **TRANS-05**: User can delete a specific transcription job
- [x] **TRANS-06**: User can check the status of a running transcription job

### Audio Intelligence

- [x] **INTL-01**: User can enable summarization on transcription (general, concise, bullet points)
- [x] **INTL-02**: User can enable translation to one or more target languages
- [x] **INTL-03**: User can enable speaker diarization with min/max speaker config
- [x] **INTL-04**: User can enable sentiment/emotion analysis on transcription
- [x] **INTL-05**: User can enable named entity recognition on transcription
- [x] **INTL-06**: User can enable chapterization on transcription
- [x] **INTL-07**: User can run custom prompts on audio via audio-to-LLM feature

### Developer Experience

- [x] **DX-01**: Package is installable via npm and runnable via npx
- [x] **DX-02**: API key is configured via GLADIA_API_KEY environment variable
- [x] **DX-03**: Errors from Gladia API are surfaced with clear, actionable messages
- [x] **DX-04**: All tool inputs and outputs have complete TypeScript types and Zod schemas
- [x] **DX-05**: README documents installation, configuration, and usage examples
- [x] **DX-06**: Server uses stdio transport compatible with all MCP clients

## v2 Requirements

### Live Transcription

- **LIVE-01**: User can start a live transcription session via WebSocket
- **LIVE-02**: User can stream audio chunks and receive real-time partial transcripts

### Advanced Features

- **ADV-01**: User can process multiple files in a single batch operation
- **ADV-02**: User can manage custom vocabulary lists

## Out of Scope

| Feature | Reason |
|---------|--------|
| Live/real-time WebSocket transcription | MCP is request/response, doesn't fit streaming model |
| Local audio processing/conversion | Gladia handles format conversion server-side |
| Web UI or dashboard | Headless MCP server, UI is the LLM client |
| Webhook/callback management | MCP is synchronous polling, not event-driven |
| File storage management | Security risk, users manage their own files |
| OAuth/multi-user auth | MCP servers use single API key via env config |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TRANS-01 | Phase 3 | Complete |
| TRANS-02 | Phase 4 | Complete |
| TRANS-03 | Phase 4 | Complete |
| TRANS-04 | Phase 5 | Complete |
| TRANS-05 | Phase 5 | Complete |
| TRANS-06 | Phase 5 | Complete |
| INTL-01 | Phase 7 | Complete |
| INTL-02 | Phase 8 | Complete |
| INTL-03 | Phase 6 | Complete |
| INTL-04 | Phase 7 | Complete |
| INTL-05 | Phase 7 | Complete |
| INTL-06 | Phase 7 | Complete |
| INTL-07 | Phase 9 | Complete |
| DX-01 | Phase 1 | Complete |
| DX-02 | Phase 1 | Complete |
| DX-03 | Phase 4 | Complete |
| DX-04 | Phase 10 | Complete |
| DX-05 | Phase 10 | Complete |
| DX-06 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-07*
*Last updated: 2026-02-08 — ALL REQUIREMENTS COMPLETE*