/**
 * Pin the Gradle wrapper version of the prebuilt android/ project.
 * Defaults to the Gradle version shipped by the Expo SDK 58 bare template,
 * which React Native 0.88 / AGP 9 require.
 */
const fs = require('fs');
const path = require('path');

const gradleVersion = process.argv[2] || '9.4.1';
const androidProjectDir = path.join(__dirname, '..', 'android');

const gradleWrapperPropertiesPath = path.join(
  androidProjectDir,
  'gradle',
  'wrapper',
  'gradle-wrapper.properties'
);

const content = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${gradleVersion}-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

try {
  fs.writeFileSync(gradleWrapperPropertiesPath, content);
  console.log(`[fix-gradle-version] Set Gradle version to ${gradleVersion}`);
} catch (error) {
  console.error('[fix-gradle-version] Error:', error.message);
  process.exit(1);
}
