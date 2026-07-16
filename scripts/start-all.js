#!/usr/bin/env node
/**
 * Fanora — one command starts API + web + mobile (Android).
 * All npm packages live in ./node_modules at the repo root.
 */
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const root = path.resolve(__dirname, '..');
const isWin = os.platform() === 'win32';

function run(name, scriptFile) {
  const scriptPath = path.join(__dirname, scriptFile);
  const child = spawn(process.execPath, [scriptPath], {
    cwd: root,
    shell: false,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });

  const prefix = `[${name}]`;
  const log = (stream, isErr) => {
    stream.on('data', (buf) => {
      for (const line of buf.toString().split(/\r?\n/)) {
        if (!line.trim()) continue;
        const out = `${prefix} ${line}`;
        if (isErr) console.error(out);
        else console.log(out);
      }
    });
  };
  log(child.stdout, false);
  log(child.stderr, true);
  child.on('error', (err) => console.error(`${prefix} failed to start:`, err.message));
  child.on('exit', (code) => console.log(`${prefix} exited (${code})`));
  return child;
}

async function hasAndroidTarget() {
  return new Promise((resolve) => {
    const child = spawn('flutter', ['devices', '--machine'], {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    child.stdout.on('data', (d) => { out += d.toString(); });
    child.on('close', () => {
      try {
        const devices = JSON.parse(out || '[]');
        resolve(devices.some((d) =>
          d.targetPlatform === 'android' ||
          (d.platform && String(d.platform).includes('android')) ||
          (d.name && /android|emulator|pixel|sdk/i.test(d.name))
        ));
      } catch { resolve(false); }
    });
    child.on('error', () => resolve(false));
  });
}

async function main() {
  console.log('=== Fanora ===');
  console.log('Starting Backend + Frontend...\n');

  const children = [
    run('api', 'run-api.js'),
    run('web', 'run-web.js'),
  ];

  if (await hasAndroidTarget()) {
    children.push(run('mobile', 'start-mobile.js'));
  } else {
    console.warn('[mobile] No Android device — API + web only. Run: npm run start:mobile\n');
  }

  const shutdown = () => {
    console.log('\nStopping...');
    for (const child of children) {
      try {
        if (isWin) {
          spawn('taskkill', ['/pid', String(child.pid), '/f', '/t'], { shell: true });
        } else {
          child.kill('SIGTERM');
        }
      } catch (_) {}
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => { console.error(e); process.exit(1); });
