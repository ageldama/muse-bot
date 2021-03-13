async function runInits(initGlob, telegramClient, procManager) {
  const initScripts = initGlob()
  let initCur = 1
  const initLen = initScripts.length
  initScripts.forEach(async (script) => {
    await telegramClient.sendMessage({
      CUR: `${initCur} of ${initLen}`,
      INIT_STARTING: new Date(),
      script
    })
    const result = procManager.exec(script[0] + '/' + script[1], [])
    await telegramClient.sendMessage({
      CUR: `${initCur} of ${initLen}`,
      INIT_FINISHED: new Date(),
      result,
      script
    })
    initCur++
  })
}

module.exports = { runInits }
