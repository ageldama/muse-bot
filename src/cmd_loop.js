'use strict'

const { parseCmd } = require('./cmd_parser')
const { routeCmd } = require('./cmd_handler')
const { resolveOrCatch } = require('./promise_utils')

function startChatCmdLoop(intervalSecs, telegramClient, cmdHandler) {
  let running = false
  return setInterval(() => {
    if (running) {
      // 중복해서 실행중인 커맨드를 또 fetch하지 않도록.
      return
    }
    running = true
    //
    telegramClient
      .getUpdates()
      .then((updates) => {
        updates.forEach((update) => {
          resolveOrCatch(
            routeCmd(parseCmd(update.message.text), cmdHandler, telegramClient),
            (err) => {
              console.log('ERR', err)
              // resolveOrCatch(telegramClient.sendMessage(`ERR: ${err}`))
            }
          )
        })
      })
      .catch((err) => {
        console.log('ERR', err)
        // resolveOrCatch(telegramClient.sendMessage(`ERR: ${err}`))
      })
      .finally(() => (running = false))
  }, intervalSecs * 1000)
}

module.exports = { startChatCmdLoop }
