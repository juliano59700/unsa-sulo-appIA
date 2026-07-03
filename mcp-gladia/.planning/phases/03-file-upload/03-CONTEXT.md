# Phase 3: File Upload & Basic API - Context

**Gathered:** 2026-02-07
**Status:** Ready for planning

<domain>
## Phase Boundary

First MCP tool exposing Gladia's file upload endpoint. User provides a local audio/video file path, server uploads it to Gladia, returns the upload URL for use in transcription. This phase establishes the Gladia API client pattern used by all subsequent phases.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
- Tool interface design (single upload tool, input parameters, file path vs URL support)
- File handling strategy (local validation, size limits, format checks, error messages)
- Gladia API client architecture (shared HTTP client, auth headers, base URL, error mapping)
- Response format (what metadata to return alongside the upload URL)
- File size validation approach and limits
- Supported audio/video format list

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User trusts Claude to make the best technical decisions for all implementation details.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-file-upload*
*Context gathered: 2026-02-07*
