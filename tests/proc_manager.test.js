const { ProcessManager } = require('../src/proc_manager')

test('`exec` returns {stdout, exitCode} + OK', () => {
  const procManager = new ProcessManager()
  const { stdout, stderr, exitCode } = procManager.exec(
    './tests/scripts/ok.sh',
    []
  )
  expect(exitCode).toBe(0)
  expect(stdout).toContain('EXITING WITH CODE=0')
  expect(stderr).toContain('--- TRUNCATED ---')
})

test('`exec` returns {stdout, exitCode} + FAILLING', () => {
  const procManager = new ProcessManager()
  const { stdout, stderr, exitCode } = procManager.exec(
    './tests/scripts/fail.sh',
    []
  )
  expect(exitCode).toBe(243)
  expect(stdout).toContain('EXITING WITH CODE=243')
  expect(stderr).toContain('goes to stderr')
})
