
import { SSMClient, GetParameterCommand, GetParametersByPathCommand } from '@aws-sdk/client-ssm';

interface SecretsCache {
  [key: string]: string;
}

class SecretsManager {
  private client: SSMClient;
  private cache: SecretsCache = {};
  private environment: string;
  private region: string;

  constructor() {
    this.environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    this.client = new SSMClient({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        sessionToken: process.env.AWS_SESSION_TOKEN
      }
    });
  }

  async getSecret(parameterName: string): Promise<string> {
    const fullPath = `/rust-skins/${this.environment}/${parameterName}`;
    
    // Check cache first
    if (this.cache[fullPath]) {
      return this.cache[fullPath];
    }

    try {
      const command = new GetParameterCommand({
        Name: fullPath,
        WithDecryption: true
      });

      const response = await this.client.send(command);
      const value = response.Parameter?.Value;

      if (!value) {
        throw new Error(`Secret not found: ${fullPath}`);
      }

      // Cache the value
      this.cache[fullPath] = value;
      
      console.log(`[SECRETS] Successfully loaded secret: ${parameterName} (path: ${fullPath})`);
      return value;
    } catch (error) {
      console.error(`[SECRETS] Failed to load secret ${parameterName}:`, error);
      throw new Error(`Failed to load secret: ${parameterName}`);
    }
  }

  async loadAllSecrets(): Promise<void> {
    const basePath = `/rust-skins/${this.environment}/`;
    
    try {
      const command = new GetParametersByPathCommand({
        Path: basePath,
        Recursive: true,
        WithDecryption: true
      });

      const response = await this.client.send(command);
      const parameters = response.Parameters || [];

      console.log(`[SECRETS] Loading ${parameters.length} secrets from Parameter Store...`);

      for (const param of parameters) {
        if (param.Name && param.Value) {
          this.cache[param.Name] = param.Value;
          
          // Set environment variables for backward compatibility
          const envVarName = this.parameterToEnvVar(param.Name);
          process.env[envVarName] = param.Value;
          
          console.log(`[SECRETS] Loaded: ${param.Name} -> ${envVarName}`);
        }
      }

      console.log(`[SECRETS] Successfully loaded ${parameters.length} secrets`);
    } catch (error) {
      console.error('[SECRETS] Failed to load secrets:', error);
      throw new Error('Failed to initialize secrets manager');
    }
  }

  private parameterToEnvVar(parameterName: string): string {
    // Convert parameter path to environment variable name
    // /rust-skins/prod/database/connection-url -> DATABASE_CONNECTION_URL
    const parts = parameterName.split('/').slice(3); // Remove /rust-skins/env/
    return parts.join('_').toUpperCase().replace(/-/g, '_');
  }

  // Specific getters for common secrets
  async getDatabaseUrl(): Promise<string> {
    return this.getSecret('database/connection-url');
  }

  async getSupabaseAnonKey(): Promise<string> {
    return this.getSecret('supabase/anon-key');
  }

  async getSupabaseServiceRoleKey(): Promise<string> {
    return this.getSecret('supabase/service-role-key');
  }

  async getJwtSecret(): Promise<string> {
    return this.getSecret('auth/jwt-secret');
  }

  async getSteamApiKey(): Promise<string> {
    return this.getSecret('steam/api-key');
  }

  async getStripeSecretKey(): Promise<string> {
    return this.getSecret('payments/stripe-secret');
  }

  async getPaypalClientSecret(): Promise<string> {
    return this.getSecret('payments/paypal-secret');
  }

  async getGpgPrivateKey(): Promise<string> {
    return this.getSecret('security/gpg-private-key');
  }
}

// Export singleton instance
export const secretsManager = new SecretsManager();

// Initialize secrets on module load
export const initializeSecrets = async (): Promise<void> => {
  await secretsManager.loadAllSecrets();
};
