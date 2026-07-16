#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function checkAndroid() {
  return new Promise((resolve) => {
    const child = spawn('flutter', ['devices', '--machine'], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.on('close', () => {
      try {
        const devices = JSON.parse(out || '[]');
        resolve(
          devices.some(
            (d) =>
              d.targetPlatform === 'android' ||
              (d.platform && String(d.platform).includes('android'))
          )
        );
      } catch {
        resolve(false);
      }
    });
    child.on('error', () => resolve(false));
  });
}

(async () => {
  const ok = await checkAndroid();
  if (!ok) {
    console.error('No Android device/emulator found.');
    console.error('1. Install Android Studio and create a virtual device (AVD)');
    console.error('2. Or connect a phone with USB debugging enabled');
    console.error('3. Then run: flutter devices');
    process.exit(1);
  }

  const child = spawn('flutter', ['run', '-d', 'android'], {
    cwd: path.join(root, 'Mobile'),
    shell: true,
    stdio: 'inherit',
  });

  child.on('exit', (code) => process.exit(code || 0));
})();
