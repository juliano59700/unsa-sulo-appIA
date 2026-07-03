# Feature Landscape

**Domain:** MCP server for speech-to-text API wrapper (Gladia.io)
**Researched:** 2026-02-07

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Basic transcription tool | Core purpose - without this it's not a useful MCP server | Low | Simple file upload → text output |
| File upload handling | Users need to get audio files into the system | Low | Direct file path or URL support |
| Async transcription status | Long audio files take time to process | Medium | Polling mechanism for job completion |
| Multiple audio formats | Users have diverse audio sources | Low | Leverage Gladia's built-in format support |
| Language detection/selection | Global audience expects multilingual support | Low | Gladia supports 100+ languages |
| Error handling & validation | Audio files can be corrupted, too large, wrong format | Medium | Clear error messages for troubleshooting |
| Progress feedback | Users need to know transcription is happening | Low | Status updates during processing |

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Speaker diarization | "Who said what" - essential for meetings/interviews | Low | Gladia includes this bundled |
| Sentiment analysis per speaker | Business intelligence from conversations | Low | Gladia's unique strength vs competitors |
| Audio intelligence (NER, summarization) | Turn raw transcripts into actionable insights | Medium | Gladia's Audio-to-LLM feature |
| Smart tool composition | One tool that handles upload→transcribe→analyze pipeline | High | Outcome-focused design per MCP best practices |
| Bulk processing | Handle multiple files in one operation | Medium | Efficiency for batch workflows |
| Custom vocabulary | Domain-specific terminology accuracy | Medium | Important for technical/medical content |
| Translation capabilities | Multilingual content accessible in target language | Medium | Gladia offers this as beta feature |
| Subtitle generation | Video content creators need SRT/VTT output | Low | Multiple format support |
| Real-time transcription | Live streaming/call scenarios | High | Different API endpoint, complex state management |

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| 1:1 API mapping | Creates 7+ tools that agents struggle to orchestrate | Composite tools focused on outcomes |
| Local audio processing | Complexity + resource requirements don't add value | Use Gladia's cloud processing |
| Custom audio format conversion | Reinventing wheel, Gladia handles this | Let Gladia handle format conversion |
| Manual pagination | Forces agents to manage state across calls | Handle pagination internally, return complete results |
| Synchronous-only processing | Long files will timeout and frustrate users | Always use async pattern with polling |
| Exposing raw configuration | 50+ parameters overwhelm LLMs | Curate to 5-8 essential parameters with smart defaults |
| File storage/management | Not the server's job, creates security risks | Accept file paths/URLs, let users manage storage |

## Feature Dependencies

```
Basic transcription → Speaker diarization
                   → Sentiment analysis
                   → Audio intelligence (NER, summarization)
                   → Translation

File upload → Async processing → Status polling → Results retrieval

Custom vocabulary → Enhanced transcription accuracy
```

## MVP Recommendation

For MVP, prioritize:
1. **Smart transcription tool** - Single tool: file input → diarized transcript with sentiment
2. **Status checking tool** - Poll job completion with progress updates  
3. **Bulk transcription tool** - Multiple files in one operation

Defer to post-MVP:
- **Audio intelligence tools**: NER, summarization, Audio-to-LLM (need to understand user workflows first)
- **Real-time transcription**: Different use cases, complex implementation
- **Custom vocabulary management**: Advanced feature for power users
- **Translation**: Beta feature, may change

## Tool Granularity Recommendation

Based on MCP best practices research, implement **3 outcome-focused tools** rather than 7+ operation-focused tools:

### Core Tools

1. **`gladia_transcribe_audio`** (Primary tool)
   - Input: file path/URL, language (optional), enable_diarization, enable_sentiment
   - Output: Complete transcript with speakers and sentiment per sentence
   - Handles: Upload → transcribe → poll → return results internally

2. **`gladia_get_transcription_status`** (Support tool)
   - Input: job_id
   - Output: Status, progress, estimated completion time
   - For long-running jobs where user wants updates

3. **`gladia_batch_transcribe`** (Efficiency tool)
   - Input: Array of file paths/URLs, shared settings
   - Output: Array of completed transcriptions
   - Handles multiple files with progress tracking

### Advanced Tools (Post-MVP)

4. **`gladia_analyze_audio`** (Intelligence tool)
   - Input: file path/URL, analysis_types (summarization, NER, custom_prompt)
   - Output: Structured analysis results
   - Uses Audio-to-LLM feature

5. **`gladia_translate_transcript`** (Multilingual tool)
   - Input: job_id or text, target_language
   - Output: Translated transcript maintaining speaker attribution

## Sources

- MCP best practices: [philschmid.de/mcp-best-practices](https://www.philschmid.de/mcp-best-practices) (HIGH confidence)
- MCP server patterns: [modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples) (HIGH confidence)  
- Audio MCP servers analysis: GitHub examples - Whisper, Faster-Whisper implementations (MEDIUM confidence)
- Gladia features: [docs.gladia.io](https://docs.gladia.io) and marketing pages (MEDIUM confidence)
- Speech-to-text landscape: Deepgram, AssemblyAI comparison articles (MEDIUM confidence)
- Table stakes analysis: Multiple 2026 STT API comparison articles (LOW confidence - needs validation)