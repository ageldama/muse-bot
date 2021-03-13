'use strict'

function resolveOrCatch(aPromise, errCallback = () => {}) {
  return aPromise.then(() => {}).catch(errCallback)
}

module.exports = {
  resolveOrCatch
}
