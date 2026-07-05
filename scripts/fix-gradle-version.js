/**
 * Fix Gradle version to use Java 11 compatible version
 */
const fs = require('fs');
const path = require('path');

const gradleVersion = process.argv[2] || '8.13';
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
