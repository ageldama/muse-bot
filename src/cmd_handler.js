'use strict'

const lodash = require('lodash')
const voca = require('voca')
const { isEmpty } = require('./str_utils')

async function findScriptBySubstr(telegramClient, scripts, scriptSubstr) {
  const filtered = lodash.filter(
    scripts,
    (v) => voca.indexOf(v[1], scriptSubstr) >= 0
  )
  if (filtered.length === 1) {
    return filtered[0]
  }
  await telegramClient.sendMessage({
    NO_EXACT_MATCHING: scriptSubstr,
    RESULT: filtered
  })
  throw new Error(`No/Multiple script can be found by: ${scriptSubstr}`)
}

class CmdHandler {
  constructor(
    dbYtdlQueue,
    telegramClient,
    builtinsDir,
    scriptLister,
    processManager,
    schedRunner
  ) {
    this._dbYtdlQueue = dbYtdlQueue
    this._telegramClient = telegramClient
    this._builtinsDir = builtinsDir
    this._scriptLister = scriptLister
    this._processManager = processManager
    this._schedRunner = schedRunner
  }

  async cmdHelp() {
    const strs = [
      '[Bluetooth] bt-off, bt-stat',
      '[Volume] vol, vol NEW_VOL, mute, unmute, vup, vdn',
      '[System] reboot, poweroff, uptime, temp, df, mem',
      '[Process (1)] ps, kill PROC_ID',
      '[Process (2)] ls, spawn SCRIPT_ID [ARGV], run SCRIPT_ID [ARGV]',
      '[YTDL] ytdl URL, ytdq URL',
      '[Sched] sched, sched 0125, sched +45, sched c'
    ]
    await this._telegramClient.sendMessages('HELP', strs)
  }

  async cmdBtOff() {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/bt-off',
      []
    )
    await this._telegramClient.sendMessage(stdout)
  }

  async cmdBtStat() {
    let { stdout } = this._processManager.exec(
      this._builtinsDir + '/bt-stat',
      []
    )
    if (isEmpty(stdout)) stdout = '--- NO OUTPUT ---'
    await this._telegramClient.sendMessage(stdout)
  }

  async cmdVol({ volume = undefined }) {
    const argv = volume ? ['set=' + volume] : ['status']
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/volume',
      argv
    )
    await this._telegramClient.sendMessage('Vol: ' + stdout)
  }

  async cmdVolUp({ delta = undefined }) {
    const argv = ['up']
    // if (delta) argv = [`up=${delta}`]
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/volume',
      argv
    )
    await this._telegramClient.sendMessage('Vol-Up: ' + stdout)
  }

  async cmdVolDown({ delta = undefined }) {
    const argv = ['down']
    // if (delta) argv = [`down=${delta}`]
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/volume',
      argv
    )
    await this._telegramClient.sendMessage('Vol-Down: ' + stdout)
  }

  async cmdVolMute() {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/volume',
      ['mute']
    )
    await this._telegramClient.sendMessage('muted: ' + stdout)
  }

  async cmdVolUnmute() {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/volume',
      ['unmute']
    )
    await this._telegramClient.sendMessage('unmuted: ' + stdout)
  }

  async cmdTemperature() {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/temp',
      []
    )
    await this._telegramClient.sendMessage('temperature: ' + stdout)
  }

  async cmdDiskUsage() {
    const { stdout } = this._processManager.exec(this._builtinsDir + '/df', [])
    await this._telegramClient.sendMessage('df: ' + stdout)
  }

  async cmdMemoryUsage() {
    const { stdout } = this._processManager.exec(this._builtinsDir + '/mem', [])
    await this._telegramClient.sendMessage('mem: ' + stdout)
  }

  async cmdUptime() {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/uptime',
      []
    )
    await this._telegramClient.sendMessage('uptime: ' + stdout)
  }

  async cmdReboot() {
    await this._telegramClient.sendMessage('REBOOTING...')
    this._processManager.exec(this._builtinsDir + '/reboot', [])
  }

  async cmdPowerOff() {
    await this._telegramClient.sendMessage('SHUTTING DOWN...')
    this._processManager.exec(this._builtinsDir + '/poweroff', [])
  }

  async cmdListScripts() {
    const scripts = this._scriptLister()
    await this._telegramClient.sendMessages(
      'SCRIPTS',
      lodash.map(
        scripts,
        (script, idx) => `#${idx}: ${script[1]} (${script[0]})`
      )
    )
  }

  async cmdListProcesses() {
    const ps = []
    let idx = 0
    for (const proc of this._processManager.spawnedProcesses) {
      ps.push(`#${idx}: ${proc.pid} -- ${proc.prog}, ${proc.argv}`)
      idx++
    }
    await this._telegramClient.sendMessages('PS', ps)
  }

  async cmdKillProcess({ procId }) {
    this._processManager.kill(procId)
  }

  async cmdSpawnScript({ scriptId, scriptSubstr, argv }) {
    const scripts = this._scriptLister()
    let script
    if (scriptId) {
      script = scripts[scriptId]
    } else {
      script = await findScriptBySubstr(
        this._telegramClient,
        scripts,
        scriptSubstr
      )
    }
    //
    const entry = this._processManager.spawn(
      script[0] + '/' + script[1],
      argv,
      // onStdout
      (data) => console.log('[STDOUT] ' + data),
      // onStderr
      (data) => console.log('[STDERR] ' + data),
      // onExitCode
      (pid, entry, code) => {
        const msg = `[EXITED] with ${code}, PID:${pid}, ${entry.prog}, ${entry.argv}`
        console.log(msg)
        this._telegramClient.sendMessage(msg).then(() => {})
        //
        const idx = this._processManager.findIndexOfSpawnedProcessByPid(pid)
        // console.log('found proc-idx: ', idx)
        if (idx >= 0) this._processManager.deleteSpawnedProcessEntry(idx)
      }
    )
    await this._telegramClient.sendMessage(
      `Process PID:${entry.pid} ${entry.prog}, ${entry.argv} SPAWNED`
    )
  }

  async cmdRunScript({ scriptId, scriptSubstr, argv }) {
    const scripts = this._scriptLister()
    let script
    if (scriptId) {
      script = scripts[scriptId]
    } else {
      script = await findScriptBySubstr(
        this._telegramClient,
        scripts,
        scriptSubstr
      )
    }
    //
    await this._telegramClient.sendMessage({
      STARTING: new Date(),
      script,
      argv
    })
    const result = this._processManager.exec(script[0] + '/' + script[1], argv)
    await this._telegramClient.sendMessage({
      FINISHED: new Date(),
      result,
      script,
      argv
    })
  }

  async cmdYtdlQueue({ url }) {
    const { stdout } = this._processManager.exec(
      this._builtinsDir + '/ytdl-queue.sh',
      [url]
    )
    await this._telegramClient.sendMessage('ytdl-queue: ' + stdout)
  }

  async cmdYtdl({ url }) {
    const id = await this._dbYtdlQueue.insert(url)
    await this._telegramClient.sendMessage(`ytdl-added: #${id} -- ${url}`)
  }

  async cmdSched({ action = undefined }) {
    if (action) {
      if (action === 'c') {
        // clear
        this._schedRunner.clearSched()
      } else {
        // set abs||rel.
        this._schedRunner.schedule(action)
      }
    }
    // status
    if (this._schedRunner.at) {
      this._telegramClient.sendMessage(
        'SCHED: ' + this._schedRunner.at.toString()
      )
    } else {
      this._telegramClient.sendMessage('SCHED CLEARED')
    }
  }
}

async function routeCmd(cmd, cmdHandler, telegramClient) {
  console.log('CMD: ', cmd, new Date())
  const found = cmdHandler[cmd.type]
  if (found) {
    const result = await found.call(cmdHandler, cmd)
    console.log('FINISHED-CMD: ', cmd, new Date())
    return result
  }
  await telegramClient.sendMessage({
    error: 'no-cmd-handler',
    cmd
  })
}

module.exports = { CmdHandler, routeCmd }
