/**
 * Gradle Wrapper Properties Plugin
 * Sets the Gradle version to use for Android builds
 * 
 * This is a workaround for Android builds requiring Java 17
 * while we only have Java 11 available.
 */
const fs = require('fs');
const path = require('path');

module.exports = (config, gradleVersion = '8.10.2') => {
  return config;
};

// This function will be called after prebuild
module.exports.setGradleVersion = (androidProjectDir, gradleVersion = '8.10.2') => {
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
  
  fs.writeFileSync(gradleWrapperPropertiesPath, content);
  console.log(`[gradle-wrapper-properties-plugin] Set Gradle version to ${gradleVersion}`);
};
