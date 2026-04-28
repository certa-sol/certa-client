export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api.railway.app';

export async function getChallenge(walletAddress: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/challenge`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }),
  });

  if (!response.ok) {
    throw new Error('Failed to get challenge');
  }

  const data = await response.json();
  return data.challenge;
}

export async function verifySignature(
  walletAddress: string,
  challenge: string,
  signature: string
): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      walletAddress,
      challenge,
      signature,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify signature');
  }

  const data = await response.json();
  return data.token;
}
