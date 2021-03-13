const { execFileSync } = require('child_process')

execFileSync('non-existing')
/*
Error: spawnSync non-existing ENOENT
  errno: 'ENOENT',
  code: 'ENOENT',
*/
