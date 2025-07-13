import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "686b4b75c5b4267d1f68b268", 
  requiresAuth: true // Ensure authentication is required for all operations
});
