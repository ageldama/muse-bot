/**
 * @jest-environment ./tests/environments/knex.env.js
 */
const db = require('../src/db')

test('access to `db`', () => {
  expect(db).toBeDefined()
})

test('`insert`, `getOldest` and `delete` on `ytdl_queue`', async () => {
  const rowEmpty = await db.ytdlQueue.getOldest()
  expect(rowEmpty).not.toBeDefined()

  const url1 = 'https://foo.bar/zoo?spam=eggs'
  const url2 = 'https://foo.bar/zoo?quux'
  const insert1 = await db.ytdlQueue.insert(url1)
  const insert2 = await db.ytdlQueue.insert(url2)
  expect(insert1).toBeGreaterThan(0)
  expect(insert2).toBeGreaterThan(0)
  expect(insert2).toBeGreaterThan(insert1)

  const row1 = await db.ytdlQueue.getOldest()
  expect(row1).toBeDefined()
  expect(row1.id).toBe(insert1)
  expect(row1.url).toBe(url1)
  expect(row1.created_at).toBeDefined()
  expect(row1.updated_at).toBeDefined()

  await db.ytdlQueue.delete(insert1)
  await db.ytdlQueue.delete(insert2)

  const rowEmptyAgain = await db.ytdlQueue.getOldest()
  expect(rowEmptyAgain).not.toBeDefined()
})

test('`lastUpdateId` and `setLastUpdateId` on `chat_last_update`', async () => {
  const last1 = await db.chatUpdateId.last()
  expect(last1).toBeGreaterThan(0)

  const affected = await db.chatUpdateId.set(last1 + 123)
  expect(affected).toBeGreaterThan(0)

  const last2 = await db.chatUpdateId.last()
  expect(last2).toBeGreaterThan(123)
})
