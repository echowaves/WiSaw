/**
 * The simulator fan-out can only be exercised headless: `simctl` needs a live
 * CoreSimulator service, so the pieces worth guarding are the JSON parsing and the
 * "which build is newest" pick that decide what gets installed where.
 */
/* eslint-env jest */
const fs = require('fs')
const os = require('os')
const path = require('path')
const { parseBootedDevices, collectApps, pickNewest } = require('../install-sim-app.js')

describe('parseBootedDevices', () => {
  it('keeps only available simulators that are booted', () => {
    const json = JSON.stringify({
      devices: {
        'com.apple.CoreSimulator.SimRuntime.iOS-26-1': [
          { udid: 'A', name: 'iPhone 17 Pro', state: 'Booted', isAvailable: true },
          { udid: 'B', name: 'iPhone 16', state: 'Shutdown', isAvailable: true }
        ],
        'com.apple.CoreSimulator.SimRuntime.iOS-17-0': [
          { udid: 'C', name: 'iPhone 12', state: 'Booted', isAvailable: false }
        ]
      }
    })
    expect(parseBootedDevices(json)).toEqual([{ udid: 'A', name: 'iPhone 17 Pro' }])
  })

  it('survives a runtime group with no devices', () => {
    expect(parseBootedDevices(JSON.stringify({ devices: {} }))).toEqual([])
  })
})

describe('collectApps / pickNewest', () => {
  let root
  afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

  it('finds simulator builds and picks the most recent one', () => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'derived.'))
    const older = path.join(root, 'WiSaw-OLD/Build/Products/Debug-iphonesimulator/WiSaw.app')
    const newer = path.join(root, 'WiSaw-NEW/Build/Products/Debug-iphonesimulator/WiSaw.app')
    const release = path.join(root, 'WiSaw-NEW/Build/Products/Release-iphoneos/WiSaw.app')
    const other = path.join(root, 'SomeOtherApp/Build/Products/Debug-iphonesimulator/App.app')
    for (const dir of [older, newer, release, other]) fs.mkdirSync(dir, { recursive: true })

    const now = Date.now()
    fs.utimesSync(older, new Date(now - 60_000), new Date(now - 60_000))
    fs.utimesSync(newer, new Date(now), new Date(now))
    fs.utimesSync(release, new Date(now + 120_000), new Date(now + 120_000))

    expect(pickNewest(collectApps(root))).toBe(newer)
  })

  it('returns null when nothing has been built', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'empty.'))
    expect(pickNewest(collectApps(empty))).toBeNull()
    fs.rmSync(empty, { recursive: true, force: true })
  })
})
