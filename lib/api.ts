import { API_BASE_URL } from "./auth";

export async function startDiagnostic(token: string): Promise<{ sessionId: string; question: string }> {
  const response = await fetch(`${API_BASE_URL}/api/session/diagnostic`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to start diagnostic");
  }

  return response.json();
}

export async function submitTurn(sessionId: string, answer: string, elapsedMs: number, token: string): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/turn`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ answer, elapsedMs })
  });

  if (!response.ok) {
    throw new Error("Failed to submit turn");
  }

  return response.json();
}

export async function getSessionResult(sessionId: string, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/session/${sessionId}/result`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to get session result");
  }

  return response.json();
}

export async function verifyPayment(signature: string, currency: string, token: string): Promise<{ verified: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ signature, currency })
  });

  if (!response.ok) {
    throw new Error("Failed to verify payment");
  }

  return response.json();
}

export async function getPaymentStatus(token: string): Promise<{
  hasPaidAssessment: boolean;
  payment: {
    signature: string;
    currency: string;
    verifiedAt: string;
  } | null;
}> {
  const response = await fetch(`${API_BASE_URL}/api/payment/status`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to get payment status");
  }

  return response.json();
}

export async function startAssessment(paymentSignature: string, currency: string, token: string): Promise<{ sessionId: string; question: string }> {
  const response = await fetch(`${API_BASE_URL}/api/session/assessment`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ paymentSignature, currency })
  });

  if (!response.ok) {
    throw new Error("Failed to start assessment");
  }

  return response.json();
}

export async function getCredential(mintAddress: string): Promise<{
  credential: {
    id: string;
    wallet: string;
    mintAddress: string;
    score: number;
    issuedAt: string;
  };
  verifyUrl: string;
  solscanUrl: string;
}> {
  const response = await fetch(`${API_BASE_URL}/api/credential/${mintAddress}`);
  if (!response.ok) {
    throw new Error("Credential not found");
  }
  return response.json();
}

export async function getCredentials(minScore: number = 70, limit: number = 20, offset: number = 0): Promise<{
  credentials: Array<{
    wallet: string;
    mintAddress: string;
    score: number;
    issuedAt: string;
  }>;
  total: number;
  hasMore: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/api/credentials?minScore=${minScore}&limit=${limit}&offset=${offset}`);
  if (!response.ok) {
    throw new Error("Failed to fetch credentials");
  }
  return response.json();
}

export async function getAllResults(token: string): Promise<{ results: any[] }> {
  const response = await fetch(`${API_BASE_URL}/api/results`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }

  return response.json();
}

export async function getCredentialsByWallet(walletAddress: string, token: string): Promise<{ credentials: any[] }> {
  const response = await fetch(`${API_BASE_URL}/api/credential/wallet/${walletAddress}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 403) throw new Error("Forbidden: Wallet mismatch");
    if (response.status === 401) throw new Error("Unauthorized");
    throw new Error("Failed to fetch wallet credentials");
  }

  return response.json();
}
