# Phase 7: Content Intelligence - Research

**Researched:** 2026-02-08
**Domain:** Gladia.io API v2 Audio Intelligence Features
**Confidence:** HIGH

## Summary

Gladia.io API v2 provides comprehensive audio intelligence features through the POST /v2/pre-recorded endpoint. These features transform raw transcriptions into structured, actionable insights including summarization, sentiment analysis, named entity recognition, chapterization, translation, and custom LLM prompts.

All features follow a consistent pattern: boolean toggle fields to enable features, optional configuration objects for advanced settings, and corresponding response keys containing structured results. The API is well-documented with clear JSON schemas and examples.

**Primary recommendation:** Use Gladia's built-in audio intelligence features rather than post-processing transcripts with external services - the integration is seamless and provides consistent response structures.

## Standard Stack

The established approach for Gladia.io audio intelligence integration:

### Core API Endpoint
| Component | Version | Purpose | Why Standard |
|-----------|---------|---------|--------------|
| POST /v2/pre-recorded | v2 | Pre-recorded transcription with intelligence | Official Gladia v2 API endpoint |
| Authentication | API Key | x-gladia-key header | Required for all API access |

### Request Pattern
| Element | Format | Purpose | When to Use |
|---------|--------|---------|-------------|
| Boolean toggles | `"feature_name": true` | Enable intelligence features | All features |
| Config objects | `"feature_name_config": {}` | Advanced configuration | When defaults insufficient |
| audio_url | URL string | Source audio file | Required field |

**Installation:**
```bash
# No installation required - REST API
# Authentication via x-gladia-key header
```

## Architecture Patterns

### Recommended Request Structure
```json
{
  "audio_url": "https://example.com/audio.wav",
  "summarization": true,
  "summarization_config": {
    "type": "concise"
  },
  "sentiment_analysis": true,
  "named_entity_recognition": true,
  "chapterization": true,
  "translation": true,
  "translation_config": {
    "target_languages": ["fr", "es"],
    "model": "base"
  },
  "audio_to_llm": true,
  "audio_to_llm_config": {
    "prompts": [
      "Extract the key points as bullet points",
      "What is the main topic discussed?"
    ]
  }
}
```

### Pattern 1: Feature Toggle with Optional Config
**What:** Boolean field enables feature, optional config object provides customization
**When to use:** For all audio intelligence features
**Example:**
```json
{
  "summarization": true,
  "summarization_config": {
    "type": "bullet_points"
  }
}
```

### Pattern 2: Async Processing with Polling
**What:** Submit request, get transcription ID, poll result_url until complete
**When to use:** All pre-recorded transcription requests
**Example:**
```typescript
// Submit request
const response = await fetch('https://api.gladia.io/v2/pre-recorded', {
  method: 'POST',
  headers: { 'x-gladia-key': apiKey },
  body: JSON.stringify(requestData)
});
const { id, result_url } = await response.json();

// Poll for results
let result;
do {
  const pollResponse = await fetch(result_url, {
    headers: { 'x-gladia-key': apiKey }
  });
  result = await pollResponse.json();
} while (result.status !== 'done');
```

### Anti-Patterns to Avoid
- **Processing transcripts externally:** Gladia provides built-in intelligence features
- **Missing error handling:** Always check success flags in responses
- **Polling too frequently:** Respect rate limits when checking results

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text summarization | Custom summary logic | `summarization: true` | Handles speaker context, timestamps |
| Sentiment analysis | External NLP services | `sentiment_analysis: true` | Per-sentence, speaker-aware analysis |
| Entity extraction | Custom regex/NLP | `named_entity_recognition: true` | Trained for audio context |
| Chapter detection | Text segmentation | `chapterization: true` | Audio-aware topic boundaries |
| Translation | Google Translate API | `translation: true` | Maintains audio structure/timing |
| Custom prompts | External LLM calls | `audio_to_llm: true` | Direct audio context integration |

**Key insight:** Gladia's intelligence features are designed specifically for audio content and maintain context, timing, and speaker information that external processing would lose.

## Common Pitfalls

### Pitfall 1: Ignoring Success Flags
**What goes wrong:** Assuming intelligence features always succeed
**Why it happens:** Not checking response.feature.success boolean
**How to avoid:** Always check success flag before using results
**Warning signs:** Inconsistent or missing intelligence data

### Pitfall 2: Wrong Summarization Type
**What goes wrong:** Using default "general" when bullet points needed
**Why it happens:** Not specifying summarization_config.type
**How to avoid:** Always specify type: "general" | "concise" | "bullet_points"
**Warning signs:** Summary format doesn't match UI expectations

### Pitfall 3: Missing Translation Languages
**What goes wrong:** Translation enabled but no target languages specified
**Why it happens:** Assuming English is automatic target
**How to avoid:** Always provide target_languages array in translation_config
**Warning signs:** Translation feature success=false

### Pitfall 4: Inefficient Polling
**What goes wrong:** Polling result_url too frequently or not handling failures
**Why it happens:** Not implementing exponential backoff
**How to avoid:** Start with 1s intervals, increase on subsequent polls
**Warning signs:** Rate limiting errors or high API costs

## Code Examples

Verified patterns from official sources:

### Complete Audio Intelligence Request
```json
// Source: https://docs.gladia.io/api-reference/v2/pre-recorded/init
{
  "audio_url": "https://files.gladia.io/example/sample.wav",
  "summarization": true,
  "summarization_config": {
    "type": "bullet_points"
  },
  "sentiment_analysis": true,
  "named_entity_recognition": true,
  "chapterization": true,
  "translation": true,
  "translation_config": {
    "target_languages": ["fr", "es"],
    "model": "base",
    "context": "Business meeting discussion"
  },
  "audio_to_llm": true,
  "audio_to_llm_config": {
    "prompts": [
      "Extract the key decisions made in this meeting",
      "What are the action items and who is responsible?"
    ]
  }
}
```

### Response Structure Handling
```typescript
// Source: https://docs.gladia.io/api-reference/v2/pre-recorded/get
interface AudioIntelligenceResponse {
  summarization?: {
    success: boolean;
    is_empty: boolean;
    results: string | null;
    exec_time: number;
    error: null | AddonErrorDTO;
  };
  sentiment_analysis?: {
    success: boolean;
    is_empty: boolean;
    results: Array<{
      text: string;
      sentiment: string;
      emotion: string;
      start: number;
      end: number;
      channel: number;
      speaker: number;
    }>;
    exec_time: number;
    error: null | AddonErrorDTO;
  };
  named_entity_recognition?: {
    success: boolean;
    is_empty: boolean;
    entity: string;
    exec_time: number;
    error: null | AddonErrorDTO;
  };
  chapterization?: {
    success: boolean;
    is_empty: boolean;
    results: object;
    exec_time: number;
    error: null | AddonErrorDTO;
  };
  translation?: {
    error: null | AddonErrorDTO;
    full_transcript: string;
    languages: string[];
    sentences: SentencesDTO[];
    subtitles: SubtitleDTO[];
    utterances: UtteranceDTO[];
  };
  audio_to_llm?: {
    success: boolean;
    is_empty: boolean;
    results: Array<{
      prompt: string | null;
      response: string | null;
    }>;
    exec_time: number;
    error: null | AddonErrorDTO;
  };
}
```

## Feature Details

### 1. Summarization (INTL-01)
**Enable:** `"summarization": true`
**Config:** `"summarization_config": { "type": "general" | "concise" | "bullet_points" }`
**Response:** `response.summarization.results` (string)
**Default:** "general" type if no config provided

### 2. Sentiment/Emotion Analysis (INTL-04)
**Enable:** `"sentiment_analysis": true`
**Config:** No configuration options
**Response:** `response.sentiment_analysis.results` (array of objects with text, sentiment, emotion, timestamps, speaker)
**Sentiments:** positive, negative, neutral, mixed, unknown
**Emotions:** 25+ emotions including adoration, anger, confusion, etc.

### 3. Named Entity Recognition (INTL-05)
**Enable:** `"named_entity_recognition": true`
**Config:** No configuration options
**Response:** `response.named_entity_recognition.entity` (string)
**Entities:** People, places, organizations, dates
**Status:** Alpha (breaking changes possible)

### 4. Chapterization (INTL-06)
**Enable:** `"chapterization": true`
**Config:** No configuration options  
**Response:** `response.chapterization.results` (object with summary, headline, gist, keywords per chapter)
**Includes:** Start/end timestamps for each chapter

### 5. Translation (INTL-02)
**Enable:** `"translation": true`
**Config:** `"translation_config": { "target_languages": ["fr", "es"], "model": "base" | "enhanced" }`
**Response:** `response.translation` (full_transcript, languages, utterances, subtitles)
**Required:** target_languages array must be specified

### 6. Audio-to-LLM / Custom Prompts (INTL-07)
**Enable:** `"audio_to_llm": true`
**Config:** `"audio_to_llm_config": { "prompts": ["question 1", "question 2"] }`
**Response:** `response.audio_to_llm.results` (array with prompt/response pairs)
**Required:** prompts array must contain at least one prompt

## State of the Art

| Feature | Current Status | API Version | Stability |
|---------|---------------|-------------|-----------|
| Summarization | Stable | v2 | Production |
| Sentiment Analysis | Stable | v2 | Production |
| Named Entity Recognition | Alpha | v2 | Breaking changes possible |
| Chapterization | Stable | v2 | Production |
| Translation | Stable | v2 | Production |
| Audio-to-LLM | Alpha | v2 | Breaking changes possible |

**Migration notes:**
- v2 API is current and stable
- Features follow consistent boolean + config pattern
- Alpha features may have API changes with advance notice

## Open Questions

Things that couldn't be fully resolved:

1. **Rate Limiting Specifics**
   - What we know: Polling is required for results
   - What's unclear: Exact rate limits for result polling
   - Recommendation: Implement exponential backoff starting at 1s intervals

2. **Chapterization Response Schema**
   - What we know: Returns object with summary, headline, gist, keywords
   - What's unclear: Complete object structure and field names
   - Recommendation: Test with sample audio to document structure

3. **NER Entity Categories**
   - What we know: Detects people, places, organizations, dates
   - What's unclear: Complete list of supported entity types
   - Recommendation: Document entity types discovered during testing

## Sources

### Primary (HIGH confidence)
- https://docs.gladia.io/api-reference/v2/pre-recorded/init - Complete API schema
- https://docs.gladia.io/api-reference/v2/pre-recorded/get - Response structures  
- https://docs.gladia.io/chapters/pre-recorded-stt/getting-started - Getting started guide
- https://docs.gladia.io/chapters/audio-intelligence/sentiment-analysis - Sentiment analysis details
- https://docs.gladia.io/chapters/audio-intelligence/translation - Translation configuration

### Secondary (MEDIUM confidence)
- WebSearch results verified with official documentation
- Multiple Gladia blog posts confirming feature capabilities

### Tertiary (LOW confidence)
- None - all findings verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official API documentation complete
- Architecture: HIGH - Clear patterns documented with examples
- Pitfalls: MEDIUM - Based on common API patterns and documentation gaps

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days for stable API)