# MCP Gladia

## What This Is

A Model Context Protocol (MCP) server that exposes Gladia.io's pre-recorded speech-to-text API and audio intelligence capabilities to LLMs. Published as an npm package, it allows any MCP-compatible client (Claude Desktop, etc.) to transcribe audio/video files, analyze transcripts, and manage transcription jobs through natural language.

## Core Value

LLMs can transcribe and analyze any audio/video content through Gladia's API without the user needing to write code or leave their AI assistant.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Upload audio/video files to Gladia via `POST /v2/upload`
- [ ] Initiate pre-recorded transcription with configurable options (diarization, subtitles, custom vocabulary, language config)
- [ ] Poll and retrieve transcription results via `GET /v2/pre-recorded/:id`
- [ ] List past transcription jobs
- [ ] Delete specific transcription jobs
- [ ] Enable summarization (general, concise, bullet points)
- [ ] Enable sentiment/emotion analysis
- [ ] Enable named entity recognition
- [ ] Enable chapterization
- [ ] Enable translation to target languages
- [ ] Enable audio-to-LLM (custom prompts on audio)
- [ ] Publish as npm package for easy installation

### Out of Scope

- Live/real-time WebSocket transcription — MCP is request/response, live streaming doesn't fit the model
- OAuth/multi-user auth — MCP servers use API keys via environment config
- Web UI or dashboard — this is a headless MCP server
- Webhook/callback management — MCP is synchronous, polling is the retrieval method

## Context

- Gladia API v2 base URL: `https://api.gladia.io/v2`
- Auth via `x-gladia-key` header
- Pre-recorded flow: upload file → POST /v2/pre-recorded → poll result_url until done
- Audio intelligence features are boolean toggles on the transcription request body
- MCP SDK for TypeScript: `@modelcontextprotocol/sdk`
- Target: npm publishable package with `npx` support

## Constraints

- **Tech stack**: TypeScript with MCP SDK — standard for MCP servers
- **API version**: Gladia API v2 only
- **Transport**: stdio (standard MCP transport for CLI tools)
- **Auth**: API key via environment variable `GLADIA_API_KEY`
- **Node**: Minimum Node.js 18+

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Pre-recorded only, no live | MCP is request/response, WebSocket streaming doesn't fit | — Pending |
| TypeScript | Most common MCP server language, best SDK support | — Pending |
| npm publish | Public distribution for broad adoption | — Pending |
| stdio transport | Standard MCP transport, works with all clients | — Pending |

---
*Last updated: 2026-02-07 after initialization*
