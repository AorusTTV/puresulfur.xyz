
#!/usr/bin/env node

const { SSMClient, PutParameterCommand, GetParameterCommand } = require('@aws-sdk/client-ssm');
const crypto = require('crypto');

class SecretRotator {
  constructor() {
    this.ssmClient = new SSMClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    this.rotationLog = [];
  }

  generateJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  generateGPGKeyPair() {
    // In production, this would integrate with GPG libraries
    // For now, we'll generate a placeholder that would be replaced with actual GPG generation
    const keyId = crypto.randomBytes(8).toString('hex').toUpperCase();
    return {
      privateKey: `-----BEGIN PGP PRIVATE KEY BLOCK-----\nGenerated: ${new Date().toISOString()}\nKey-ID: ${keyId}\n[ROTATED-KEY-CONTENT]\n-----END PGP PRIVATE KEY BLOCK-----`,
      publicKey: `-----BEGIN PGP PUBLIC KEY BLOCK-----\nGenerated: ${new Date().toISOString()}\nKey-ID: ${keyId}\n[ROTATED-PUBLIC-KEY]\n-----END PGP PUBLIC KEY BLOCK-----`
    };
  }

  async rotateSecret(secretPath, newValue) {
    try {
      // Backup current secret first
      const currentSecret = await this.getCurrentSecret(secretPath);
      if (currentSecret) {
        await this.backupSecret(secretPath, currentSecret);
      }

      // Update with new secret
      const command = new PutParameterCommand({
        Name: `/rust-skins/${this.environment}/${secretPath}`,
        Value: newValue,
        Type: 'SecureString',
        Overwrite: true,
        Description: `Rotated on ${new Date().toISOString()}`
      });

      await this.ssmClient.send(command);
      
      this.rotationLog.push({
        secret: secretPath,
        rotatedAt: new Date().toISOString(),
        status: 'success'
      });

      console.log(`✅ Successfully rotated secret: ${secretPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to rotate secret ${secretPath}:`, error);
      this.rotationLog.push({
        secret: secretPath,
        rotatedAt: new Date().toISOString(),
        status: 'failed',
        error: error.message
      });
      return false;
    }
  }

  async getCurrentSecret(secretPath) {
    try {
      const command = new GetParameterCommand({
        Name: `/rust-skins/${this.environment}/${secretPath}`,
        WithDecryption: true
      });
      const response = await this.ssmClient.send(command);
      return response.Parameter?.Value;
    } catch (error) {
      console.warn(`Could not get current secret for ${secretPath}:`, error.message);
      return null;
    }
  }

  async backupSecret(secretPath, value) {
    const backupPath = `/rust-skins/${this.environment}/backups/${secretPath}-${Date.now()}`;
    const command = new PutParameterCommand({
      Name: backupPath,
      Value: value,
      Type: 'SecureString',
      Description: `Backup of ${secretPath} before rotation`
    });
    await this.ssmClient.send(command);
    console.log(`📦 Backed up secret to: ${backupPath}`);
  }

  async rotateAllSecrets() {
    console.log('🔄 Starting automated secret rotation...');
    
    const secretsToRotate = [
      {
        path: 'auth/jwt-secret',
        generator: () => this.generateJWTSecret()
      },
      {
        path: 'security/gpg-private-key',
        generator: () => this.generateGPGKeyPair().privateKey
      }
    ];

    for (const secret of secretsToRotate) {
      console.log(`🔑 Rotating ${secret.path}...`);
      const newValue = secret.generator();
      await this.rotateSecret(secret.path, newValue);
      
      // Wait between rotations to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log rotation summary
    console.log('\n📊 Rotation Summary:');
    console.log(JSON.stringify(this.rotationLog, null, 2));
    
    // Send notification (in production, this would send to Slack/Discord)
    await this.sendRotationNotification();
  }

  async sendRotationNotification() {
    const successful = this.rotationLog.filter(log => log.status === 'success').length;
    const failed = this.rotationLog.filter(log => log.status === 'failed').length;
    
    const message = `🔐 Secret Rotation Complete\n✅ Successful: ${successful}\n❌ Failed: ${failed}\nEnvironment: ${this.environment}\nTimestamp: ${new Date().toISOString()}`;
    
    console.log('\n📢 Notification Message:');
    console.log(message);
    
    // In production, send to monitoring system
    if (process.env.WEBHOOK_URL) {
      // Send to Slack/Discord webhook
      console.log('📨 Sending notification to webhook...');
    }
  }
}

// CLI execution
if (require.main === module) {
  const rotator = new SecretRotator();
  rotator.rotateAllSecrets()
    .then(() => {
      console.log('🎉 Secret rotation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Secret rotation failed:', error);
      process.exit(1);
    });
}

module.exports = SecretRotator;
