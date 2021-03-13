'use strict'
const assert = require('assert')
const { DateTime } = require('luxon')
const { parseCmd } = require('./cmd_parser')
const { routeCmd } = require('./cmd_handler')
const { resolveOrCatch } = require('./promise_utils')

class SchedRunner {
  constructor() {
    this.at = null
    this.intervalId = null
    this.scmd = 'poweroff'
  }

  clearSched() {
    this.at = null
  }

  schedule(s) {
    if (s.startsWith('+')) return this.scheduleRel(s)
    return this.scheduleAbs(s)
  }

  scheduleAbs(absHourMinStr) {
    assert(this.at === null || this.at === undefined)
    const m = absHourMinStr.match(/(\d{2})(\d{2})/)
    if (m[1] && m[2]) {
      let dt = DateTime.now().set({ hour: Number(m[1]), minute: Number(m[2]) })
      if (dt < DateTime.now()) {
        // 내일 시각으로 고치기
        dt = dt.plus({ day: 1 })
      }
      this.at = dt
    } else {
      throw Error(`Invalid absolute date-time format: ${absHourMinStr}`)
    }
  }

  scheduleRel(relHourMinStr) {
    assert(this.at === null || this.at === undefined)
    const m = relHourMinStr.match(/\+(\d+)/)
    if (m[1]) {
      this.at = DateTime.now().plus({
        minute: Number(m[1])
      })
    } else {
      throw Error(`Invalid relative date-time format: ${relHourMinStr}`)
    }
  }

  start(cmdHandler, telegramClient, seconds = 60) {
    this.intervalId = setInterval(() => {
      const now = DateTime.now()
      if (this.at && now > this.at) {
        this.stop()
        //
        resolveOrCatch(
          routeCmd(parseCmd(this.scmd), cmdHandler, telegramClient),
          (err) => {
            console.log('ERR', err)
          }
        )
      }
    }, seconds * 1000)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}

module.exports = { SchedRunner }
