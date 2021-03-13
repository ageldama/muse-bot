const fs = require('fs')
const NodeEnvironment = require('jest-environment-node')
const knexConfig = require('../../knexfile').test
const Knex = require('knex')

class Sqlite3KnexNodeEnvironment extends NodeEnvironment {
  deleteDbFile() {
    try {
      fs.unlinkSync(knexConfig.connection.filename)
    } catch (err) {}
  }

  async setup() {
    await super.setup()
    //
    this.deleteDbFile()
    this._knex = Knex(knexConfig)
    //
    try {
      await this._knex.migrate.latest()
    } catch (err) {
      console.log('[ENV] migration fail', err)
    }
    try {
      await this._knex.seed.run()
    } catch (err) {
      console.log('[ENV] seeding fail', err)
    }
    //
    this.global.knex = this._knex
  }

  async teardown() {
    this.global.knex.client.pool.destroy()
    this.global.knex = null
    this._knex = null
    await super.teardown()
  }

  dispose() {}
}

module.exports = Sqlite3KnexNodeEnvironment
