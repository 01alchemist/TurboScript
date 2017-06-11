const gulp = require('gulp');
const bs = require('browser-sync').create();
const child = require('child_process');
const exec = require('child_process').exec;
const fs = require('fs');

gulp.task('default', ['server', 'recompile', 'browser-sync']);

gulp.task('server', () => {
  let server = child.spawn('node', ['server.js']);
});

gulp.task('recompile', (cb) => {
  const compileCommand = getCompileCommand();
  exec(compileCommand, (err, stdout, stderr) => {

    if (isWin()) {
      const data = fs.readFileSync('lib/webdsp_c.js', 'utf8');
      const newData = data.replace(/else\{doRun\(\)\}/g, '$&script.dispatchEvent(doneEvent);');
      fs.writeFileSync('lib/webdsp_c.js', newData);
    }

    console.log(stderr);
    cb(err);
    bs.reload();
  });
});

gulp.task('browser-sync', ['recompile'], () => {
  bs.init({
    proxy: 'localhost:3000',
  });
});

gulp.watch('cpp/webdsp.cpp', ['recompile']);

gulp.watch(['demo.js', 'webdsp.js', 'index.html', 'style.css', 'compileWASM.sh'], () => {
  bs.reload();
});

function getCompileCommand() {
  if (isWin()) {
    return 'compileWASM.bat';
  } else {
    return '. ./compileWASM.sh';
  }
}

function isWin() {
  return /^win/.test(process.platform);
}
