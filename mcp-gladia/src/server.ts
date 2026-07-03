import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { env } from './config/env.js'
import { uploadTool } from './tools/upload.js'
import { transcribeTool } from './tools/transcribe.js'
import { transcriptionStatusTool } from './tools/transcription_status.js'
import { listJobsTool } from './tools/list_jobs.js'
import { deleteJobTool } from './tools/delete_job.js'

export const server = new Server({
  name: 'mcp-gladia',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
})

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [uploadTool.definition, transcribeTool.definition, transcriptionStatusTool.definition, listJobsTool.definition, deleteJobTool.definition]
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'upload_file') {
    return await uploadTool.handler(request.params.arguments)
  }
  
  if (request.params.name === 'transcribe') {
    return await transcribeTool.handler(request.params.arguments)
  }
  
  if (request.params.name === 'get_transcription_status') {
    return await transcriptionStatusTool.handler(request.params.arguments)
  }
  
  if (request.params.name === 'list_transcription_jobs') {
    return await listJobsTool.handler(request.params.arguments)
  }
  
  if (request.params.name === 'delete_transcription_job') {
    return await deleteJobTool.handler(request.params.arguments)
  }
  
  return {
    isError: true,
    content: [{
      type: "text",
      text: `Unknown tool: ${request.params.name}`
    }]
  }
})

export async function main() {
  try {
    // Validate environment on startup
    console.error(`Starting MCP Gladia server (NODE_ENV: ${env.NODE_ENV})`)
    console.error('API key configured: yes')
    
    const transport = new StdioServerTransport()
    await server.connect(transport)
    
    console.error('MCP Gladia server running on stdio')
  } catch (error) {
    console.error('Failed to start MCP server:', error)
    process.exit(1)
  }
}

process.on('unhandledRejection', (error: unknown) => {
  console.error('Unhandled promise rejection:', error)
  process.exit(1)
})

process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})