import fs from "node:fs/promises";

const LOG_PATH = "/Users/siyu/my-product/.cursor/debug-e4b94e.log";

export type DebugPayload = {
  // Optional identifiers for correlating a reproduction run.
  sessionId?: string;
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: unknown;
  timestamp: number;
};

export async function appendDebug(payload: DebugPayload) {
  try {
    await fs.appendFile(LOG_PATH, `${JSON.stringify(payload)}\n`);
  } catch {
    // Evidence is best-effort; never fail checkout/payment flow because logging failed.
    // #region agent log
    // eslint-disable-next-line no-console
    console.error("appendDebug failed to write log file:", LOG_PATH);
    // #endregion
  }
}

