'use client';

import { useState, useRef, useEffect } from 'react';
import { CVData, CoverLetter } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import { createAIModifier, ModificationResult } from '@/lib/aiModifier';

interface AIModifierFloatingBarProps {
  currentResume: CVData;
  currentCoverLetter?: CoverLetter;
  jobDescription: JobDescription;
  files?: File[];
  onResumeModified: (newResume: CVData) => void;
  onCoverLetterModified: (newCoverLetter: CoverLetter) => void;
  theme?: 'dark' | 'light';
}

export default function AIModifierFloatingBar({
  currentResume,
  currentCoverLetter,
  jobDescription,
  files,
  onResumeModified,
  onCoverLetterModified,
  theme = 'dark',
}: AIModifierFloatingBarProps) {
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [result, setResult] = useState<ModificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        if (!isModifying && !prompt) {
          setIsExpanded(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModifying, prompt]);

  const handleModify = async () => {
    if (!prompt.trim() || isModifying) return;

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError('API key not configured');
      return;
    }

    setIsModifying(true);
    setError(null);
    setResult(null);

    try {
      const modifier = createAIModifier(apiKey);
      const modResult = await modifier.modify(
        prompt,
        currentResume,
        currentCoverLetter,
        jobDescription,
        files
      );

      setResult(modResult);

      if (modResult.success) {
        if (modResult.modifiedResume) {
          onResumeModified(modResult.modifiedResume);
        }
        if (modResult.modifiedCoverLetter) {
          onCoverLetterModified(modResult.modifiedCoverLetter);
        }

        // Clear prompt after success
        setTimeout(() => {
          setPrompt('');
          setResult(null);
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to modify. Please try again.');
    } finally {
      setIsModifying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleModify();
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
      setPrompt('');
      setResult(null);
      setError(null);
    }
  };

  const quickActions = [
    { label: 'Update email', prompt: 'Change my email to ' },
    { label: 'Add skill', prompt: 'Add to my skills: ' },
    { label: 'Update bio', prompt: 'Rewrite my bio to ' },
    { label: 'Fix typos', prompt: 'Fix any typos in my resume' },
  ];

  return (
    <div
      ref={barRef}
      className={`
        fixed bottom-0 left-0 right-0 z-50 transition-all duration-300
        ${isExpanded ? 'pb-0' : ''}
      `}
    >
      {/* Gradient fade effect */}
      <div
        className={`
          absolute inset-x-0 bottom-full h-8 pointer-events-none
          ${isDark
            ? 'bg-gradient-to-t from-gray-900/95 to-transparent'
            : 'bg-gradient-to-t from-white/95 to-transparent'
          }
        `}
      />

      {/* Main Bar */}
      <div
        className={`
          ${isDark
            ? 'bg-gray-900/98 border-t border-gray-700'
            : 'bg-white/98 border-t border-gray-200 shadow-lg'
          }
          backdrop-blur-xl
        `}
      >
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* Collapsed State - Just a button */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className={`
                w-full py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-3
                ${isDark
                  ? 'bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white hover:from-indigo-500 hover:to-violet-500 border border-indigo-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg'
                }
              `}
            >
              <span className="text-xl">✏️</span>
              <span>Ask AI to modify your resume or cover letter...</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-white/30'}`}>
                Click to expand
              </span>
            </button>
          )}

          {/* Expanded State */}
          {isExpanded && (
            <div className="space-y-3">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(action.prompt);
                      inputRef.current?.focus();
                    }}
                    disabled={isModifying}
                    className={`
                      text-xs px-3 py-1.5 rounded-full transition-all
                      ${isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200'
                      }
                      ${isModifying ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Input Row */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Change my website URL to https://mysite.com"
                    disabled={isModifying}
                    className={`
                      w-full px-4 py-3 rounded-xl transition-all text-base
                      ${isDark
                        ? 'bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-indigo-500'
                        : 'bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-indigo-500'
                      }
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/20
                      ${isModifying ? 'opacity-50' : ''}
                    `}
                  />
                  
                  {/* Keyboard hint */}
                  <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    {prompt ? 'Enter ↵' : 'Esc to close'}
                  </div>
                </div>

                <button
                  onClick={handleModify}
                  disabled={!prompt.trim() || isModifying}
                  className={`
                    px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 shrink-0
                    ${!prompt.trim() || isModifying
                      ? isDark
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isDark
                        ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400'
                        : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400'
                    }
                  `}
                >
                  {isModifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <span>Apply</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setPrompt('');
                    setResult(null);
                    setError(null);
                  }}
                  className={`
                    p-3 rounded-xl transition-all
                    ${isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  ✕
                </button>
              </div>

              {/* Result/Error Messages */}
              {(result || error) && (
                <div
                  className={`
                    p-3 rounded-xl text-sm flex items-start gap-2
                    ${result?.success
                      ? isDark
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : result && !result.success
                        ? isDark
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        : isDark
                          ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                          : 'bg-red-50 text-red-700 border border-red-200'
                    }
                  `}
                >
                  <span className="mt-0.5">
                    {result?.success ? '✓' : result && !result.success ? '💡' : '⚠️'}
                  </span>
                  <div className="flex-1">
                    <span>{result?.message || error}</span>
                    {result?.success && result.changes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.changes.map((change, idx) => (
                          <span
                            key={idx}
                            className={`
                              text-xs px-2 py-1 rounded-full
                              ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                            `}
                          >
                            {change}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animated border when modifying */}
      {isModifying && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div
            className={`h-full w-1/3 ${isDark ? 'bg-indigo-500' : 'bg-indigo-400'}`}
            style={{
              animation: 'slideRight 1s ease-in-out infinite',
            }}
          />
          <style jsx>{`
            @keyframes slideRight {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(400%);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

