#!/usr/bin/env node

/**
 * Installs the most recent WiSaw simulator build onto every booted iOS simulator.
 *
 * `expo run:ios` builds for one destination and installs on that one device only, so
 * any other simulator you switch to keeps running whatever binary was last pushed to
 * it. Run this after a build (npm run ios does it for you) and every booted simulator
 * gets the same fresh app.
 *
 * Usage: node scripts/install-sim-app.js [--app <path-to-.app>] [--launch] [--dry-run]
 */

const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const DERIVED_DATA = path.join(os.homedir(), 'Library/Developer/Xcode/DerivedData')

function parseArgs (argv) {
  const opts = { app: process.env.APP_PATH ?? null, launch: false, dryRun: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--app') opts.app = argv[++i]
    else if (arg === '--launch') opts.launch = true
    else if (arg === '--dry-run') opts.dryRun = true
  }
  return opts
}

function parseBootedDevices (simctlJson) {
  const groups = JSON.parse(simctlJson).devices ?? {}
  return Object.values(groups).flatMap(devices => devices
    .filter(device => device.isAvailable !== false && device.state === 'Booted')
    .map(device => ({ udid: device.udid, name: device.name }))
  )
}

function bootedDevices () {
  const json = execFileSync('xcrun', ['simctl', 'list', 'devices', 'booted', '-j'], { encoding: 'utf8' })
  return parseBootedDevices(json)
}

const readDir = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir) : []

function appBundles (productsDir) {
  return readDir(productsDir)
    .filter((config) => config.endsWith('-iphonesimulator'))
    .flatMap((config) => readDir(path.join(productsDir, config))
      .filter((app) => app.endsWith('.app'))
      .map((app) => path.join(productsDir, config, app)))
}

function collectApps (root = DERIVED_DATA) {
  return readDir(root)
    .filter((project) => project.startsWith('WiSaw-'))
    .flatMap((project) => appBundles(path.join(root, project, 'Build/Products')))
    .map((full) => ({ path: full, mtimeMs: fs.statSync(full).mtimeMs }))
}

function newestApp (root = DERIVED_DATA) {
  return pickNewest(collectApps(root))
}

function pickNewest (candidates) {
  const sorted = candidates.slice().sort((a, b) => b.mtimeMs - a.mtimeMs)
  return sorted.length > 0 ? sorted[0].path : null
}

function bundleIdentifier (appPath) {
  try {
    const plist = fs.readFileSync(path.join(appPath, 'Info.plist'), 'latin1')
    const match = plist.match(/CFBundleIdentifier<\/key>\s*<string>([^<]+)<\/string>/)
    if (match) return match[1]
  } catch { /* fall through to the configured default */ }
  return require('../app.config.js').expo.ios.bundleIdentifier
}

function installOn (device, appPath) {
  execFileSync('xcrun', ['simctl', 'install', device.udid, appPath], { stdio: 'pipe' })
  return device
}

function firstLine (error) {
  return String(error.stderr ?? error.message ?? error).trim().split('\n')[0]
}

function installOnDevice (device, appPath, opts) {
  if (opts.dryRun) {
    console.log(`  would install on ${device.name} (${device.udid})`)
    return true
  }
  try {
    installOn(device, appPath)
    console.log(`  installed on ${device.name}`)
    if (opts.launch) {
      execFileSync('xcrun', ['simctl', 'launch', device.udid, bundleIdentifier(appPath)], { stdio: 'pipe' })
      console.log('    launched')
    }
    return true
  } catch (error) {
    console.error(`  FAILED on ${device.name}: ${firstLine(error)}`)
    return false
  }
}

function main () {
  const opts = parseArgs(process.argv.slice(2))
  const appPath = opts.app ?? newestApp()
  if (!appPath || !fs.existsSync(appPath)) {
    console.error('install-sim-app: no built .app found — run `npm run ios` first, or pass --app <path>')
    process.exit(1)
  }

  let devices
  try {
    devices = bootedDevices()
  } catch (error) {
    console.error(`install-sim-app: could not list simulators — ${firstLine(error)}`)
    process.exit(1)
  }

  if (devices.length === 0) {
    console.log(`install-sim-app: nothing to do — no simulator is booted (built app is ${appPath})`)
    return
  }

  console.log(`install-sim-app: ${appPath}`)
  const ok = devices.map((device) => installOnDevice(device, appPath, opts))
  if (ok.includes(false)) process.exit(1)
}

if (require.main === module) main()

module.exports = { parseBootedDevices, collectApps, pickNewest, newestApp }
