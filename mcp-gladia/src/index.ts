import { main } from './server.js'

main().catch((error) => {
  console.error('Error starting MCP server:', error)
  process.exit(1)
})