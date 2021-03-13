function isEmpty(str) {
  return !str || !/[^\s]+/.test(str)
}

module.exports = {
  isEmpty
}
