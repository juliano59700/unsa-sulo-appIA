import { z } from 'zod'

const envSchema = z.object({
  GLADIA_API_KEY: z
    .string()
    .min(1, 'GLADIA_API_KEY is required and cannot be empty'),
  NODE_ENV: z
    .enum(['development', 'production'])
    .default('production')
})

export type Environment = z.infer<typeof envSchema>

export function validateEnvironment() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const gladiaKeyIssue = error.issues.find(issue => 
        issue.path.includes('GLADIA_API_KEY')
      )
      if (gladiaKeyIssue) {
        console.error('Error: GLADIA_API_KEY environment variable is required')
        console.error('Please set your Gladia API key:')
        console.error('  export GLADIA_API_KEY=your_api_key_here')
        process.exit(1)
      }
    }
    throw error
  }
}

export const env = validateEnvironment()