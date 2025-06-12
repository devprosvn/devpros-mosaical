
// Main entry point - start the frontend development server
const { spawn } = require('child_process')

console.log('Starting Mosaical NFT Lending Platform...')

// Start the frontend development server
const frontendProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
})

frontendProcess.on('error', (error) => {
  console.error('Failed to start frontend:', error)
})

frontendProcess.on('close', (code) => {
  console.log(`Frontend process exited with code ${code}`)
})
