
#!/usr/bin/env node

// Staging Security Test Runner
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class StagingSecurityTester {
  constructor() {
    this.testResults = [];
    this.environment = 'staging';
  }

  async runTest(testName, testFunction) {
    console.log(`🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      await testFunction();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'PASSED',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ✅ ${testName} passed (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        status: 'FAILED',
        duration: `${duration}ms`,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ❌ ${testName} failed: ${error.message}`);
    }
  }

  async testSecretRotation() {
    // Test secret rotation script
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['scripts/rotate-secrets.js'], {
        env: { ...process.env, NODE_ENV: 'staging' },
        stdio: 'pipe'
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Secret rotation failed with exit code ${code}`));
        }
      });
    });
  }

  async testBackupRestore() {
    // Test backup restore functionality
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['scripts/test-backup-restore.js'], {
        env: { 
          ...process.env, 
          NODE_ENV: 'staging',
          BACKUP_S3_BUCKET: process.env.STAGING_BACKUP_BUCKET || 'rust-skins-backups-staging',
          BACKUP_ENCRYPTION_KEY: process.env.STAGING_ENCRYPTION_KEY || 'staging-test-key'
        },
        stdio: 'pipe'
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Backup restore test failed with exit code ${code}`));
        }
      });
    });
  }

  async testDockerBuild() {
    // Test Docker build with security configurations
    return new Promise((resolve, reject) => {
      const process = spawn('docker', ['build', '-t', 'rust-skins-staging:test', '.'], {
        stdio: 'pipe'
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve('Docker build successful');
        } else {
          reject(new Error(`Docker build failed with exit code ${code}`));
        }
      });
    });
  }

  async testNodeVersion() {
    // Verify Node.js 22 LTS
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['--version'], {
        stdio: 'pipe'
      });

      let output = '';
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          const version = output.trim();
          if (version.startsWith('v22.')) {
            resolve(`Node.js version verified: ${version}`);
          } else {
            reject(new Error(`Expected Node.js v22.x, got ${version}`));
          }
        } else {
          reject(new Error('Failed to check Node.js version'));
        }
      });
    });
  }

  async testSecurityScripts() {
    // Test that all security scripts exist and are executable
    const scripts = [
      'scripts/rotate-secrets.js',
      'scripts/test-backup-restore.js',
      'scripts/start-with-secrets.js'
    ];

    for (const script of scripts) {
      try {
        await fs.access(script);
        console.log(`  ✓ ${script} exists`);
      } catch (error) {
        throw new Error(`Security script missing: ${script}`);
      }
    }

    return 'All security scripts are present';
  }

  async testGitHubWorkflows() {
    // Test GitHub Actions workflow files
    const workflows = [
      '.github/workflows/security-automation.yml'
    ];

    for (const workflow of workflows) {
      try {
        const content = await fs.readFile(workflow, 'utf8');
        
        // Basic validation - check for required jobs
        if (!content.includes('secret-rotation') || !content.includes('backup-restore-test')) {
          throw new Error(`Workflow ${workflow} missing required jobs`);
        }
        
        console.log(`  ✓ ${workflow} validated`);
      } catch (error) {
        throw new Error(`Workflow validation failed: ${error.message}`);
      }
    }

    return 'GitHub workflows validated';
  }

  async generateReport() {
    const report = {
      environment: this.environment,
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.testResults.length,
        passed: this.testResults.filter(t => t.status === 'PASSED').length,
        failed: this.testResults.filter(t => t.status === 'FAILED').length
      },
      tests: this.testResults
    };

    console.log('\n📊 Staging Security Test Report:');
    console.log('================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Success Rate: ${((report.summary.passed / report.summary.totalTests) * 100).toFixed(1)}%`);

    console.log('\nDetailed Results:');
    this.testResults.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${status} ${test.name} (${test.duration})`);
      if (test.error) {
        console.log(`      Error: ${test.error}`);
      }
    });

    // Save report to file
    const reportFile = `/tmp/staging-security-test-report-${Date.now()}.json`;
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${reportFile}`);

    return report;
  }

  async runAllTests() {
    console.log('🚀 Starting Staging Security Test Suite');
    console.log('======================================');

    // Run all tests
    await this.runTest('Node.js Version Check', () => this.testNodeVersion());
    await this.runTest('Security Scripts Validation', () => this.testSecurityScripts());
    await this.runTest('GitHub Workflows Validation', () => this.testGitHubWorkflows());
    await this.runTest('Docker Build Test', () => this.testDockerBuild());
    await this.runTest('Secret Rotation Test', () => this.testSecretRotation());
    await this.runTest('Backup Restore Test', () => this.testBackupRestore());

    const report = await this.generateReport();
    
    // Exit with error code if any tests failed
    if (report.summary.failed > 0) {
      console.log('\n❌ Some tests failed. Please review the report above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed! Staging environment is ready.');
      process.exit(0);
    }
  }
}

// CLI execution
if (require.main === module) {
  const tester = new StagingSecurityTester();
  tester.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = StagingSecurityTester;
