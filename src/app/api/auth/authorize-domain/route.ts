import { NextRequest, NextResponse } from 'next/server';
import { createSign } from 'crypto';
import { getServiceAccount } from '@/lib/firebase-admin';

// Cache for the access token
let _tokenCache: { token: string; expiresAt: number } | null = null;

/**
 * Get an OAuth2 access token from the service account using JWT.
 */
async function getAccessToken(): Promise<string> {
  if (_tokenCache && Date.now() < _tokenCache.expiresAt) {
    return _tokenCache.token;
  }

  const sa = getServiceAccount() as { client_email: string; private_key: string };

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/cloud-platform',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  ).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(sa.private_key, 'base64url');

  const jwt = `${header}.${payload}.${signature}`;

  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const data = await resp.json();
  if (!data.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
  }

  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return _tokenCache.token;
}

/**
 * POST /api/auth/authorize-domain
 *
 * Uses the Identity Toolkit Admin API to add the requesting origin
 * to Firebase Auth's authorized domains list, so sendEmailVerification
 * accepts the continue URL.
 */
export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain || typeof domain !== 'string') {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Read project ID from service account
    const sa = getServiceAccount() as { project_id: string };
    const projectId = sa.project_id;

    const token = await getAccessToken();

    // Get current config (which includes authorizedDomains)
    const getResp = await fetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!getResp.ok) {
      const errText = await getResp.text();
      console.error('[authorize-domain] Failed to get config:', getResp.status, errText);
      return NextResponse.json({ error: `Config fetch failed: ${getResp.status}` }, { status: 500 });
    }

    const config = await getResp.json();
    const domainList: string[] = config.authorizedDomains ?? [];

    if (domainList.includes(domain)) {
      return NextResponse.json({ ok: true, alreadyAuthorized: true, domain });
    }

    // Update config with the new domain added
    const updateResp = await fetch(
      `https://identitytoolkit.googleapis.com/admin/v2/projects/${projectId}/config?updateMask=authorizedDomains`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorizedDomains: [...domainList, domain],
        }),
      }
    );

    if (!updateResp.ok) {
      const errText = await updateResp.text();
      console.error('[authorize-domain] Failed to update config:', updateResp.status, errText);
      return NextResponse.json({ error: `Config update failed: ${updateResp.status}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true, added: true, domain });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[authorize-domain] Failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}