import { API_BASE_URL } from "./auth";

export function openStream(
  sessionId: string,
  token: string,
  onQuestion: (question: string) => void,
  onComplete: (result: any) => void,
  onError: (error: string) => void
): () => void {
  const es = new EventSource(
    `${API_BASE_URL}/api/session/${sessionId}/stream?token=${token}`
  );

  es.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      console.log("Data: ", data);
      if (data.heartbeat) return;
      if (data.error) {
        onError(data.error);
        return;
      }
      if (data.complete) {
        onComplete(data);
        es.close();
      } else if (data.question) {
        console.log("Question: ", data.question);
        onQuestion(data.question);
      }
    } catch (err) {
      console.error("Failed to parse SSE message", err);
    }
  };

  es.onerror = () => {
    // EventSource auto-reconnects natively; no manual retry required for basic usage.
    console.warn("SSE stream error, retrying...");
  };

  return () => es.close();
}
