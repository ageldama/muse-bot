'use strict'
require('dotenv').config()
const process = require('process')

const glob = require('./src/globber')
const db = require('./src/db')
const { TelegramClient } = require('./src/telegram_client')
const { ProcessManager } = require('./src/proc_manager')
const { CmdHandler } = require('./src/cmd_handler')
const { runInits } = require('./src/init_runner')
const { startChatCmdLoop } = require('./src/cmd_loop')
const { SchedRunner } = require('./src/sched')
const { YtdlWorker } = require('./src/ytdl_worker')

;(async () => {
  // globbers
  const initGlob = () => glob(process.env.INIT_0_DIR, process.env.INIT_1_DIR)
  const scriptGlob = () =>
    glob(process.env.SCRIPT_0_DIR, process.env.SCRIPT_1_DIR)

  // telegram-client
  const telegramClient = new TelegramClient(
    process.env.TELEGRAM_BOT_API_ID,
    process.env.TELEGRAM_CHAT_ID,
    db.chatUpdateId
  )

  // proc-manager
  const procManager = new ProcessManager()

  // sched-runner
  const schedRunner = new SchedRunner()

  // cmd-handler
  const cmdHandler = new CmdHandler(
    db.ytdlQueue,
    telegramClient,
    process.env.BUILTINS_DIR,
    scriptGlob,
    procManager,
    schedRunner
  )

  // execute `inits*.d`
  runInits(initGlob, telegramClient, procManager)

  // start telegram-chat-update interval
  startChatCmdLoop(process.env.CMD_INTERVAL_SECS, telegramClient, cmdHandler)

  // start sched-runner
  schedRunner.start(() => {
    cmdHandler.cmdPowerOff()
  })

  // start ytdl-worker
  const ytdlWorker = new YtdlWorker(
    db.ytdlQueue,
    procManager,
    process.env.BUILTINS_DIR
  )
  ytdlWorker.start()

  // Hello
  await telegramClient.sendMessage('STARTED')
})()
