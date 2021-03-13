exports.seed = function (knex) {
  return knex('chat_last_update')
    .del()
    .then(function () {
      return knex('chat_last_update').insert([
        {
          id: 1,
          update_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ])
    })
}
