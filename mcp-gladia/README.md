# mcp-gladia

MCP server for [Gladia](https://gladia.io) audio transcription and intelligence. Enables LLMs to transcribe, analyze, and translate audio/video content through Gladia's API.

## Getting Your API Key

1. Sign up at [app.gladia.io](https://app.gladia.io)
2. Navigate to the [API Keys section](https://app.gladia.io/apikeys)
3. A default API key is automatically created for new accounts

Gladia offers **10 hours of free audio transcription per month**. No credit card required.

## Installation

```bash
npm install mcp-gladia
```

Or run directly:

```bash
npx mcp-gladia
```

## Configuration

Set your Gladia API key as an environment variable:

```bash
export GLADIA_API_KEY=your-api-key-here
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "gladia": {
      "command": "npx",
      "args": ["mcp-gladia"],
      "env": {
        "GLADIA_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add gladia -- npx mcp-gladia
```

Then set your API key in the environment or `.env` file.

### Other MCP Clients

Any MCP-compatible client can use this server via stdio transport. Set the command to `npx mcp-gladia` and provide `GLADIA_API_KEY` as an environment variable.

## Tools

### upload_file

Upload an audio/video file to Gladia for transcription.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the audio/video file |

Supported formats: mp3, wav, m4a, mp4, mov, avi, flac (max 1GB).

### transcribe

Submit an audio file for transcription with automatic polling until completion. Supports all Gladia audio intelligence features. Returns the completed result or a job ID if timeout occurs (5 min).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| audioUrl | string | Yes | URL from upload_file |
| language | string | No | Language code (e.g. `en`, `fr`). See [supported languages](#supported-languages) |
| detectLanguage | boolean | No | Auto-detect language (default: true) |
| diarization | boolean | No | Enable speaker identification |
| diarizationConfig | object | No | `{ numberOfSpeakers?, minSpeakers?, maxSpeakers? }` |
| subtitles | boolean | No | Generate subtitle files |
| subtitlesConfig | object | No | `{ formats: ["srt", "vtt"] }` |
| customVocabulary | string[] | No | Custom words to improve recognition |
| summarization | boolean | No | Enable transcription summary |
| summarizationConfig | object | No | `{ type: "general" \| "concise" \| "bullet_points" }` |
| sentimentAnalysis | boolean | No | Enable sentiment/emotion analysis |
| namedEntityRecognition | boolean | No | Enable entity detection |
| chapterization | boolean | No | Enable chapter detection with timestamps |
| translation | boolean | No | Enable translation |
| translationConfig | object | No | `{ targetLanguages: ["fr", "es"], model?: "base" \| "enhanced" }` |
| audioToLlm | boolean | No | Enable custom LLM analysis |
| audioToLlmConfig | object | No | `{ prompts: ["your question about the audio"] }` |

### get_transcription_status

Check the status of a transcription job (useful for long-running jobs that timed out).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string (UUID) | Yes | Job ID from a previous transcribe request |

### list_transcription_jobs

List past transcription jobs with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| offset | number | No | Pagination offset |
| limit | number | No | Max results (default: 20) |
| status | string | No | Filter: `queued`, `processing`, `done`, `error` |
| afterDate | string | No | Filter by creation date (ISO 8601) |
| beforeDate | string | No | Filter by creation date (ISO 8601) |
| kind | string | No | Filter: `pre-recorded`, `live` |

### delete_transcription_job

Delete a transcription job and its data.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jobId | string (UUID) | Yes | Job ID to delete |

## Audio Intelligence Features

All intelligence features are enabled as options on the `transcribe` tool and processed server-side by Gladia.

### Summarization

Generate a summary of the transcription in one of three formats:

| Type | Description |
|------|-------------|
| `general` | Balanced, comprehensive summary (default) |
| `concise` | Short overview of key points |
| `bullet_points` | Key takeaways as a bullet list |

```json
{ "summarization": true, "summarizationConfig": { "type": "bullet_points" } }
```

### Sentiment & Emotion Analysis

Detect sentiment and emotion for each sentence in the transcript, with speaker attribution when diarization is enabled.

**Sentiments:** `positive`, `negative`, `neutral`, `mixed`, `unknown`

**Emotions:** `adoration`, `anger`, `joy`, `fear`, `surprise`, `sadness`, `neutral`, and more

```json
{ "sentimentAnalysis": true }
```

### Named Entity Recognition

Detect and classify entities mentioned in the audio. Supports 50+ entity types across multiple categories:

| Category | Entity Types |
|----------|-------------|
| PII | Name, Email, Phone Number, SSN |
| Location | City, Country, Address |
| Medical (PHI) | Conditions, Drugs, Injuries |
| Financial | Bank Account, Credit Card |
| Demographic | Age, Gender, Occupation |
| Temporal | Date, Time |

Supports GDPR, HIPAA, and CPRA compliance workflows.

```json
{ "namedEntityRecognition": true }
```

### Chapterization

Automatically segment audio into logical chapters. Each chapter includes:

- **Summary** — overview of the chapter content
- **Headline** — short title
- **Gist** — one-line bottom line
- **Keywords** — key terms mentioned
- **Timestamps** — start and end times

```json
{ "chapterization": true }
```

### Translation

Translate transcriptions to one or more target languages.

| Model | Description |
|-------|-------------|
| `base` | Fast translation, covers most use cases |
| `enhanced` | Higher quality, better for complex content |

```json
{ "translation": true, "translationConfig": { "targetLanguages": ["fr", "es"], "model": "enhanced" } }
```

### Audio-to-LLM (Custom Prompts)

Run custom analysis prompts directly against the audio content. No need to post-process transcripts with a separate LLM.

```json
{
  "audioToLlm": true,
  "audioToLlmConfig": {
    "prompts": [
      "Extract the key decisions made in this meeting",
      "What are the action items and who is responsible?"
    ]
  }
}
```

### Speaker Diarization

Identify and separate speakers in the audio. Output includes speaker labels on every utterance.

```json
{
  "diarization": true,
  "diarizationConfig": { "minSpeakers": 2, "maxSpeakers": 5 }
}
```

## Supported Languages

100+ languages supported for transcription. Use the language code with the `language` parameter, or set `detectLanguage: true` (default) for automatic detection.

| Language | Code | | Language | Code | | Language | Code |
|----------|------|-|----------|------|-|----------|------|
| Afrikaans | `af` | | Hawaiian | `haw` | | Persian | `fa` |
| Albanian | `sq` | | Hebrew | `he` | | Polish | `pl` |
| Amharic | `am` | | Hindi | `hi` | | Portuguese | `pt` |
| Arabic | `ar` | | Hungarian | `hu` | | Punjabi | `pa` |
| Armenian | `hy` | | Icelandic | `is` | | Romanian | `ro` |
| Assamese | `as` | | Indonesian | `id` | | Russian | `ru` |
| Azerbaijani | `az` | | Italian | `it` | | Sanskrit | `sa` |
| Bashkir | `ba` | | Japanese | `ja` | | Serbian | `sr` |
| Basque | `eu` | | Javanese | `jw` | | Shona | `sn` |
| Belarusian | `be` | | Kannada | `kn` | | Sindhi | `sd` |
| Bengali | `bn` | | Kazakh | `kk` | | Sinhala | `si` |
| Bosnian | `bs` | | Khmer | `km` | | Slovak | `sk` |
| Breton | `br` | | Korean | `ko` | | Slovenian | `sl` |
| Bulgarian | `bg` | | Lao | `lo` | | Somali | `so` |
| Catalan | `ca` | | Latin | `la` | | Spanish | `es` |
| Chinese | `zh` | | Latvian | `lv` | | Sundanese | `su` |
| Croatian | `hr` | | Lingala | `ln` | | Swahili | `sw` |
| Czech | `cs` | | Lithuanian | `lt` | | Swedish | `sv` |
| Danish | `da` | | Luxembourgish | `lb` | | Tagalog | `tl` |
| Dutch | `nl` | | Macedonian | `mk` | | Tajik | `tg` |
| English | `en` | | Malagasy | `mg` | | Tamil | `ta` |
| Estonian | `et` | | Malay | `ms` | | Tatar | `tt` |
| Faroese | `fo` | | Malayalam | `ml` | | Telugu | `te` |
| Finnish | `fi` | | Maltese | `mt` | | Thai | `th` |
| French | `fr` | | Maori | `mi` | | Tibetan | `bo` |
| Galician | `gl` | | Marathi | `mr` | | Turkish | `tr` |
| Georgian | `ka` | | Mongolian | `mn` | | Turkmen | `tk` |
| German | `de` | | Myanmar | `my` | | Ukrainian | `uk` |
| Greek | `el` | | Nepali | `ne` | | Urdu | `ur` |
| Gujarati | `gu` | | Norwegian | `no` | | Uzbek | `uz` |
| Haitian Creole | `ht` | | Nynorsk | `nn` | | Vietnamese | `vi` |
| Hausa | `ha` | | Occitan | `oc` | | Welsh | `cy` |
| | | | Pashto | `ps` | | Wolof | `wo` |
| | | | | | | Yiddish | `yi` |
| | | | | | | Yoruba | `yo` |

## Usage Examples

### Basic Transcription

```
Upload my-recording.mp3 and transcribe it
```

### Meeting with Multiple Speakers

```
Transcribe this meeting recording with diarization enabled, expecting 3-5 speakers.
Generate a bullet-point summary and extract action items using audio-to-LLM.
```

### Multilingual Content Analysis

```
Transcribe this podcast, detect the language, translate to English and French,
and run sentiment analysis on the conversation.
```

### Compliance & Entity Detection

```
Transcribe this customer call with named entity recognition to identify
any PII mentioned (names, emails, phone numbers).
```

### Custom Audio Analysis

```
Transcribe this earnings call and use audio-to-LLM with these prompts:
- "What are the key financial metrics mentioned?"
- "What is the company's guidance for next quarter?"
- "Summarize the Q&A section"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `GLADIA_API_KEY is required` | Set the `GLADIA_API_KEY` environment variable |
| `Unsupported file format` | Use mp3, wav, m4a, mp4, mov, avi, or flac |
| `File too large` | Files must be under 1GB |
| Transcription timeout | Use `get_transcription_status` with the returned job ID |
| Translation fails | Ensure `translationConfig.targetLanguages` is provided |
| `Invalid uuid` | Job IDs must be valid UUIDs (from transcribe or list_transcription_jobs) |

## Development

```bash
git clone https://github.com/gladiaio/mcp-gladia.git
cd mcp-gladia
npm install
npm run build
npm run dev
```

Requires Node.js 18+.

## Links

- [Gladia Website](https://gladia.io)
- [Gladia Documentation](https://docs.gladia.io)
- [Get API Key](https://app.gladia.io/apikeys)
- [GitHub Repository](https://github.com/gladiaio/mcp-gladia)

## License

MIT
