exports.up = function (knex) {
  return knex.schema
    .createTable('ytdl_queue', (table) => {
      table.increments('id')
      table.string('url').notNullable()
      table.timestamps()
    })
    .createTable('chat_last_update', (table) => {
      table.integer('id').primary()
      table.integer('update_id')
      table.timestamps()
    })
}

exports.down = function (knex) {
  return knex.dropTable('ytdl_queue').dropTable('chat_last_update')
}
