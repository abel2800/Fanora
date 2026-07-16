#!/usr/bin/env node
/** Ensure Flutter/Dart ignore patterns exist in root .gitignore */
const fs = require('fs');
const path = require('path');

const gitignorePath = path.join(__dirname, '..', '.gitignore');
const extras = `
# Flutter / Dart
Mobile/.dart_tool/
Mobile/.flutter-plugins
Mobile/.flutter-plugins-dependencies
Mobile/.packages
Mobile/.pub-cache/
Mobile/.pub/
Mobile/build/
Mobile/**/Generated.xcconfig
Mobile/**/flutter_export_environment.sh
**/doc/api/
.idea/
*.iml
`;

try {
  let current = '';
  if (fs.existsSync(gitignorePath)) {
    current = fs.readFileSync(gitignorePath, 'utf8');
  }
  if (!current.includes('Mobile/.dart_tool/')) {
    fs.writeFileSync(gitignorePath, current.trimEnd() + '\n' + extras);
  }
} catch (e) {
  // non-fatal
}
