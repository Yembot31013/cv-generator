/**
 * Centralized Gemini model identifiers.
 *
 * Keeping model names in one place guarantees consistency across all AI features
 * and makes upgrading (or replacing a deprecated model) a single-line change.
 *
 * @see https://ai.google.dev/gemini-api/docs/models
 */
export const GEMINI_MODELS = {
  /** Fast, cost-effective model for enhancement, tailoring, parsing, and review. */
  FLASH: 'gemini-2.5-flash',
  /** High-reasoning model (thinking mode) for complex extraction tasks. */
  PRO: 'gemini-2.5-pro',
} as const;

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS];
