export interface GladiaUploadResponse {
  audio_url: string
}

export interface GladiaErrorResponse {
  error: {
    message: string
    type: string
  }
}

export interface TranscriptionConfig {
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
  summarization?: boolean
  summarization_config?: {
    type?: 'general' | 'concise' | 'bullet_points'
  }
  sentiment_analysis?: boolean
  named_entity_recognition?: boolean
  chapterization?: boolean
  translation?: boolean
  translation_config?: {
    target_languages: string[]
    model?: 'base' | 'enhanced'
  }
  audio_to_llm?: boolean
  audio_to_llm_config?: {
    prompts: string[]
  }
}

export interface TranscriptionJobResponse {
  id: string
  result_url: string
}

export interface AudioIntelligenceResult<T> {
  success: boolean
  is_empty: boolean
  results: T
  exec_time: number
  error: string | null
}

export interface SentimentEntry {
  text: string
  sentiment: string
  emotion: string
  start: number
  end: number
  channel: number
  speaker: number
}

export interface ChapterEntry {
  summary: string
  headline: string
  gist: string
  start: number
  end: number
}

export interface TranscriptionStatusResponse {
  status: 'queued' | 'processing' | 'done' | 'error'
  result?: {
    transcription: {
      utterances: Array<{
        text: string
        speaker: number
        start: number
        end: number
      }>
    }
    summarization?: AudioIntelligenceResult<string>
    sentiment_analysis?: AudioIntelligenceResult<SentimentEntry[]>
    named_entity_recognition?: AudioIntelligenceResult<string>
    chapterization?: AudioIntelligenceResult<ChapterEntry[]>
    translation?: {
      error: string | null
      languages: string[]
      results: Array<{
        full_transcript: string
        languages: string[]
        utterances: Array<{
          text: string
          speaker: number
          start: number
          end: number
          language: string
          channel: number
        }>
      }>
    }
    audio_to_llm?: AudioIntelligenceResult<Array<{
      prompt: string | null
      response: string | null
    }>>
  }
}

export interface ListJobsOptions {
  offset?: number
  limit?: number
  status?: 'queued' | 'processing' | 'done' | 'error'
  after_date?: string
  before_date?: string
  kind?: 'pre-recorded' | 'live'
}

export interface TranscriptionJobItem {
  id: string
  status: 'queued' | 'processing' | 'done' | 'error'
  created_at: string
  language?: string
  duration?: number
  filename?: string
}

export interface TranscriptionListResponse {
  items: TranscriptionJobItem[]
  first: string
  current: string
  next?: string
  total_count: number
}