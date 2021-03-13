const process = require('process')
const { spawn } = require('child_process')
const lodash = require('lodash')

const proc = spawn('./block.sh', {
  detached: false
})

proc.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`)
})

proc.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`)
})

proc.on('close', (code) => {
  console.log(`child process exited with code ${code}`)
})

console.log('PID: ', proc.pid)

setInterval(() => {
  if (lodash.isUndefined(proc.exitCode) || lodash.isNull(proc.exitCode)) {
    console.log('waiting...')
  } else {
    console.log('bye', proc.exitCode)
    process.exit()
  }
}, 1000)
