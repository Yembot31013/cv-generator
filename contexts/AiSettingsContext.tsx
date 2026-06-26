'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  DEFAULT_FLASH_MODEL,
  DEFAULT_PRO_MODEL,
  resolveModelId,
  type AiModelRole,
} from '@/lib/aiModels';

interface AiSettingsContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  hasApiKey: boolean;
  flashModel: string;
  proModel: string;
  setFlashModel: (modelId: string) => void;
  setProModel: (modelId: string) => void;
}

const ApiKeyContext = createContext<AiSettingsContextType | undefined>(undefined);

const STORAGE_KEYS = {
  apiKey: 'gemini_api_key',
  flashModel: 'ai_flash_model',
  proModel: 'ai_pro_model',
} as const;

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [flashModel, setFlashModelState] = useState(DEFAULT_FLASH_MODEL);
  const [proModel, setProModelState] = useState(DEFAULT_PRO_MODEL);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
    const storedFlash = localStorage.getItem(STORAGE_KEYS.flashModel);
    const storedPro = localStorage.getItem(STORAGE_KEYS.proModel);

    if (storedKey) setApiKeyState(storedKey);
    setFlashModelState(resolveModelId('flash', storedFlash));
    setProModelState(resolveModelId('pro', storedPro));
    setIsLoaded(true);
  }, []);

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key);
    if (key) {
      localStorage.setItem(STORAGE_KEYS.apiKey, key);
    } else {
      localStorage.removeItem(STORAGE_KEYS.apiKey);
    }
  }, []);

  const setFlashModel = useCallback((modelId: string) => {
    const resolved = resolveModelId('flash', modelId);
    setFlashModelState(resolved);
    localStorage.setItem(STORAGE_KEYS.flashModel, resolved);
  }, []);

  const setProModel = useCallback((modelId: string) => {
    const resolved = resolveModelId('pro', modelId);
    setProModelState(resolved);
    localStorage.setItem(STORAGE_KEYS.proModel, resolved);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        setApiKey,
        hasApiKey: !!apiKey,
        flashModel,
        proModel,
        setFlashModel,
        setProModel,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export function useAiSettings(): AiSettingsContextType {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useAiSettings must be used within an ApiKeyProvider');
  }
  return context;
}

/** @deprecated Prefer useAiSettings — kept for existing imports */
export function useApiKey() {
  const { apiKey, setApiKey, hasApiKey } = useAiSettings();
  return { apiKey, setApiKey, hasApiKey };
}
