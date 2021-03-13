module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './db/development.sqlite3'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  test: {
    client: 'sqlite3',
    connection: {
      filename: './db/test.sqlite3'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './db/production.sqlite3'
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
}
