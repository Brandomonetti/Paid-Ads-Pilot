import crypto from 'crypto';
import { Request, Response } from 'express';
import { metaOAuthService } from './meta-oauth-service';
import { storage } from './storage';

// Configuration
const BROKER_SECRET = process.env.SESSION_SECRET;
if (!BROKER_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required for OAuth broker security');
}
// TypeScript assertion after runtime check
const brokerSecret: string = BROKER_SECRET;
const LINK_SESSION_EXPIRY = 15 * 60 * 1000; // 15 minutes

// In-memory store for link sessions (in production, use Redis)
interface LinkSession {
  id: string;
  userId: string;
  origin: string;
  nonce: string;
  expiresAt: number;
  completed?: boolean;
  accessToken?: string;
  error?: string;
}

const linkSessions = new Map<string, LinkSession>();

// Clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of Array.from(linkSessions.entries())) {
    if (session.expiresAt < now) {
      linkSessions.delete(id);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Generate HMAC signature for state verification
 */
function signState(data: string): string {
  return crypto.createHmac('sha256', brokerSecret).update(data).digest('hex');
}

/**
 * Verify HMAC signature
 */
function verifyState(data: string, signature: string): boolean {
  const expectedSignature = signState(data);
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
}

/**
 * Create a new link session
 */
function createLinkSession(userId: string, origin: string): LinkSession {
  const id = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + LINK_SESSION_EXPIRY;
  
  const session: LinkSession = {
    id,
    userId,
    origin,
    nonce,
    expiresAt
  };
  
  linkSessions.set(id, session);
  return session;
}

/**
 * OAuth Broker: Start Meta OAuth flow
 * Creates a link session and returns Meta authorization URL with broker redirect
 */
export async function startMetaOAuth(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get the origin of the requesting app
    const origin = req.get('origin') || req.get('referer')?.split('/').slice(0, 3).join('/');
    if (!origin) {
      return res.status(400).json({ error: 'Origin header required' });
    }

    // Create secure link session
    const linkSession = createLinkSession(userId, origin);

    // Use a static broker redirect URI (this will be configured in Meta app)
    const brokerRedirectUri = process.env.OAUTH_BROKER_URL 
      ? `${process.env.OAUTH_BROKER_URL}/meta/callback`
      : `${req.protocol}://${req.get('host')}/api/oauth-broker/meta/callback`;
      
    console.log('🔗 OAuth Broker Redirect URI:', brokerRedirectUri);

    // Create signed state with link session ID
    const stateData = JSON.stringify({ 
      linkSessionId: linkSession.id, 
      nonce: linkSession.nonce 
    });
    const signature = signState(stateData);
    const signedState = Buffer.from(JSON.stringify({ data: stateData, signature })).toString('base64');

    // Generate Meta authorization URL with broker redirect
    // Override the state with our signed state
    const { url: tempUrl } = metaOAuthService.generateAuthUrl(brokerRedirectUri);
    // Replace the generated state with our signed state
    const url = tempUrl.replace(/state=[^&]+/, `state=${encodeURIComponent(signedState)}`);

    res.json({
      authUrl: url,
      linkSessionId: linkSession.id,
      expiresAt: linkSession.expiresAt
    });

  } catch (error) {
    console.error('Error starting OAuth broker flow:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
}

/**
 * OAuth Broker: Handle Meta OAuth callback
 * Processes the OAuth response and completes the link session
 */
export async function handleMetaCallback(req: Request, res: Response) {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.send(generateCallbackPage(null, `OAuth error: ${error}`));
    }

    if (!code || !state) {
      return res.send(generateCallbackPage(null, 'Missing OAuth parameters'));
    }

    // Verify and decode signed state
    let linkSessionId: string;
    let nonce: string;
    try {
      const stateObj = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const { data, signature } = stateObj;
      
      if (!verifyState(data, signature)) {
        throw new Error('Invalid state signature');
      }
      
      const stateData = JSON.parse(data);
      linkSessionId = stateData.linkSessionId;
      nonce = stateData.nonce;
    } catch (err) {
      return res.send(generateCallbackPage(null, 'Invalid or corrupted state parameter'));
    }

    // Retrieve link session
    const linkSession = linkSessions.get(linkSessionId);
    if (!linkSession) {
      return res.send(generateCallbackPage(null, 'Link session not found or expired'));
    }

    if (linkSession.nonce !== nonce) {
      return res.send(generateCallbackPage(null, 'Invalid session nonce'));
    }

    if (linkSession.expiresAt < Date.now()) {
      linkSessions.delete(linkSessionId);
      return res.send(generateCallbackPage(null, 'Link session expired'));
    }

    // Exchange code for access token
    const brokerRedirectUri = process.env.OAUTH_BROKER_URL 
      ? `${process.env.OAUTH_BROKER_URL}/meta/callback`
      : `${req.protocol}://${req.get('host')}/api/oauth-broker/meta/callback`;
      
    const tokenData = await metaOAuthService.exchangeCodeForToken(code as string, brokerRedirectUri);
    
    // Persist the token to storage for the authenticated user
    await storage.upsertUser({
      id: linkSession.userId,
      metaAccessToken: tokenData.accessToken,
      metaAccountId: tokenData.userData.id,
      metaConnectedAt: new Date()
    });
    
    // Complete link session (no need to store token in session)
    linkSession.completed = true;

    // Return success page with postMessage
    res.send(generateCallbackPage(linkSession, null));

  } catch (error) {
    console.error('Error in OAuth broker callback:', error);
    
    // Try to find link session from state to send error
    let linkSessionId: string | null = null;
    try {
      const stateObj = JSON.parse(Buffer.from(req.query.state as string, 'base64').toString());
      const stateData = JSON.parse(stateObj.data);
      linkSessionId = stateData.linkSessionId;
    } catch {}

    if (linkSessionId) {
      const linkSession = linkSessions.get(linkSessionId);
      if (linkSession) {
        linkSession.error = 'OAuth callback failed';
      }
    }

    res.send(generateCallbackPage(null, 'OAuth callback failed'));
  }
}

/**
 * OAuth Broker: Check link session status
 * Allows main app to poll for completion
 */
export async function checkLinkSessionStatus(req: Request, res: Response) {
  try {
    const { linkSessionId } = req.params;
    
    const linkSession = linkSessions.get(linkSessionId);
    if (!linkSession) {
      return res.status(404).json({ error: 'Link session not found' });
    }

    if (linkSession.expiresAt < Date.now()) {
      linkSessions.delete(linkSessionId);
      return res.status(410).json({ error: 'Link session expired' });
    }

    res.json({
      completed: linkSession.completed || false,
      error: linkSession.error || null,
      expiresAt: linkSession.expiresAt
    });

    // Clean up completed sessions
    if (linkSession.completed || linkSession.error) {
      setTimeout(() => {
        linkSessions.delete(linkSessionId);
      }, 30000); // Keep for 30 seconds for final status checks
    }

  } catch (error) {
    console.error('Error checking link session status:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
}

/**
 * Generate HTML page for OAuth callback with postMessage
 */
function generateCallbackPage(linkSession: LinkSession | null, error: string | null): string {
  const isSuccess = linkSession?.completed && !error;
  const message = {
    type: 'oauth-complete',
    success: isSuccess,
    linkSessionId: linkSession?.id || null,
    error: error || linkSession?.error || null
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Meta Connection ${isSuccess ? 'Successful' : 'Failed'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        .message {
            opacity: 0.9;
            margin-bottom: 1rem;
        }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        ${isSuccess 
          ? `<div class="icon">✅</div>
             <div class="title">Connection Successful</div>
             <div class="message">Your Meta Ads account has been connected successfully.</div>`
          : `<div class="icon">❌</div>
             <div class="title">Connection Failed</div>
             <div class="message">${error || 'An unexpected error occurred.'}</div>`
        }
        <div style="margin-top: 1rem;">
            <div class="spinner"></div>
            <span style="margin-left: 0.5rem;">Closing window...</span>
        </div>
    </div>

    <script>
        // Send result to parent window
        if (window.opener) {
            try {
                const targetOrigin = '${linkSession?.origin || '*'}';
                window.opener.postMessage(${JSON.stringify(message)}, targetOrigin);
            } catch (err) {
                console.error('Failed to send postMessage:', err);
            }
        }

        // Close window after a short delay
        setTimeout(() => {
            window.close();
        }, 2000);
    </script>
</body>
</html>`;
}