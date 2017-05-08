// A little wrapper for reliably spawning node-v8 from package.json across platforms.

const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'node-v8');

fs.exists(path.join(dir, 'bin'), exists => {
    if (!exists) {
        console.error("node-v8 is not installed. To install it, run: npm run install:node-v8");
        process.exit(1);
    }
    spawn(path.join(dir, 'bin', 'node'), process.argv.slice(2), {
        stdio: 'inherit'
    }).on('error', err => {
        throw err;
    }).on('close', code => process.exit(code));
});
