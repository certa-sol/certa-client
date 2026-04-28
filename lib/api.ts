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
