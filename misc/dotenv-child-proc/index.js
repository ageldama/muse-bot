require('dotenv').config()
const process = require('process')
const { execSync } = require('child_process')

console.log(process.env['FOO'])
console.log(process.env['SPAM'])
console.log(execSync('env | egrep FOO\\|SPAM', { encoding: 'utf8' }))
