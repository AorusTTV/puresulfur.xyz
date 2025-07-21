
#!/usr/bin/env node

/**
 * Security Update Script
 * Updates package.json for Node 22 LTS compatibility and adds security scripts
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');

console.log('🔒 Updating package.json for enhanced security...');

// Read current package.json
let packageJson;
try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  packageJson = JSON.parse(packageJsonContent);
} catch (error) {
  console.error('❌ Error reading package.json:', error.message);
  process.exit(1);
}

// Update Node.js version requirement
packageJson.engines = {
  node: ">=22.16.0",
  npm: ">=10.0.0"
};

// Add security scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "security:audit": "npm audit --audit-level high",
  "security:audit-fix": "npm audit fix --force",
  "security:scan": "npm run security:audit && npm run security:dependencies",
  "security:dependencies": "npx @snyk/cli test --severity-threshold=high",
  "security:update": "npx npm-check-updates -u && npm install",
  "prebuild": "npm run security:audit"
};

// Add security-related dependencies
const devDependencies = packageJson.devDependencies || {};
packageJson.devDependencies = {
  ...devDependencies,
  "@snyk/cli": "^1.1275.0",
  "npm-check-updates": "^16.14.11"
};

// Add npm configuration for security
packageJson.npmConfig = {
  audit: true,
  "audit-level": "high",
  "fund": false
};

// Write updated package.json
try {
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json updated successfully');
  console.log('📋 Added security scripts:');
  console.log('  - npm run security:audit');
  console.log('  - npm run security:audit-fix');
  console.log('  - npm run security:scan');
  console.log('  - npm run security:update');
  console.log('🚀 Node.js version requirement updated to >=22.16.0');
} catch (error) {
  console.error('❌ Error writing package.json:', error.message);
  process.exit(1);
}

console.log('\n🔧 Next steps:');
console.log('1. Run: npm install');
console.log('2. Run: npm run security:scan');
console.log('3. Update your Dockerfile to use node:22.16-alpine');
console.log('4. Configure Dependabot and Snyk in your CI/CD pipeline');
