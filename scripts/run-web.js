#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const frontend = path.join(root, 'Frontend');
const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

const child = spawn(process.execPath, [vite], {
  cwd: frontend,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
