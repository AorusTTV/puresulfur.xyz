
import { secretsManager, initializeSecrets } from '@/utils/secretsManager';

// Initialize secrets before application starts
export const initializeApplicationSecrets = async (): Promise<void> => {
  console.log('[APP] Initializing application secrets...');
  
  try {
    // Load all secrets from AWS Parameter Store
    await initializeSecrets();
    
    // Verify critical secrets are loaded
    await verifyCriticalSecrets();
    
    console.log('[APP] All secrets successfully initialized');
  } catch (error) {
    console.error('[APP] Failed to initialize secrets:', error);
    throw new Error('Application startup failed: secrets initialization error');
  }
};

const verifyCriticalSecrets = async (): Promise<void> => {
  const criticalSecrets = [
    'database/connection-url',
    'supabase/anon-key',
    'auth/jwt-secret'
  ];

  for (const secret of criticalSecrets) {
    try {
      const value = await secretsManager.getSecret(secret);
      if (!value) {
        throw new Error(`Critical secret ${secret} is empty`);
      }
      console.log(`[SECRETS] Verified critical secret: ${secret} ✓`);
    } catch (error) {
      console.error(`[SECRETS] Missing critical secret: ${secret}`);
      throw error;
    }
  }
};
