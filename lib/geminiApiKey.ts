/**
 * Normalizes a Gemini API key pasted from Google AI Studio.
 * Trims whitespace and strips invisible characters that can appear when copying.
 */
export function normalizeGeminiApiKey(key: string): string {
  return key.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
}
