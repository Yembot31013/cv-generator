/**
 * Resilience helpers for Gemini API calls.
 *
 * The Gemini API intermittently returns transient errors (503 model overloaded,
 * 429 rate limited, 5xx). These are usually temporary, so we retry with
 * exponential backoff + jitter before surfacing the failure to the user.
 */

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const RETRYABLE_KEYWORDS = [
  'unavailable',
  'resource_exhausted',
  'high demand',
  'overloaded',
  'try again later',
  'deadline',
  'internal error',
];

/**
 * Best-effort extraction of an HTTP/status code from the various error shapes
 * thrown by `@google/genai` (ApiError with `status`/`code`, or a JSON message).
 */
function extractStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const candidate = error as { status?: unknown; code?: unknown; message?: unknown };

  if (typeof candidate.status === 'number') return candidate.status;
  if (typeof candidate.code === 'number') return candidate.code;

  if (typeof candidate.message === 'string') {
    const match = candidate.message.match(/"code"\s*:\s*(\d{3})/);
    if (match) return Number.parseInt(match[1], 10);
  }
  return undefined;
}

/**
 * Determine whether an error is transient and therefore worth retrying.
 */
export function isRetryableGeminiError(error: unknown): boolean {
  const status = extractStatusCode(error);
  if (status !== undefined && RETRYABLE_STATUS.has(status)) return true;

  const message = (error as { message?: unknown })?.message;
  if (typeof message === 'string') {
    const lower = message.toLowerCase();
    return RETRYABLE_KEYWORDS.some((keyword) => lower.includes(keyword));
  }
  return false;
}

export interface RetryOptions {
  /** Number of retries after the initial attempt. */
  retries?: number;
  /** Base delay used for exponential backoff (ms). */
  baseDelayMs?: number;
  /** Upper bound for any single backoff delay (ms). */
  maxDelayMs?: number;
  /** Invoked before each retry (useful for logging / UX). */
  onRetry?: (attempt: number, error: unknown, delayMs: number) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run an async Gemini operation, retrying transient failures with exponential
 * backoff and jitter. Non-retryable errors are thrown immediately.
 */
export async function withGeminiRetry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 1000;
  const maxDelayMs = options.maxDelayMs ?? 8000;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableGeminiError(error)) {
        throw error;
      }
      const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const delayMs = Math.round(exponential + Math.random() * 0.3 * exponential);
      options.onRetry?.(attempt + 1, error, delayMs);
      await sleep(delayMs);
    }
  }
  throw lastError;
}
