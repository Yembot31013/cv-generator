/**
 * Supported AI model catalog and resolution helpers.
 *
 * Only models marked `active: true` appear in the UI. Deprecated models are kept
 * in the catalog for migration but cannot be selected.
 *
 * @see https://ai.google.dev/gemini-api/docs/models
 */

export type AiProvider = 'gemini';

export type AiModelRole = 'flash' | 'pro';

export interface AiModelOption {
  id: string;
  label: string;
  description: string;
  provider: AiProvider;
  role: AiModelRole;
  /** Shown in the model picker when true */
  active: boolean;
  /** Pre-selected for new users */
  recommended?: boolean;
}

export const AI_MODEL_CATALOG: readonly AiModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    description: 'Fast and capable — enhancement, review, parsing, and edits',
    provider: 'gemini',
    role: 'flash',
    active: true,
    recommended: true,
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    description: 'Lower latency and cost for lighter tasks',
    provider: 'gemini',
    role: 'flash',
    active: true,
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Deep reasoning — best for CV extraction from PDFs/DOCX',
    provider: 'gemini',
    role: 'pro',
    active: true,
    recommended: true,
  },
] as const;

export const DEFAULT_FLASH_MODEL = 'gemini-2.5-flash';
export const DEFAULT_PRO_MODEL = 'gemini-2.5-pro';

const ACTIVE_IDS = new Set(
  AI_MODEL_CATALOG.filter((m) => m.active).map((m) => m.id)
);

/** Models available for a given role (flash vs pro). */
export function getModelsForRole(role: AiModelRole): AiModelOption[] {
  return AI_MODEL_CATALOG.filter((m) => m.active && m.role === role);
}

/** Resolve a stored model id to a valid active id, falling back to role default. */
export function resolveModelId(role: AiModelRole, storedId?: string | null): string {
  if (storedId && ACTIVE_IDS.has(storedId)) {
    const match = AI_MODEL_CATALOG.find((m) => m.id === storedId);
    if (match?.active && match.role === role) return storedId;
  }
  const roleDefault = getModelsForRole(role).find((m) => m.recommended)?.id
    ?? getModelsForRole(role)[0]?.id
    ?? (role === 'flash' ? DEFAULT_FLASH_MODEL : DEFAULT_PRO_MODEL);
  return roleDefault;
}

export function getModelLabel(modelId: string): string {
  return AI_MODEL_CATALOG.find((m) => m.id === modelId)?.label ?? modelId;
}

/** @deprecated Use resolveModelId('flash') — kept for gradual migration */
export const GEMINI_MODELS = {
  FLASH: DEFAULT_FLASH_MODEL,
  PRO: DEFAULT_PRO_MODEL,
} as const;

export type GeminiModel = string;
