#!/usr/bin/env node

/**
 * Reads .env and syncs each variable to EAS Environment Variables
 * so that EAS Build receives correct API configuration without
 * shipping .env in the source archive.
 *
 * Usage: node scripts/sync-eas-env.js
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ENV_PATH = path.resolve(__dirname, '..', '.env')

function parseEnvFile (filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: ${filePath} not found`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const vars = []

  for (const line of content.split('\n')) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue

    // Match: export KEY=VALUE or KEY=VALUE
    const match = trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (!match) continue

    const key = match[1]
    let value = match[2].trim()

    // Strip surrounding quotes (single or double)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    vars.push({ key, value })
  }

  return vars
}

function syncToEas (vars) {
  if (vars.length === 0) {
    console.log('No variables found in .env to sync.')
    return
  }

  console.log(`Syncing ${vars.length} variable(s) to EAS...`)

  for (const { key, value } of vars) {
    // Delete existing variable first (silently ignore if it doesn't exist)
    // This avoids "cannot change secret to non-secret" errors from EAS
    try {
      execSync(
        'npx eas env:delete' +
        ` --variable-name ${key}` +
        ' --variable-environment production' +
        ' --non-interactive',
        { stdio: 'pipe' }
      )
    } catch {
      // Variable may not exist yet — that's fine
    }

    try {
      execSync(
        'npx eas env:create' +
        ` --name ${key}` +
        ` --value ${JSON.stringify(value)}` +
        ' --environment production' +
        ' --visibility plaintext' +
        ' --force' +
        ' --non-interactive',
        { stdio: 'pipe' }
      )
      console.log(`  ✓ ${key}`)
    } catch (err) {
      console.error(`  ✗ ${key}: ${err.stderr ? err.stderr.toString().trim() : err.message}`)
      process.exit(1)
    }
  }

  console.log('All variables synced to EAS.')
}

const vars = parseEnvFile(ENV_PATH)
syncToEas(vars)
