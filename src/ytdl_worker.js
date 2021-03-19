'use strict'
const { Mutex } = require('async-mutex')

class YtdlWorker {
  constructor(dbYtdlQueue, processManager, builtinsDir) {
    this.dbYtdlQueue = dbYtdlQueue
    this.processManager = processManager
    this.builtinsDir = builtinsDir
    this.intervalId = null
    this.proc = null
  }

  _spawnYtdl(ytdlEntry) {
    this.proc = this.processManager.spawn(
      this.builtinsDir + '/ytdl.sh',
      [ytdlEntry.url],
      // onStdout
      (data) => console.log('[ytdl:STDOUT] ' + data),
      // onStderr
      (data) => console.log('[ytdl:STDERR] ' + data),
      // onExitCode
      (pid, entry, code) => {
        console.log(
          `[ytdl:EXITED] with ${code}, PID:${pid}, ${entry.prog}, ${entry.argv}`
        )
        //
        const idx = this.processManager.findIndexOfSpawnedProcessByPid(pid)
        if (idx >= 0) this.processManager.deleteSpawnedProcessEntry(idx)
      }
    )
    return this.proc
  }

  start(seconds = 10) {
    const mutex = new Mutex()
    this.intervalId = setInterval(() => {
      mutex.runExclusive(() => {
        // 다른 프로세스 실행 중?
        if (this.proc && !this.proc.exited) {
          return
        }
        //
        return this.dbYtdlQueue.getOldest().then((ytdlEntry) => {
          if (ytdlEntry) {
            this._spawnYtdl(ytdlEntry)
            return this.dbYtdlQueue.delete(ytdlEntry.id)
          }
        })
      })
    }, seconds * 1000)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

module.exports = { YtdlWorker }
