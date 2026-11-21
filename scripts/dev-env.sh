#!/bin/sh
# Shared prelude for the simulator dev scripts.
#
#   1. Loads .env — app.config.js reads API_URI / REALTIME_API_URI / API_KEY /
#      PRIVATE_IMG_HOST out of process.env, so an unsourced run bakes `undefined`
#      into the app's `extra` block.
#   2. Exports JAVA_HOME at a JDK 17+ — Gradle 9 (RN 0.88) needs one and macOS ships
#      no runtime, so without this `expo run:android` dies before it builds.
#
# Usage: sh scripts/dev-env.sh npx expo run:android

set -eu

cd "$(dirname "$0")/.."

if [ -f .env ]; then
  # shellcheck source=/dev/null
  source .env
else
  echo "dev-env: no .env found — the app will get undefined API endpoints" >&2
fi

java_major () {
  "$1/bin/java" -version 2>&1 | head -n 1 | sed -n 's/.*"\([0-9][0-9]*\).*/\1/p'
}

jdk_is_recent () {
  [ -x "$1/bin/java" ] || return 1
  major=$(java_major "$1")
  [ -n "$major" ] && [ "$major" -ge 17 ]
}

pick_jdk () {
  system_jdk=$(/usr/libexec/java_home -v 17+ 2>/dev/null || true)
  for candidate in "${WISAW_JAVA_HOME:-}" "${JAVA_HOME:-}" \
    /opt/homebrew/opt/openjdk@21 /usr/local/opt/openjdk@21 \
    "$system_jdk" \
    /opt/homebrew/opt/openjdk@17 /usr/local/opt/openjdk@17 \
    /opt/homebrew/opt/openjdk /usr/local/opt/openjdk; do
    [ -n "$candidate" ] || continue
    if jdk_is_recent "$candidate"; then
      printf '%s' "$candidate"
      return 0
    fi
  done
  return 1
}

sdk_gaps () {
  sdk=$(sed -n 's/^android\.compileSdkVersion=//p' android/gradle.properties)
  tools=$(sed -n 's/^android\.buildToolsVersion=//p' android/gradle.properties)
  if [ -n "$sdk" ] && [ ! -d "$ANDROID_HOME/platforms/android-$sdk" ]; then
    printf ' platforms;android-%s' "$sdk"
  fi
  if [ -n "$tools" ] && [ ! -d "$ANDROID_HOME/build-tools/$tools" ]; then
    printf ' build-tools;%s' "$tools"
  fi
}

check_android_sdk () {
  [ -n "${ANDROID_HOME:-}" ] || return 0
  [ -f android/gradle.properties ] || return 0
  gaps=$(sdk_gaps)
  [ -n "$gaps" ] || return 0
  echo "dev-env: your Android SDK is missing:$gaps" >&2
  echo "         Gradle will fail unless you install them (sdkmanager$gaps) or lower the" >&2
  echo "         pins in app.config.js's expo-build-properties block" >&2
}

case "$*" in
  *android*) check_android_sdk ;;
esac

if JAVA_HOME=$(pick_jdk); then
  export JAVA_HOME
  export PATH="$JAVA_HOME/bin:$PATH"
else
  echo "dev-env: no JDK 17+ found — Android builds need one (brew install openjdk@21," >&2
  echo "         then set WISAW_JAVA_HOME to its prefix)" >&2
fi

exec "$@"
