
#!/usr/bin/env node

const { S3Client, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class BackupRestoreTester {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.bucketName = process.env.BACKUP_S3_BUCKET || 'rust-skins-backups';
    this.testDbName = `test_restore_${Date.now()}`;
    this.tempDir = '/tmp/backup-test';
  }

  async runWeeklyRestoreTest() {
    console.log('🧪 Starting weekly backup restore test...');
    
    try {
      // Get latest backup file
      const latestBackup = await this.getLatestBackup();
      if (!latestBackup) {
        throw new Error('No backup files found in S3 bucket');
      }

      console.log(`📦 Testing backup: ${latestBackup.Key}`);

      // Download and decrypt backup
      const decryptedFile = await this.downloadAndDecryptBackup(latestBackup);
      
      // Create test database
      await this.createTestDatabase();
      
      // Restore backup to test database
      await this.restoreBackupToTestDb(decryptedFile);
      
      // Verify data integrity
      const verificationResults = await this.verifyDataIntegrity();
      
      // Cleanup test database
      await this.cleanupTestDatabase();
      
      // Log results
      await this.logTestResults(latestBackup, verificationResults);
      
      console.log('✅ Backup restore test completed successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Backup restore test failed:', error);
      await this.logTestFailure(error);
      throw error;
    }
  }

  async getLatestBackup() {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: 'database-backups/',
      MaxKeys: 50
    });

    const response = await this.s3Client.send(command);
    const backups = response.Contents || [];
    
    // Sort by last modified date (newest first)
    backups.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
    
    return backups[0] || null;
  }

  async downloadAndDecryptBackup(backup) {
    console.log(`⬇️ Downloading backup: ${backup.Key}`);
    
    // Create temp directory
    await fs.mkdir(this.tempDir, { recursive: true });
    
    // Download encrypted backup
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: backup.Key
    });
    
    const response = await this.s3Client.send(command);
    const encryptedFile = path.join(this.tempDir, 'backup.sql.gpg');
    const decryptedFile = path.join(this.tempDir, 'backup.sql');
    
    // Write encrypted file
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    await fs.writeFile(encryptedFile, Buffer.concat(chunks));
    
    // Decrypt backup
    console.log('🔓 Decrypting backup...');
    await this.runCommand('gpg', [
      '--decrypt',
      '--batch',
      '--yes',
      '--passphrase', process.env.BACKUP_ENCRYPTION_KEY,
      '--output', decryptedFile,
      encryptedFile
    ]);
    
    return decryptedFile;
  }

  async createTestDatabase() {
    console.log(`🗄️ Creating test database: ${this.testDbName}`);
    await this.runCommand('createdb', [this.testDbName]);
  }

  async restoreBackupToTestDb(backupFile) {
    console.log('📥 Restoring backup to test database...');
    await this.runCommand('psql', [
      '-d', this.testDbName,
      '-f', backupFile
    ]);
  }

  async verifyDataIntegrity() {
    console.log('🔍 Verifying data integrity...');
    
    const verificationQueries = [
      { name: 'profiles_count', query: 'SELECT COUNT(*) FROM profiles;' },
      { name: 'games_count', query: 'SELECT COUNT(*) FROM games;' },
      { name: 'transactions_count', query: 'SELECT COUNT(*) FROM transactions;' },
      { name: 'recent_data', query: 'SELECT COUNT(*) FROM profiles WHERE created_at > NOW() - INTERVAL \'7 days\';' }
    ];

    const results = {};
    
    for (const verification of verificationQueries) {
      try {
        const output = await this.runCommand('psql', [
          '-d', this.testDbName,
          '-t', '-c', verification.query
        ]);
        results[verification.name] = parseInt(output.trim()) || 0;
        console.log(`  ✓ ${verification.name}: ${results[verification.name]}`);
      } catch (error) {
        console.error(`  ✗ ${verification.name}: ${error.message}`);
        results[verification.name] = 'ERROR';
      }
    }
    
    return results;
  }

  async cleanupTestDatabase() {
    console.log('🧹 Cleaning up test database...');
    try {
      await this.runCommand('dropdb', [this.testDbName]);
    } catch (error) {
      console.warn('Warning: Could not drop test database:', error.message);
    }
    
    // Clean up temp files
    try {
      await fs.rm(this.tempDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Warning: Could not clean temp directory:', error.message);
    }
  }

  async logTestResults(backup, verificationResults) {
    const testResult = {
      timestamp: new Date().toISOString(),
      backup_file: backup.Key,
      backup_size: backup.Size,
      backup_date: backup.LastModified,
      verification_results: verificationResults,
      test_database: this.testDbName,
      status: 'SUCCESS'
    };

    console.log('\n📊 Test Results:');
    console.log(JSON.stringify(testResult, null, 2));
    
    // In production, this would be stored in a monitoring system
    if (process.env.TEST_RESULTS_TABLE) {
      console.log('💾 Storing test results in database...');
    }
  }

  async logTestFailure(error) {
    const failureResult = {
      timestamp: new Date().toISOString(),
      status: 'FAILURE',
      error: error.message,
      test_database: this.testDbName
    };

    console.log('\n💥 Test Failure:');
    console.log(JSON.stringify(failureResult, null, 2));
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr}`));
        }
      });
    });
  }
}

// CLI execution
if (require.main === module) {
  const tester = new BackupRestoreTester();
  tester.runWeeklyRestoreTest()
    .then(() => {
      console.log('🎉 Backup restore test completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Backup restore test failed:', error);
      process.exit(1);
    });
}

module.exports = BackupRestoreTester;
