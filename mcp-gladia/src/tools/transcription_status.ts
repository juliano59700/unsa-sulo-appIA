import { z } from 'zod'
import { GladiaClient } from '../lib/gladia.js'
import { env } from '../config/env.js'

const transcriptionStatusInputSchema = z.object({
  jobId: z.string().uuid()
})

export const transcriptionStatusTool = {
  definition: {
    name: 'get_transcription_status',
    description: 'Check the status of a previously submitted transcription job. Useful if the transcribe tool timed out or for monitoring long-running jobs.',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The job ID returned from a previous transcribe request'
        }
      },
      required: ['jobId']
    }
  },
  handler: async (arguments_: any) => {
    try {
      const { jobId } = transcriptionStatusInputSchema.parse(arguments_)
      
      const client = new GladiaClient(env.GLADIA_API_KEY)
      const result = await client.getTranscriptionStatus(jobId)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(result)
        }]
      }
    } catch (error) {
      // Handle 404 specifically for job not found
      if (error instanceof Error && error.message.includes('not found')) {
        return {
          isError: true,
          content: [{
            type: 'text',
            text: `Transcription job not found. Please check the job ID: ${arguments_.jobId || 'undefined'}`
          }]
        }
      }
      
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