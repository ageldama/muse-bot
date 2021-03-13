'use strict'
const axios = require('axios')
const querystring = require('querystring')
const lodash = require('lodash')

class TelegramClient {
  constructor(botApiKey, botChatId, dbChatUpdateId) {
    this._botApiKey = botApiKey
    this._botChatId = botChatId
    this._dbChatUpdateId = dbChatUpdateId
  }

  async sendMessages(tag, strs) {
    const plist = []
    const len = strs.length
    plist.push(this.sendMessage(`--- START OF ${tag}, items#=${len} ---`))
    plist.push(this.sendMessage(`--- END OF ${tag} ---`))
    let cur = 1
    for (const str of strs) {
      plist.push(this.sendMessage(`${cur} of ${len}, ` + str))
      cur++
    }
    return await Promise.all(plist)
  }

  async sendMessage(strOrJson) {
    let msg = strOrJson
    if (typeof msg !== 'string') {
      msg = JSON.stringify(strOrJson)
    }

    const qs = querystring.escape(msg)
    const url = `https://api.telegram.org/${this._botApiKey}/sendmessage?chat_id=${this._botChatId}&text=${qs}`

    return await axios.get(url)
  }

  async getUpdates() {
    const lastUpdateId = await this._dbChatUpdateId.last()

    const url = `https://api.telegram.org/${this._botApiKey}/getUpdates?offset=${lastUpdateId}`
    // console.log('URL:', url)
    const res = await axios.get(url)
    if (res.status !== 200) return []

    //
    const updates = lodash.orderBy(res.data.result, ['update_id'], ['asc'])

    //
    let newUpdateId

    if (updates.length > 0) {
      const lastUpdate = updates[updates.length - 1]
      newUpdateId = lastUpdate.update_id
    }

    // console.log('new-update-id:', newUpdateId)

    if (newUpdateId) {
      await this._dbChatUpdateId.set(newUpdateId + 1)
    }

    return updates
  }
}

module.exports = {
  TelegramClient
}
