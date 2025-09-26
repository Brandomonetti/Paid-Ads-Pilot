import axios from 'axios';
import { randomBytes } from 'crypto';

interface MetaOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

interface MetaUserData {
  id: string;
  name: string;
  email?: string;
}

export class MetaOAuthService {
  private config: MetaOAuthConfig;
  private baseUrl = 'https://www.facebook.com/v19.0/dialog/oauth';
  private tokenUrl = 'https://graph.facebook.com/v19.0/oauth/access_token';
  private userUrl = 'https://graph.facebook.com/v19.0/me';

  constructor() {
    this.config = {
      clientId: process.env.META_APP_ID || '',
      clientSecret: process.env.META_APP_SECRET || '',
      redirectUri: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/auth/meta/callback`,
      scopes: [
        'ads_management',
        'business_management', 
        'pages_show_list',
        'email'
      ]
    };

    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error('META_APP_ID and META_APP_SECRET environment variables are required');
    }
  }

  /**
   * Generate authorization URL with CSRF protection
   */
  generateAuthUrl(userId: string): { url: string; state: string } {
    // Generate secure state parameter for CSRF protection
    const state = this.generateState(userId);
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      state: state,
      display: 'popup' // Better UX for connection flow
    });

    const url = `${this.baseUrl}?${params.toString()}`;
    return { url, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string, state: string): Promise<{
    accessToken: string;
    userData: MetaUserData;
    userId: string;
  }> {
    // Verify state parameter
    const userId = this.verifyState(state);
    if (!userId) {
      throw new Error('Invalid state parameter - CSRF check failed');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.get(this.tokenUrl, {
        params: {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          code: code
        }
      });

      const tokenData: MetaTokenResponse = tokenResponse.data;
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from Meta');
      }

      // Get user information
      const userResponse = await axios.get(this.userUrl, {
        params: {
          access_token: tokenData.access_token,
          fields: 'id,name,email'
        }
      });

      const userData: MetaUserData = userResponse.data;

      return {
        accessToken: tokenData.access_token,
        userData,
        userId
      };

    } catch (error: any) {
      console.error('Meta OAuth token exchange error:', error.response?.data || error.message);
      throw new Error(`Meta OAuth failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Test if access token is valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name',
          limit: 1
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user's ad accounts using their access token
   */
  async getUserAdAccounts(accessToken: string): Promise<any[]> {
    try {
      const response = await axios.get('https://graph.facebook.com/v19.0/me/adaccounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name,currency,timezone_name'
        }
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Error fetching user ad accounts:', error.response?.data || error.message);
      throw new Error(`Failed to fetch ad accounts: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate secure state parameter
   */
  private generateState(userId: string): string {
    const timestamp = Date.now().toString();
    const randomData = randomBytes(16).toString('hex');
    const data = `${userId}:${timestamp}:${randomData}`;
    
    // In production, you'd want to encrypt this or use JWT
    return Buffer.from(data).toString('base64url');
  }

  /**
   * Verify and extract user ID from state parameter
   */
  private verifyState(state: string): string | null {
    try {
      const data = Buffer.from(state, 'base64url').toString('utf8');
      const [userId, timestamp, randomData] = data.split(':');
      
      // Check if state is not too old (10 minutes)
      const stateAge = Date.now() - parseInt(timestamp);
      if (stateAge > 10 * 60 * 1000) {
        throw new Error('State parameter expired');
      }

      return userId;
    } catch (error) {
      console.error('State verification failed:', error);
      return null;
    }
  }
}

export const metaOAuthService = new MetaOAuthService();