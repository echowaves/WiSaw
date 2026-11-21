#!/usr/bin/env node

/**
 * iOS dev-client runner: builds and launches on one simulator, then copies the same
 * build onto every other booted simulator. `expo run:ios` only installs where it
 * built, so without the fan-out any second simulator keeps its older binary.
 *
 * Usage: npm run ios                      # expo's own device pick
 *        npm run ios -- --device "iPhone 17 Pro"   # any expo run:ios flag works
 */

const path = require('path')
const { spawnSync } = require('child_process')

function main () {
  const args = process.argv.slice(2)
  const build = spawnSync('npx', ['expo', 'run:ios', ...args], { stdio: 'inherit' })
  if (build.status !== 0) process.exit(build.status ?? 1)

  const fanOut = spawnSync(process.execPath, [path.join(__dirname, 'install-sim-app.js')], { stdio: 'inherit' })
  process.exit(fanOut.status ?? 0)
}

if (require.main === module) main()
