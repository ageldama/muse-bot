const glob = require('../src/globber')

test('glob is a function', () => {
  expect(glob).toBeDefined()
})

test('glob return results in lexicographical order', () => {
  const result = glob('./tests/fixtures/glob', './tests/fixtures/glob2')
  expect(result).toEqual([
    ['./tests/fixtures/glob', '00-foo'],
    ['./tests/fixtures/glob', '02-bar'],
    ['./tests/fixtures/glob', '18-zoo'],
    ['./tests/fixtures/glob', '42-spam'],
    ['./tests/fixtures/glob2', '00-aaa'],
    ['./tests/fixtures/glob2', '01-bbbb'],
    ['./tests/fixtures/glob2', '100-cccccc'],
    ['./tests/fixtures/glob2', '1000-e'],
    ['./tests/fixtures/glob2', '999999-dddddddddd']
  ])
})

test('glob empty result', () => {
  const result = glob()
  expect(result).toEqual([])
})
