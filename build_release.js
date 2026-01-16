const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, 'releases');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const timestamp = new Date().toISOString().replace(/[:.]/g,'-');
const outZip = path.join(outDir, `nexo-gestor-release-${timestamp}.zip`);

console.log('Creating release zip:', outZip);

if (process.platform === 'win32') {
  // Use PowerShell Compress-Archive but exclude node_modules, .git and releases
  const cmd = `powershell -Command "Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\|\\releases\\' } | Select-Object -ExpandProperty FullName | Compress-Archive -DestinationPath '${outZip}' -Force"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error creating zip:', err, stderr);
      process.exit(1);
    }
    console.log('Release zip created at', outZip);
  });
} else {
  // Unix: use zip command if available
  const cmd = `zip -r '${outZip}' . -x "node_modules/*" ".git/*" "releases/*"`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error('Error creating zip:', err, stderr);
      process.exit(1);
    }
    console.log('Release zip created at', outZip);
  });
}