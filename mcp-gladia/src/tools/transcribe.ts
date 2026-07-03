import { z } from 'zod'
import { GladiaClient } from '../lib/gladia.js'
import { env } from '../config/env.js'
import { TranscriptionConfig } from '../types/gladia.js'

const transcribeInputSchema = z.object({
  audioUrl: z.string().url(),
  language: z.string().optional(),
  detectLanguage: z.boolean().optional().default(true),
  diarization: z.boolean().optional().default(false),
  diarizationConfig: z.object({
    numberOfSpeakers: z.number().optional(),
    minSpeakers: z.number().optional(),
    maxSpeakers: z.number().optional()
  }).optional(),
  subtitles: z.boolean().optional().default(false),
  subtitlesConfig: z.object({
    formats: z.array(z.enum(['srt', 'vtt']))
  }).optional(),
  customVocabulary: z.array(z.string()).optional(),
  summarization: z.boolean().optional().default(false),
  summarizationConfig: z.object({
    type: z.enum(['general', 'concise', 'bullet_points']).optional()
  }).optional(),
  sentimentAnalysis: z.boolean().optional().default(false),
  namedEntityRecognition: z.boolean().optional().default(false),
  chapterization: z.boolean().optional().default(false),
  translation: z.boolean().optional().default(false),
  translationConfig: z.object({
    targetLanguages: z.array(z.string()),
    model: z.enum(['base', 'enhanced']).optional()
  }).optional(),
  audioToLlm: z.boolean().optional().default(false),
  audioToLlmConfig: z.object({
    prompts: z.array(z.string())
  }).optional()
})

export const transcribeTool = {
  definition: {
    name: 'transcribe',
    description: 'Submit an audio file for transcription and automatically poll until completion. Supports language detection, diarization, subtitles, summarization, sentiment analysis, named entity recognition, chapterization, translation, and custom audio-to-LLM prompts. Returns completed transcription result or job ID if timeout occurs.',
    inputSchema: {
      type: 'object',
      properties: {
        audioUrl: {
          type: 'string',
          description: 'URL of the audio file to transcribe (from upload_file tool)'
        },
        language: {
          type: 'string',
          description: 'Language code (e.g. "en", "fr", "es"). Optional if detectLanguage is true'
        },
        detectLanguage: {
          type: 'boolean',
          description: 'Automatically detect language. Default: true',
          default: true
        },
        diarization: {
          type: 'boolean',
          description: 'Enable speaker diarization (who spoke when). Default: false',
          default: false
        },
        diarizationConfig: {
          type: 'object',
          description: 'Configuration for speaker diarization',
          properties: {
            numberOfSpeakers: {
              type: 'number',
              description: 'Expected number of speakers'
            },
            minSpeakers: {
              type: 'number',
              description: 'Minimum number of speakers'
            },
            maxSpeakers: {
              type: 'number',
              description: 'Maximum number of speakers'
            }
          }
        },
        subtitles: {
          type: 'boolean',
          description: 'Generate subtitle files. Default: false',
          default: false
        },
        subtitlesConfig: {
          type: 'object',
          description: 'Configuration for subtitle generation',
          properties: {
            formats: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['srt', 'vtt']
              },
              description: 'Subtitle formats to generate'
            }
          }
        },
        customVocabulary: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Custom vocabulary words to improve recognition'
        },
        summarization: {
          type: 'boolean',
          description: 'Enable summarization of the transcription. Default: false',
          default: false
        },
        summarizationConfig: {
          type: 'object',
          description: 'Configuration for summarization',
          properties: {
            type: {
              type: 'string',
              enum: ['general', 'concise', 'bullet_points'],
              description: 'Type of summary to generate'
            }
          }
        },
        sentimentAnalysis: {
          type: 'boolean',
          description: 'Enable sentiment and emotion analysis per segment. Default: false',
          default: false
        },
        namedEntityRecognition: {
          type: 'boolean',
          description: 'Enable named entity recognition (people, places, organizations). Default: false',
          default: false
        },
        chapterization: {
          type: 'boolean',
          description: 'Enable chapter detection with timestamps and descriptions. Default: false',
          default: false
        },
        translation: {
          type: 'boolean',
          description: 'Enable translation to target languages. Default: false',
          default: false
        },
        translationConfig: {
          type: 'object',
          description: 'Configuration for translation (required when translation is true)',
          properties: {
            targetLanguages: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Target language codes for translation (e.g. ["fr", "es"])'
            },
            model: {
              type: 'string',
              enum: ['base', 'enhanced'],
              description: 'Translation model quality. Default: base'
            }
          },
          required: ['targetLanguages']
        },
        audioToLlm: {
          type: 'boolean',
          description: 'Enable custom audio-to-LLM analysis prompts. Default: false',
          default: false
        },
        audioToLlmConfig: {
          type: 'object',
          description: 'Configuration for audio-to-LLM (required when audioToLlm is true)',
          properties: {
            prompts: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Custom prompts to run against the audio content'
            }
          },
          required: ['prompts']
        }
      },
      required: ['audioUrl']
    }
  },
  handler: async (arguments_: any) => {
    try {
      const input = transcribeInputSchema.parse(arguments_)
      
      // Map camelCase to snake_case for Gladia API
      const config: TranscriptionConfig = {
        language: input.language,
        detect_language: input.detectLanguage,
        diarization: input.diarization,
        diarization_config: input.diarizationConfig ? {
          number_of_speakers: input.diarizationConfig.numberOfSpeakers,
          min_speakers: input.diarizationConfig.minSpeakers,
          max_speakers: input.diarizationConfig.maxSpeakers
        } : undefined,
        subtitles: input.subtitles,
        subtitles_config: input.subtitlesConfig,
        custom_vocabulary: input.customVocabulary,
        summarization: input.summarization,
        summarization_config: input.summarizationConfig ? {
          type: input.summarizationConfig.type
        } : undefined,
        sentiment_analysis: input.sentimentAnalysis,
        named_entity_recognition: input.namedEntityRecognition,
        chapterization: input.chapterization,
        translation: input.translation,
        translation_config: input.translationConfig ? {
          target_languages: input.translationConfig.targetLanguages,
          model: input.translationConfig.model
        } : undefined,
        audio_to_llm: input.audioToLlm,
        audio_to_llm_config: input.audioToLlmConfig ? {
          prompts: input.audioToLlmConfig.prompts
        } : undefined
      }
      
      const client = new GladiaClient(env.GLADIA_API_KEY)
      const result = await client.transcribeAndWait(input.audioUrl, config)
      
      // Check if this is a timeout response with job ID
      if ('jobId' in result && 'message' in result) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              status: 'timeout',
              jobId: (result as any).jobId,
              message: (result as any).message
            })
          }]
        }
      }
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      }
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: error instanceof Error ? error.message : 'Unknown error occurred'
        }]
      }
    }
  }
}