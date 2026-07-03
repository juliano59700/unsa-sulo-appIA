import { readFile, stat, realpath } from 'node:fs/promises'
import { extname, resolve } from 'node:path'
import { GladiaUploadResponse, GladiaErrorResponse, TranscriptionConfig, TranscriptionJobResponse, TranscriptionStatusResponse, ListJobsOptions, TranscriptionListResponse } from '../types/gladia.js'

const GLADIA_API_URL = 'https://api.gladia.io'
const MAX_FILE_SIZE = 1000 * 1024 * 1024
const SUPPORTED_FORMATS = ['.mp3', '.wav', '.m4a', '.mp4', '.mov', '.avi', '.flac']

export class GladiaClient {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async uploadFile(filePath: string): Promise<GladiaUploadResponse> {
    const resolvedPath = await realpath(resolve(filePath))
    const extension = extname(resolvedPath).toLowerCase()
    if (!SUPPORTED_FORMATS.includes(extension)) {
      throw new Error(`Unsupported file format: ${extension}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`)
    }

    const stats = await stat(resolvedPath)
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${stats.size} bytes. Maximum allowed: ${MAX_FILE_SIZE} bytes (1GB)`)
    }

    const fileBuffer = await readFile(resolvedPath)
    const formData = new FormData()
    const blob = new Blob([fileBuffer])
    formData.append('audio', blob, resolvedPath)

    const response = await fetch(`${GLADIA_API_URL}/v2/upload`, {
      method: 'POST',
      headers: {
        'x-gladia-key': this.apiKey
      },
      body: formData
    })

    if (!response.ok) {
      let errorMessage = `Upload failed: ${response.status} ${response.statusText}`
      try {
        const errorData: GladiaErrorResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage)
    }

    const result: GladiaUploadResponse = await response.json()
    return result
  }

  async startTranscription(audioUrl: string, config: TranscriptionConfig): Promise<TranscriptionJobResponse> {
    const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-gladia-key': this.apiKey
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        ...config
      })
    })

    if (!response.ok) {
      let errorMessage = `Transcription submission failed: ${response.status} ${response.statusText}`
      try {
        const errorData: GladiaErrorResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage)
    }

    const result: TranscriptionJobResponse = await response.json()
    return result
  }

  async getTranscriptionStatus(jobId: string): Promise<TranscriptionStatusResponse> {
    const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded/${jobId}`, {
      method: 'GET',
      headers: {
        'x-gladia-key': this.apiKey
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Transcription job ${jobId} not found`)
      }
      let errorMessage = `Failed to get transcription status: ${response.status} ${response.statusText}`
      try {
        const errorData: GladiaErrorResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage)
    }

    const result: TranscriptionStatusResponse = await response.json()
    return result
  }

  async transcribeAndWait(audioUrl: string, config: TranscriptionConfig): Promise<TranscriptionStatusResponse> {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    
    // Submit transcription job
    const job = await this.startTranscription(audioUrl, config)
    
    // Polling configuration
    let interval = 3000 // Start with 3 seconds
    const multiplier = 1.5
    const maxInterval = 15000 // Max 15 seconds
    const maxTime = 300000 // Max 5 minutes
    const startTime = Date.now()
    
    while (true) {
      // Check if we've exceeded the timeout
      if (Date.now() - startTime > maxTime) {
        // Return partial response with job ID for manual checking
        return {
          status: 'processing',
          result: undefined,
          // Add job ID for manual status checking
          ...{ jobId: job.id, message: 'Transcription timed out after 5 minutes. Use get_transcription_status to check manually.' }
        } as TranscriptionStatusResponse & { jobId: string; message: string }
      }
      
      try {
        const status = await this.getTranscriptionStatus(job.id)
        
        if (status.status === 'done') {
          return status
        }
        
        if (status.status === 'error') {
          throw new Error('Transcription failed with error status')
        }
        
        // Wait before next poll
        await sleep(interval)
        
        // Increase interval for exponential backoff
        interval = Math.min(interval * multiplier, maxInterval)
        
      } catch (error) {
        // If it's a status check error, re-throw
        throw error
      }
    }
  }

  async listTranscriptionJobs(options?: ListJobsOptions): Promise<TranscriptionListResponse> {
    const url = new URL(`${GLADIA_API_URL}/v2/transcription`)
    
    if (options) {
      if (options.offset !== undefined) {
        url.searchParams.set('offset', options.offset.toString())
      }
      if (options.limit !== undefined) {
        url.searchParams.set('limit', options.limit.toString())
      }
      if (options.status !== undefined) {
        url.searchParams.set('status', options.status)
      }
      if (options.after_date !== undefined) {
        url.searchParams.set('after_date', options.after_date)
      }
      if (options.before_date !== undefined) {
        url.searchParams.set('before_date', options.before_date)
      }
      if (options.kind !== undefined) {
        url.searchParams.set('kind', options.kind)
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-gladia-key': this.apiKey
      }
    })

    if (!response.ok) {
      let errorMessage = `Failed to list transcription jobs: ${response.status} ${response.statusText}`
      try {
        const errorData: GladiaErrorResponse = await response.json()
        errorMessage = errorData.error?.message || errorMessage
      } catch {
        // Use default error message if parsing fails
      }
      throw new Error(errorMessage)
    }

    const result: TranscriptionListResponse = await response.json()
    return result
  }

  async deleteTranscriptionJob(jobId: string): Promise<void> {
    const response = await fetch(`${GLADIA_API_URL}/v2/pre-recorded/${jobId}`, {
      method: 'DELETE',
      headers: {
        'x-gladia-key': this.apiKey
      }
    })

    if (response.status === 202) {
      // Successfully deleted
      return
    }

    if (response.status === 404) {
      throw new Error(`Transcription job ${jobId} not found`)
    }

    if (response.status === 403) {
      throw new Error(`Transcription job ${jobId} is not in a deletable state`)
    }

    // Handle other error responses
    let errorMessage = `Failed to delete transcription job: ${response.status} ${response.statusText}`
    try {
      const errorData: GladiaErrorResponse = await response.json()
      errorMessage = errorData.error?.message || errorMessage
    } catch {
      // Use default error message if parsing fails
    }
    throw new Error(errorMessage)
  }
}