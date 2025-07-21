
#!/usr/bin/env node

/**
 * Application startup script with secrets initialization
 * This script loads secrets from AWS Parameter Store before starting the application
 */

const { execSync } = require('child_process');
const { SSMClient, GetParametersByPathCommand } = require('@aws-sdk/client-ssm');

const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

console.log('🔒 Starting Rust-Skins application with secure secrets loading...');
console.log(`Environment: ${ENVIRONMENT}`);
console.log(`AWS Region: ${AWS_REGION}`);

async function loadSecrets() {
  const client = new SSMClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      sessionToken: process.env.AWS_SESSION_TOKEN
    }
  });

  const basePath = `/rust-skins/${ENVIRONMENT}/`;
  
  try {
    console.log(`🔍 Loading secrets from Parameter Store path: ${basePath}`);
    
    const command = new GetParametersByPathCommand({
      Path: basePath,
      Recursive: true,
      WithDecryption: true
    });

    const response = await client.send(command);
    const parameters = response.Parameters || [];

    console.log(`📦 Found ${parameters.length} secrets in Parameter Store`);

    // Set environment variables from Parameter Store
    for (const param of parameters) {
      if (param.Name && param.Value) {
        const envVarName = parameterToEnvVar(param.Name);
        process.env[envVarName] = param.Value;
        
        // Log without revealing actual values
        const maskedValue = param.Value.length > 10 
          ? param.Value.substring(0, 8) + '***[REDACTED]***'
          : '***[REDACTED]***';
        
        console.log(`✅ Loaded: ${param.Name} -> ${envVarName} (${maskedValue})`);
      }
    }

    // Verify critical secrets
    const criticalSecrets = [
      'DATABASE_CONNECTION_URL',
      'SUPABASE_ANON_KEY', 
      'AUTH_JWT_SECRET'
    ];

    for (const secret of criticalSecrets) {
      if (!process.env[secret]) {
        throw new Error(`Critical secret missing: ${secret}`);
      }
      console.log(`🔑 Verified critical secret: ${secret} ✓`);
    }

    console.log('🎉 All secrets loaded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to load secrets from Parameter Store:', error.message);
    
    if (ENVIRONMENT === 'development' || ENVIRONMENT === 'dev') {
      console.log('⚠️  Development mode: continuing with local environment variables');
      return true;
    }
    
    throw error;
  }
}

function parameterToEnvVar(parameterName) {
  // Convert /rust-skins/prod/database/connection-url -> DATABASE_CONNECTION_URL
  const parts = parameterName.split('/').slice(3); // Remove /rust-skins/env/
  return parts.join('_').toUpperCase().replace(/-/g, '_');
}

async function startApplication() {
  try {
    // Load secrets first
    await loadSecrets();
    
    // Log startup info (without secrets)
    console.log('\n🚀 Starting application...');
    console.log('Process environment variables loaded:');
    console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`- AWS_REGION: ${process.env.AWS_REGION}`);
    console.log(`- SUPABASE_URL: ${process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
    console.log(`- SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✓ Set (***[REDACTED]***)' : '✗ Missing'}`);
    console.log(`- DATABASE_CONNECTION_URL: ${process.env.DATABASE_CONNECTION_URL ? '✓ Set (***[REDACTED]***)' : '✗ Missing'}`);
    console.log(`- AUTH_JWT_SECRET: ${process.env.AUTH_JWT_SECRET ? '✓ Set (***[REDACTED]***)' : '✗ Missing'}`);
    
    // Start the application
    if (process.env.NODE_ENV === 'production') {
      console.log('🏭 Starting production server...');
      execSync('npm start', { stdio: 'inherit' });
    } else {
      console.log('🛠️  Starting development server...');
      execSync('npm run dev', { stdio: 'inherit' });
    }
  } catch (error) {
    console.error('💥 Application startup failed:', error.message);
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Start the application
startApplication().catch(error => {
  console.error('💥 Startup error:', error);
  process.exit(1);
});
