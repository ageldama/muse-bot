'use strict'

const childProcess = require('child_process')
const lodash = require('lodash')
const treeKill = require('tree-kill')

class ProcessManager {
  constructor(runTimeoutSecs = 15) {
    this._spawnedProcesses = []
    this.runTimeoutSecs = runTimeoutSecs
  }

  exec(prog, argv) {
    try {
      const runOpts = {
        encoding: 'utf8',
        timeout: 1000 * this.runTimeoutSecs
      }
      const stdout = childProcess.execFileSync(prog, argv, runOpts)
      return {
        stdout: stdout.toString('utf8'),
        stderr: '--- TRUNCATED ---',
        exitCode: 0
      }
    } catch (err) {
      return {
        stdout: err.output[1].toString('utf8'),
        stderr: err.output[2].toString('utf8'),
        exitCode: err.status
      }
    }
  }

  spawn(prog, argv, onStdout, onStderr, onExitCode) {
    const proc = childProcess.spawn(prog, argv, {
      detached: false
    })

    proc.stdout.on('data', onStdout)
    proc.stderr.on('data', onStderr)

    const pid = proc.pid
    const entry = {
      pid,
      proc,
      prog,
      argv,
      exitCode: null,
      exited: false
    }

    proc.on('error', (err) => {
      entry.exited = true
      console.log('spawn error', err)
    })

    this._spawnedProcesses.push(entry)

    proc.on('close', (code) => {
      entry.exited = true
      entry.exitCode = code
      onExitCode(entry.pid, entry, code)
    })

    return entry
  }

  get spawnedProcesses() {
    return this._spawnedProcesses
  }

  deleteSpawnedProcessEntry(index) {
    return lodash.pullAt(this._spawnedProcesses, index)
  }

  findIndexOfSpawnedProcessByPid(pid) {
    for (let idx = 0; idx < this._spawnedProcesses.length; idx++) {
      const entry = this._spawnedProcesses[idx]
      if (entry.pid === pid) return idx
    }
    return -1
  }

  kill(idx) {
    const entry = this._spawnedProcesses[idx]
    if (entry && !entry.exited) {
      treeKill(entry.pid)
    }
    return entry
  }
}

module.exports = {
  ProcessManager
}
