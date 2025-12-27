'use client';

import { useState } from 'react';
import { useApiKey } from '@/contexts/ApiKeyContext';

interface ApiKeyInputProps {
  theme?: 'dark' | 'light';
  onApiKeySet?: () => void;
}

export default function ApiKeyInput({ theme = 'dark', onApiKeySet }: ApiKeyInputProps) {
  const { apiKey, setApiKey } = useApiKey();
  const [inputValue, setInputValue] = useState(apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(!apiKey);

  const isDark = theme === 'dark';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputValue.trim()) {
      setError('Please enter your API key');
      return;
    }

    // Basic validation - Gemini API keys typically start with "AIza"
    if (!inputValue.trim().startsWith('AIza')) {
      setError('Invalid API key format. Gemini API keys typically start with "AIza"');
      return;
    }

    setIsValidating(true);
    
    // Simple validation by trying to create a minimal request
    try {
      // Just validate format, don't make actual API call
      setApiKey(inputValue.trim());
      setShowInstructions(false);
      onApiKeySet?.();
    } catch (err) {
      setError('Failed to validate API key. Please check and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setApiKey(null);
    setInputValue('');
    setShowInstructions(true);
  };

  if (apiKey && !showInstructions) {
    return (
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                API Key Configured
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {apiKey.substring(0, 10)}...{apiKey.substring(apiKey.length - 4)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isDark
                ? 'text-red-400 hover:bg-red-500/20 border border-red-500/30'
                : 'text-red-600 hover:bg-red-50 border border-red-300'
            }`}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}>
      <div className="space-y-4">
        <div>
          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gemini API Key Required
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            To use AI features, you need a Google Gemini API key. Don't worry, it's free and takes just a minute!
          </p>
        </div>

        {showInstructions && (
          <div className={`rounded-lg p-4 space-y-3 ${isDark ? 'bg-gray-900/50 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div>
              <h4 className={`font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span>📋</span> How to Get Your API Key
              </h4>
              <ol className={`space-y-2 text-sm list-decimal list-inside ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>
                  Click{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-semibold underline ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                  >
                    here to open Google AI Studio
                  </a>
                </li>
                <li>Sign in with your Google account</li>
                <li>Click "Create API Key"</li>
                <li>Copy the generated key</li>
                <li>Paste it below</li>
              </ol>
            </div>

            <div className="pt-2">
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
                  }
                `}
              >
                <span>🔑</span>
                Get API Key from Google AI Studio
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="api-key" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Paste Your API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              placeholder="AIza..."
              className={`
                w-full px-4 py-3 rounded-lg border transition-all
                ${isDark
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }
                ${error ? (isDark ? 'border-red-500' : 'border-red-400') : ''}
              `}
              disabled={isValidating}
            />
            {error && (
              <p className={`mt-2 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isValidating || !inputValue.trim()}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold transition-all
              ${isValidating || !inputValue.trim()
                ? isDark
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : isDark
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700'
                : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800'
              }
            `}
          >
            {isValidating ? 'Validating...' : 'Save API Key'}
          </button>
        </form>

        <div className={`text-xs space-y-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <div className={`flex items-start gap-2 p-3 rounded-lg ${isDark ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-50 border border-green-200'}`}>
            <span className="text-base">🔐</span>
            <div className="space-y-1">
              <p className={`font-medium ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                Your API key never leaves your device
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Stored locally in your browser. Zero server uploads. We literally can't see it even if we wanted to (and we don't want to, pinky promise 🤙).
              </p>
              <a
                href="https://github.com/Yembot31013/cv-generator"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 mt-1 font-medium hover:underline ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
              >
                <span>👀</span> Don't trust us? Review the source code
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

