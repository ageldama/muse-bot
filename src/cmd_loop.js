'use strict'

const { withTimeout, Mutex } = require('async-mutex')
const { parseCmd } = require('./cmd_parser')
const { routeCmd } = require('./cmd_handler')
const { resolveOrCatch } = require('./promise_utils')

function procUpdate(cmdHandler, telegramClient, update) {
  resolveOrCatch(
    routeCmd(parseCmd(update.message.text), cmdHandler, telegramClient),
    (err) => {
      console.log('ERR', err)
    }
  )
}

function startChatCmdLoop(intervalSecs, telegramClient, cmdHandler) {
  const mutex = withTimeout(new Mutex(), 10 * 1000)
  return setInterval(() => {
    mutex
      .runExclusive(() => telegramClient.getUpdates())
      .then((updates) => {
        updates.forEach((update) =>
          procUpdate(cmdHandler, telegramClient, update)
        )
        // returns nothing
      })
      .catch((err) => {
        console.log('ERR', err)
        // resolveOrCatch(telegramClient.sendMessage(`ERR: ${err}`))
      })
  }, intervalSecs * 1000)
}

module.exports = { startChatCmdLoop }
