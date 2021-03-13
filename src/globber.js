const fs = require('fs')
const lodash = require('lodash')

function glob(...paths) {
  let result = []
  for (const path of paths) {
    const files = lodash.filter(
      fs.readdirSync(path),
      (fn) => !fn.startsWith('.')
    )
    const sorted = lodash.sortBy(files)
    result = lodash.concat(
      result,
      lodash.map(sorted, (i) => [path, i])
    )
  }
  return result
}

module.exports = glob
