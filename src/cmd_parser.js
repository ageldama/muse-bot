const parsimmon = require('parsimmon')
const lodash = require('lodash')
const { isNumeric } = require('voca')

const whitespace = parsimmon.regexp(/\s*/m)

function token(parser) {
  return parser.skip(whitespace)
}

function word(str) {
  return parsimmon.string(str).thru(token)
}

function mkKeywordCmd(keyword, cmdType) {
  return () =>
    word(keyword).map(() => {
      return { type: cmdType }
    })
}

function extractVals(coll) {
  return lodash.map(coll, (elem) => elem.val)
}

const CmdParser = parsimmon.createLanguage({
  cmd: (r) =>
    parsimmon
      .alt(
        r.cmdHelp,
        r.cmdBtOff,
        r.cmdBtStat,
        r.cmdVol,
        r.cmdVolUp,
        r.cmdVolDown,
        r.cmdVolMute,
        r.cmdVolUnmute,
        r.cmdTemperature,
        r.cmdDiskUsage,
        r.cmdMemoryUsage,
        r.cmdUptime,
        r.cmdReboot,
        r.cmdPowerOff,
        r.cmdListScripts,
        r.cmdListProcesses,
        r.cmdKillProcess,
        r.cmdSpawnScript,
        r.cmdRunScript,
        r.cmdYtdlQueue,
        r.cmdYtdl,
        r.cmdSched,
        r.cmdScmd
      )
      .thru((parser) => whitespace.then(parser)),

  number: () =>
    token(parsimmon.regexp(/[+-\d_,.]+/))
      .map((s) => s.replace(/[+_,]/g, ''))
      .map(Number)
      .map((n) => {
        return {
          type: 'number',
          val: n
        }
      })
      .desc('number'),

  nonWhitespaces: () =>
    token(parsimmon.regexp(/\S+/))
      .map((s) => {
        return {
          type: 'nonWhitespaces',
          val: s
        }
      })
      .desc('nonWhitespaces'),

  cmdHelp: mkKeywordCmd('h', 'cmdHelp'),

  cmdBtOff: mkKeywordCmd('bt-off', 'cmdBtOff'),
  cmdBtStat: mkKeywordCmd('bt-stat', 'cmdBtStat'),

  cmdVolUp: (r) =>
    parsimmon
      .alt(parsimmon.seq(word('vup'), r.number), word('vup'))
      .map((cmd) => {
        const result = { type: 'cmdVolUp' }
        if (cmd[1]) {
          result.delta = cmd[1].val
        }
        return result
      }),

  cmdVolDown: (r) =>
    parsimmon
      .alt(parsimmon.seq(word('vdn'), r.number), word('vdn'))
      .map((cmd) => {
        const result = { type: 'cmdVolDown' }
        if (cmd[1]) {
          result.delta = cmd[1].val
        }
        return result
      }),

  cmdVol: (r) =>
    parsimmon
      .alt(parsimmon.seq(word('vol'), r.number), word('vol'))
      .map((cmd) => {
        const result = { type: 'cmdVol' }
        if (cmd[1]) {
          result.volume = cmd[1].val
        }
        return result
      }),

  cmdVolMute: mkKeywordCmd('mute', 'cmdVolMute'),
  cmdVolUnmute: mkKeywordCmd('unmute', 'cmdVolUnmute'),

  cmdTemperature: mkKeywordCmd('temp', 'cmdTemperature'),
  cmdDiskUsage: mkKeywordCmd('df', 'cmdDiskUsage'),
  cmdMemoryUsage: mkKeywordCmd('mem', 'cmdMemoryUsage'),
  cmdUptime: mkKeywordCmd('uptime', 'cmdUptime'),
  cmdReboot: mkKeywordCmd('reboot', 'cmdReboot'),
  cmdPowerOff: mkKeywordCmd('poweroff', 'cmdPowerOff'),

  cmdListScripts: mkKeywordCmd('ls', 'cmdListScripts'),
  cmdListProcesses: mkKeywordCmd('ps', 'cmdListProcesses'),

  cmdKillProcess: (r) =>
    parsimmon.seq(word('kill'), r.nonWhitespaces).map((cmd) => {
      const result = {
        type: 'cmdKillProcess'
      }
      if (isNumeric(cmd[1].val)) {
        result.procId = Number(cmd[1].val)
      } else {
        result.procSubstr = cmd[1].val
      }
      return result
    }),

  cmdSpawnScript: (r) =>
    parsimmon
      .alt(
        parsimmon.seq(
          word('spawn'),
          r.number,
          r.nonWhitespaces.sepBy(whitespace)
        ),
        parsimmon.seq(
          word('spawn'),
          r.nonWhitespaces,
          r.nonWhitespaces.sepBy(whitespace)
        )
      )
      .map((cmd) => {
        if (isNumeric(cmd[1].val)) {
          return {
            type: 'cmdSpawnScript',
            scriptId: Number(cmd[1].val),
            argv: extractVals(cmd[2])
          }
        } else {
          return {
            type: 'cmdSpawnScript',
            scriptSubstr: cmd[1].val,
            argv: extractVals(cmd[2])
          }
        }
      }),

  cmdRunScript: (r) =>
    parsimmon
      .alt(
        parsimmon.seq(
          word('run'),
          r.number,
          r.nonWhitespaces.sepBy(whitespace)
        ),
        parsimmon.seq(
          word('run'),
          r.nonWhitespaces,
          r.nonWhitespaces.sepBy(whitespace)
        )
      )
      .map((cmd) => {
        if (isNumeric(cmd[1].val)) {
          return {
            type: 'cmdRunScript',
            scriptId: Number(cmd[1].val),
            argv: extractVals(cmd[2])
          }
        } else {
          return {
            type: 'cmdRunScript',
            scriptSubstr: cmd[1].val,
            argv: extractVals(cmd[2])
          }
        }
      }),

  cmdYtdl: (r) =>
    parsimmon.seq(word('ytdl'), r.nonWhitespaces).map((cmd) => {
      return {
        type: 'cmdYtdl',
        url: cmd[1].val
      }
    }),
  cmdYtdlQueue: (r) =>
    parsimmon.seq(word('ytdq'), r.nonWhitespaces).map((cmd) => {
      return {
        type: 'cmdYtdlQueue',
        url: cmd[1].val
      }
    }),

  cmdSched: (r) =>
    parsimmon
      .alt(parsimmon.seq(word('sched'), r.nonWhitespaces), word('sched'))
      .map((cmd) => {
        const result = {
          type: 'cmdSched'
        }
        if (cmd[1]) {
          result.action = cmd[1].val
        }
        return result
      }),

  cmdScmd: (r) =>
    parsimmon
      .alt(
        parsimmon.seq(word('scmd'), whitespace, parsimmon.regexp(/.+/)),
        word('scmd')
      )
      .map((cmd) => {
        const result = {
          type: 'cmdScmd'
        }
        if (typeof cmd === typeof []) {
          result.val = cmd[2]
        }
        return result
      })
})

module.exports = {
  CmdParser,
  parseCmd: (s) => {
    return CmdParser.cmd.tryParse(s)
  }
}
