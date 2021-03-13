require('dotenv').config()
const knex = require('knex')(
  require('../knexfile.js')[process.env.NODE_ENV || 'development']
)

const db = {
  ytdlQueue: {
    insert: async (url) =>
      (
        await knex('ytdl_queue').insert({
          url: url,
          created_at: new Date(),
          updated_at: new Date()
        })
      )[0],

    delete: async (id) => await knex('ytdl_queue').where('id', id).del(),

    getOldest: async () => knex.from('ytdl_queue').orderBy('id', 'asc').first()
  },

  chatUpdateId: {
    last: async () => {
      const row = await knex
        .select('update_id')
        .from('chat_last_update')
        .first()
      if (row) return row.update_id
      return null
    },

    set: async (updateId) =>
      await knex('chat_last_update').update({
        update_id: updateId
      })
  }
}

module.exports = db
