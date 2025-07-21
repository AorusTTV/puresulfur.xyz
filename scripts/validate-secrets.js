
#!/usr/bin/env node

/**
 * Secrets Validation Script
 * Validates that no plaintext secrets remain in the codebase
 */

const fs = require('fs');
const path = require('path');

const SECRETS_PATTERNS = [
  /password\s*[=:]\s*['"][^'"]{8,}['"]/gi,
  /secret\s*[=:]\s*['"][^'"]{16,}['"]/gi,
  /key\s*[=:]\s*['"][^'"]{20,}['"]/gi,
  /token\s*[=:]\s*['"][^'"]{20,}['"]/gi,
  /sk_live_[a-zA-Z0-9]{20,}/gi,
  /sk_test_[a-zA-Z0-9]{20,}/gi,
  /AIza[a-zA-Z0-9_-]{35}/gi,
  /AKIA[a-zA-Z0-9]{16}/gi,
  /[a-f0-9]{40}/gi, // Generic 40-char hex (common for secrets)
  /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/gi // JWT tokens
];

const EXCLUDE_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage'
];

const EXCLUDE_FILES = [
  '.env.example',
  'package-lock.json',
  'bun.lockb',
  'validate-secrets.js'
];

function scanDirectory(dirPath, findings = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        scanDirectory(fullPath, findings);
      }
    } else if (entry.isFile()) {
      if (!EXCLUDE_FILES.includes(entry.name)) {
        scanFile(fullPath, findings);
      }
    }
  }
  
  return findings;
}

function scanFile(filePath, findings) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineNumber) => {
      SECRETS_PATTERNS.forEach((pattern, patternIndex) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip obvious false positives
            if (isLikelyFalsePositive(match, line)) {
              return;
            }
            
            findings.push({
              file: filePath,
              line: lineNumber + 1,
              pattern: pattern.toString(),
              match: maskSecret(match),
              context: line.trim()
            });
          });
        }
      });
    });
  } catch (error) {
    console.warn(`Warning: Could not scan file ${filePath}: ${error.message}`);
  }
}

function isLikelyFalsePositive(match, line) {
  const falsePositives = [
    /\/\/.*secret/i,
    /\/\*.*secret.*\*\//i,
    /console\.log/i,
    /example/i,
    /placeholder/i,
    /redacted/i,
    /your_/i,
    /\[REDACTED\]/i,
    /\*\*\*.*\*\*\*/i
  ];
  
  return falsePositives.some(pattern => pattern.test(line));
}

function maskSecret(secret) {
  if (secret.length <= 8) {
    return '***[MASKED]***';
  }
  
  const start = secret.substring(0, 4);
  const end = secret.length > 12 ? secret.substring(secret.length - 4) : '';
  return `${start}***[MASKED]***${end}`;
}

function main() {
  console.log('🔍 Scanning codebase for potential plaintext secrets...');
  console.log('======================================================');
  
  const startTime = Date.now();
  const findings = scanDirectory('.');
  const endTime = Date.now();
  
  console.log(`\n📊 Scan completed in ${endTime - startTime}ms`);
  console.log(`📁 Scanned directory: ${process.cwd()}`);
  console.log(`🔍 Patterns checked: ${SECRETS_PATTERNS.length}`);
  
  if (findings.length === 0) {
    console.log('\n✅ SUCCESS: No plaintext secrets detected in codebase');
    console.log('✅ The codebase appears to be clean of hardcoded secrets');
    process.exit(0);
  } else {
    console.log(`\n❌ FOUND ${findings.length} POTENTIAL SECRET(S):`);
    console.log('===============================================');
    
    findings.forEach((finding, index) => {
      console.log(`\n${index + 1}. ${finding.file}:${finding.line}`);
      console.log(`   Pattern: ${finding.pattern}`);
      console.log(`   Match: ${finding.match}`);
      console.log(`   Context: ${finding.context}`);
    });
    
    console.log('\n❌ CRITICAL: Plaintext secrets found in codebase!');
    console.log('⚠️  Please remove or encrypt these secrets before deployment');
    console.log('📋 Recommended actions:');
    console.log('   1. Move secrets to AWS Parameter Store');
    console.log('   2. Use environment variables');
    console.log('   3. Add to .gitignore if necessary');
    console.log('   4. Rotate any exposed secrets');
    
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanDirectory, scanFile, maskSecret };
