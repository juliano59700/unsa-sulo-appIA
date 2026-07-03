import { z } from 'zod'
import { GladiaClient } from '../lib/gladia.js'
import { env } from '../config/env.js'

const uploadInputSchema = z.object({
  filePath: z.string()
})

export const uploadTool = {
  definition: {
    name: 'upload_file',
    description: 'Upload an audio or video file to Gladia for transcription. Returns an upload URL that can be used with the transcribe tool.',
    inputSchema: {
      type: 'object',
      properties: {
        filePath: {
          type: 'string',
          description: 'Path to the audio or video file to upload'
        }
      },
      required: ['filePath']
    }
  },
  handler: async (arguments_: any) => {
    try {
      const { filePath } = uploadInputSchema.parse(arguments_)
      
      const client = new GladiaClient(env.GLADIA_API_KEY)
      const result = await client.uploadFile(filePath)
      
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ audio_url: result.audio_url })
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