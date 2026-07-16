#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const backend = path.join(root, 'Backend');
const nodemon = path.join(root, 'node_modules', 'nodemon', 'bin', 'nodemon.js');

const child = spawn(process.execPath, [nodemon, 'server.js'], {
  cwd: backend,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
