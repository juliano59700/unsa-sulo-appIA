import { z } from 'zod'
import { GladiaClient } from '../lib/gladia.js'
import { env } from '../config/env.js'

const deleteJobInputSchema = z.object({
  jobId: z.string().uuid()
})

export const deleteJobTool = {
  definition: {
    name: 'delete_transcription_job',
    description: 'Delete a transcription job by ID. This permanently removes the job and all associated data. The job must be in a deletable state (completed or failed).',
    inputSchema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          description: 'The ID of the transcription job to delete'
        }
      },
      required: ['jobId']
    }
  },
  handler: async (arguments_: any) => {
    try {
      const { jobId } = deleteJobInputSchema.parse(arguments_)
      
      const client = new GladiaClient(env.GLADIA_API_KEY)
      await client.deleteTranscriptionJob(jobId)
      
      return {
        content: [{
          type: 'text',
          text: `Transcription job ${jobId} deleted successfully`
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