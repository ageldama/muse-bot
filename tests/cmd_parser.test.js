const { parseCmd } = require('../src/cmd_parser')
const { ParsimmonError } = require('parsimmon')

function testKeywordCmdParsing(kw, cmdType) {
  const result = parseCmd(kw)
  expect(result.type).toBe(cmdType)
}

test('parseCmd is a function', () => {
  expect(parseCmd).toBeDefined()
})

test('parse `h`', () => {
  testKeywordCmdParsing('h', 'cmdHelp')
})

test('parse `bt-off`', () => {
  testKeywordCmdParsing('bt-off', 'cmdBtOff')
})

test('parse `bt-stat`', () => {
  testKeywordCmdParsing('bt-stat', 'cmdBtStat')
})

test('parse `vol`', () => {
  testKeywordCmdParsing('vol', 'cmdVol')
})

test('parse `vol`, also can take (newVol: number)', () => {
  const result = parseCmd('vol 13')
  expect(result.type).toBe('cmdVol')
  expect(result.volume).toBe(13)
})

test('parse `vup`', () => {
  testKeywordCmdParsing('vup', 'cmdVolUp')
})

test('parse `vup`, also can take (incrDelta: number)', () => {
  const result = parseCmd('vup 13')
  expect(result.type).toBe('cmdVolUp')
  expect(result.delta).toBe(13)
})

test('parse `vdn`', () => {
  testKeywordCmdParsing('vdn', 'cmdVolDown')
})

test('parse `vdn`, also can take (decrDelta: number)', () => {
  const result = parseCmd('vdn 13')
  expect(result.type).toBe('cmdVolDown')
  expect(result.delta).toBe(13)
})

test('parse `mute`', () => {
  testKeywordCmdParsing('mute', 'cmdVolMute')
})

test('parse `unmute`', () => {
  testKeywordCmdParsing('unmute', 'cmdVolUnmute')
})

test('parse `df`', () => {
  testKeywordCmdParsing('df', 'cmdDiskUsage')
})

test('parse `mem`', () => {
  testKeywordCmdParsing('mem', 'cmdMemoryUsage')
})

test('parse `temp`', () => {
  testKeywordCmdParsing('temp', 'cmdTemperature')
})

test('parse `uptime`', () => {
  testKeywordCmdParsing('uptime', 'cmdUptime')
})

test('parse `reboot`', () => {
  testKeywordCmdParsing('reboot', 'cmdReboot')
})

test('parse `poweroff`', () => {
  testKeywordCmdParsing('poweroff', 'cmdPowerOff')
})

test('parse `ls`', () => {
  testKeywordCmdParsing('ls', 'cmdListScripts')
})

test('parse `ps`', () => {
  testKeywordCmdParsing('ps', 'cmdListProcesses')
})

test('parse `kill`, takes (procId: number)', () => {
  const result = parseCmd('kill 123')
  expect(result.type).toBe('cmdKillProcess')
  expect(result.procId).toBe(123)
})

test('parse `kill`, requires (procId: number)', () => {
  expect(() => parseCmd('kill')).toThrow(ParsimmonError)
  expect(() => parseCmd('kill PROC-ID')).toThrow(ParsimmonError)
})

test('parse `spawn`, takes (scriptId: number)', () => {
  const result = parseCmd('spawn 123')
  expect(result.type).toBe('cmdSpawnScript')
  expect(result.scriptId).toBe(123)
  expect(result.scriptSubstr).not.toBeDefined()
})

test('parse `spawn`, requires (scriptId: number)', () => {
  expect(() => parseCmd('spawn')).toThrow(ParsimmonError)
})

test('parse `spawn`, takes additional argv', () => {
  const result = parseCmd('spawn 123 a b c banana apple red')
  expect(result.type).toBe('cmdSpawnScript')
  expect(result.scriptId).toBe(123)
  expect(result.scriptSubstr).not.toBeDefined()
  expect(result.argv).toEqual(['a', 'b', 'c', 'banana', 'apple', 'red'])
})

test('parse `spawn`, takes (scriptSubstr: number)', () => {
  const result = parseCmd('spawn FOOBAR')
  expect(result.type).toBe('cmdSpawnScript')
  expect(result.scriptSubstr).toEqual('FOOBAR')
  expect(result.scriptId).not.toBeDefined()
})

test('parse `spawn`, takes additional argv (script-substr)', () => {
  const result = parseCmd('spawn FOOBAR a b c banana apple red')
  expect(result.type).toBe('cmdSpawnScript')
  expect(result.scriptSubstr).toEqual('FOOBAR')
  expect(result.scriptId).not.toBeDefined()
  expect(result.argv).toEqual(['a', 'b', 'c', 'banana', 'apple', 'red'])
})

test('parse `run`, takes (scriptId: number)', () => {
  const result = parseCmd('run 123')
  expect(result.type).toBe('cmdRunScript')
  expect(result.scriptId).toBe(123)
  expect(result.scriptSubstr).not.toBeDefined()
})

test('parse `run`, requires (scriptId: number)', () => {
  expect(() => parseCmd('run')).toThrow(ParsimmonError)
})

test('parse `run`, takes additional argv (script-id)', () => {
  const result = parseCmd('run 123 a b c banana apple red')
  expect(result.type).toBe('cmdRunScript')
  expect(result.scriptId).toBe(123)
  expect(result.scriptSubstr).not.toBeDefined()
  expect(result.argv).toEqual(['a', 'b', 'c', 'banana', 'apple', 'red'])
})

test('parse `run`, takes (scriptSubstr: str)', () => {
  const result = parseCmd('run FOOBAR')
  expect(result.type).toBe('cmdRunScript')
  expect(result.scriptId).not.toBeDefined()
  expect(result.scriptSubstr).toEqual('FOOBAR')
})

test('parse `run`, takes additional argv (script-substr)', () => {
  const result = parseCmd('run FOOBAR a b c banana apple red')
  expect(result.type).toBe('cmdRunScript')
  expect(result.scriptId).not.toBeDefined()
  expect(result.scriptSubstr).toEqual('FOOBAR')
  expect(result.argv).toEqual(['a', 'b', 'c', 'banana', 'apple', 'red'])
})

test('parse `ytdl`, takes (url: string)', () => {
  const result = parseCmd('ytdl https://foobar.zoo?dkjdjkdjk')
  expect(result.type).toBe('cmdYtdl')
  expect(result.url).toBe('https://foobar.zoo?dkjdjkdjk')
})

test('parse `ytdl`, requires (url: string)', () => {
  expect(() => parseCmd('ytdl')).toThrow(ParsimmonError)
})

test('parse `ytdq`, takes (url: string)', () => {
  const result = parseCmd('ytdq https://foobar.zoo?dkjdjkdjk')
  expect(result.type).toBe('cmdYtdlQueue')
  expect(result.url).toBe('https://foobar.zoo?dkjdjkdjk')
})

test('parse `ytdq`, requires (url: string)', () => {
  expect(() => parseCmd('ytdq')).toThrow(ParsimmonError)
})

test('parse `sched`', () => {
  testKeywordCmdParsing('sched', 'cmdSched')
})

test('parse `sched` with delta', () => {
  const result = parseCmd('sched +45')
  expect(result.type).toBe('cmdSched')
  expect(result.action).toBe('+45')
})

test('parse `sched` with `c`', () => {
  const result = parseCmd('sched c')
  expect(result.type).toBe('cmdSched')
  expect(result.action).toBe('c')
})

test('parse `sched` with absolute time', () => {
  const result = parseCmd('sched 1235')
  expect(result.type).toBe('cmdSched')
  expect(result.action).toBe('1235')
})
