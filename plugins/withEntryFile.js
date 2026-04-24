const { withDangerousMod } = require('expo/config-plugins')
const fs = require('fs')
const path = require('path')

/**
 * Workaround: @expo/config strips .js from the entry path, but Metro's
 * IncrementalBundler validates it with fs.realpath which requires the extension.
 * This plugin appends ENTRY_FILE to ios/.xcode.env so the build uses the correct path.
 */
module.exports = function withEntryFile (config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const xcodeEnvPath = path.join(config.modRequest.platformProjectRoot, '.xcode.env')
      if (fs.existsSync(xcodeEnvPath)) {
        let contents = fs.readFileSync(xcodeEnvPath, 'utf8')
        if (!contents.includes('ENTRY_FILE')) {
          contents += '\nexport ENTRY_FILE="node_modules/expo-router/entry.js"\n'
          fs.writeFileSync(xcodeEnvPath, contents)
        }
      }
      return config
    }
  ])
}
