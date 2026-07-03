import { z } from 'zod'
import { GladiaClient } from '../lib/gladia.js'
import { env } from '../config/env.js'

const listJobsInputSchema = z.object({
  offset: z.number().optional(),
  limit: z.number().optional().default(20),
  status: z.enum(['queued', 'processing', 'done', 'error']).optional(),
  afterDate: z.string().optional(),
  beforeDate: z.string().optional(),
  kind: z.enum(['pre-recorded', 'live']).optional()
})

export const listJobsTool = {
  definition: {
    name: 'list_transcription_jobs',
    description: 'List transcription jobs with optional filtering by status, date range, and type. Shows job ID, status, creation date, and metadata for monitoring transcription history.',
    inputSchema: {
      type: 'object',
      properties: {
        offset: {
          type: 'number',
          description: 'Number of jobs to skip for pagination'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of jobs to return (default: 20)'
        },
        status: {
          type: 'string',
          enum: ['queued', 'processing', 'done', 'error'],
          description: 'Filter jobs by status'
        },
        afterDate: {
          type: 'string',
          description: 'Filter jobs created after this date (ISO 8601 format)'
        },
        beforeDate: {
          type: 'string',
          description: 'Filter jobs created before this date (ISO 8601 format)'
        },
        kind: {
          type: 'string',
          enum: ['pre-recorded', 'live'],
          description: 'Filter jobs by type'
        }
      }
    }
  },
  handler: async (arguments_: any) => {
    try {
      const { offset, limit, status, afterDate, beforeDate, kind } = listJobsInputSchema.parse(arguments_)
      
      const client = new GladiaClient(env.GLADIA_API_KEY)
      
      // Map camelCase to snake_case for API
      const options = {
        offset,
        limit,
        status,
        after_date: afterDate,
        before_date: beforeDate,
        kind
      }
      
      // Remove undefined values
      const filteredOptions = Object.fromEntries(
        Object.entries(options).filter(([_, value]) => value !== undefined)
      )
      
      const result = await client.listTranscriptionJobs(filteredOptions)
      
      // Format the response for better readability
      const formattedJobs = result.items.map(job => ({
        id: job.id,
        status: job.status,
        created_at: job.created_at,
        language: job.language || 'N/A',
        duration: job.duration ? `${job.duration}s` : 'N/A',
        filename: job.filename || 'N/A'
      }))
      
      const responseText = JSON.stringify({
        jobs: formattedJobs,
        pagination: {
          total_count: result.total_count,
          current_page: result.current,
          next_page: result.next || null
        }
      }, null, 2)
      
      return {
        content: [{
          type: 'text',
          text: responseText
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