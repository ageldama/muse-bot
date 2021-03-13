'use strict'

class YtdlWorker {
  constructor(dbYtdlQueue, processManager, builtinsDir) {
    this.dbYtdlQueue = dbYtdlQueue
    this.processManager = processManager
    this.builtinsDir = builtinsDir
    this.intervalId = null
  }

  start(seconds = 10) {
    let running = false
    this.intervalId = setInterval(() => {
      if (running) return
      running = true
      //
      this.dbYtdlQueue
        .getOldest()
        .then((ytdlEntry) => {
          if (ytdlEntry) {
            // spawn ytdl
            this.processManager.spawn(
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
                const idx = this.processManager.findIndexOfSpawnedProcessByPid(
                  pid
                )
                if (idx >= 0) this.processManager.deleteSpawnedProcessEntry(idx)
              }
            )
            //
            return this.dbYtdlQueue.delete(ytdlEntry.id)
          }
          return null
        })
        .then(() => {})
        .finally(() => (running = false))
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
