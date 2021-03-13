const { execFileSync } = require('child_process')

/*
https://nodejs.org/api/child_process.html#child_process_options_stdio



* 'inherit': Pass through the corresponding stdio stream to/from the parent process. In the first three positions, this is equivalent to process.stdin, process.stdout, and process.stderr, respectively. In any other position, equivalent to 'ignore'.

* <Stream> object: Share a readable or writable stream that refers to a tty, file, socket, or a pipe with the child process. The stream's underlying file descriptor is duplicated in the child process to the fd that corresponds to the index in the stdio array. The stream must have an underlying descriptor (file streams do not until the 'open' event has occurred).

*/
execFileSync('./fail.sh', [], {encoding: 'utf8', stdio: 'inherit'})

/*
Error: Command failed: ./fail.sh
  status: 243,
  signal: null,
  output: [ null, <Buffer >, <Buffer > ],
  pid: 24483,
  stdout: <Buffer >,
  stderr: <Buffer >
}
*/
