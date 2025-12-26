'use client';

import { useState, useRef, useEffect } from 'react';
import { CVData, CoverLetter } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import { createAIModifier, ModificationResult } from '@/lib/aiModifier';

interface AIModifierPanelProps {
  currentResume: CVData;
  currentCoverLetter?: CoverLetter;
  jobDescription: JobDescription;
  files?: File[];
  onResumeModified: (newResume: CVData) => void;
  onCoverLetterModified: (newCoverLetter: CoverLetter) => void;
  theme?: 'dark' | 'light';
}

// Wave animation lines that show modification in progress
function WaveEffect({ isActive, isDark }: { isActive: boolean; isDark: boolean }) {
  const lines = Array.from({ length: 12 }, (_, i) => i);
  
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      <div className="absolute inset-0 flex flex-col justify-center gap-1 px-3">
        {lines.map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full ${isDark ? 'bg-indigo-500/30' : 'bg-indigo-400/30'}`}
            style={{
              animation: `waveWidth 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.1}s`,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes waveWidth {
          0%, 100% {
            width: 15%;
            opacity: 0.3;
          }
          50% {
            width: 85%;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

// Ripple effect when changes are applied
function RippleEffect({ isActive, isDark }: { isActive: boolean; isDark: boolean }) {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
      <div
        className={`absolute inset-0 ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`}
        style={{
          animation: 'ripple 0.6s ease-out forwards',
          transformOrigin: 'center',
        }}
      />
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Code modification effect
function CodeModifyEffect({ changes, isDark }: { changes: string[]; isDark: boolean }) {
  const [visibleChanges, setVisibleChanges] = useState<number>(0);
  
  useEffect(() => {
    if (changes.length === 0) {
      setVisibleChanges(0);
      return;
    }
    
    const interval = setInterval(() => {
      setVisibleChanges((prev) => {
        if (prev >= changes.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    
    return () => clearInterval(interval);
  }, [changes]);
  
  if (changes.length === 0) return null;
  
  return (
    <div className="mt-4 space-y-2">
      {changes.slice(0, visibleChanges).map((change, idx) => (
        <div
          key={idx}
          className={`
            flex items-start gap-2 text-sm p-2 rounded-lg
            ${isDark ? 'bg-emerald-500/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}
            animate-fadeSlideIn
          `}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <span className="mt-0.5 text-emerald-500">✓</span>
          <span>{change}</span>
        </div>
      ))}
      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function AIModifierPanel({
  currentResume,
  currentCoverLetter,
  jobDescription,
  files,
  onResumeModified,
  onCoverLetterModified,
  theme = 'dark',
}: AIModifierPanelProps) {
  const isDark = theme === 'dark';
  const [prompt, setPrompt] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState<ModificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 600);

        if (modResult.modifiedResume) {
          onResumeModified(modResult.modifiedResume);
        }
        if (modResult.modifiedCoverLetter) {
          onCoverLetterModified(modResult.modifiedCoverLetter);
        }

        // Clear prompt on success
        setTimeout(() => {
          setPrompt('');
        }, 2000);
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
  };

  const examplePrompts = [
    "Change my email to john@example.com",
    "Add React and TypeScript to my skills",
    "Update my bio to focus on leadership",
    "Remove the second project",
    "Make the cover letter more enthusiastic",
  ];

  return (
    <div
      className={`
        relative rounded-xl overflow-hidden transition-all
        ${isDark
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700'
          : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg'
        }
      `}
    >
      {/* Wave Effect when modifying */}
      <WaveEffect isActive={isModifying} isDark={isDark} />
      
      {/* Ripple Effect on success */}
      <RippleEffect isActive={showSuccess} isDark={isDark} />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`
              w-10 h-10 rounded-xl flex items-center justify-center text-xl
              ${isDark
                ? 'bg-gradient-to-br from-indigo-500 to-violet-500'
                : 'bg-gradient-to-br from-indigo-400 to-violet-400'
              }
            `}
          >
            ✏️
          </div>
          <div>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Modifier
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Make changes with natural language
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="relative mb-4">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to change..."
            disabled={isModifying}
            rows={3}
            className={`
              w-full px-4 py-3 rounded-xl resize-none transition-all
              ${isDark
                ? 'bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-indigo-500'
                : 'bg-white text-gray-900 placeholder-gray-400 border border-gray-300 focus:border-indigo-500'
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20
              ${isModifying ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          
          {/* Character count */}
          <div className={`absolute bottom-2 right-3 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            {prompt.length > 0 && `${prompt.length} chars`}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleModify}
          disabled={!prompt.trim() || isModifying}
          className={`
            w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
            ${!prompt.trim() || isModifying
              ? isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/25'
                : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-400 hover:to-violet-400 shadow-lg shadow-indigo-500/30'
            }
          `}
        >
          {isModifying ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Modifying...</span>
            </>
          ) : (
            <>
              <span>Apply Changes</span>
              <span className="text-sm opacity-70">↵</span>
            </>
          )}
        </button>

        {/* Result Messages */}
        {result && (
          <div className="mt-4">
            {result.success ? (
              <>
                <div
                  className={`
                    p-3 rounded-xl text-sm
                    ${isDark ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>✓</span>
                    <span className="font-medium">{result.message}</span>
                  </div>
                </div>
                <CodeModifyEffect changes={result.changes} isDark={isDark} />
              </>
            ) : (
              <div
                className={`
                  p-3 rounded-xl text-sm
                  ${isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}
                `}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">💡</span>
                  <span>{result.message}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className={`
              mt-4 p-3 rounded-xl text-sm
              ${isDark ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-red-50 text-red-700 border border-red-200'}
            `}
          >
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Example Prompts */}
        {!prompt && !result && (
          <div className="mt-4">
            <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.slice(0, 3).map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className={`
                    text-xs px-3 py-1.5 rounded-full transition-all
                    ${isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300 border border-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700 border border-gray-200'
                    }
                  `}
                >
                  {example.length > 30 ? example.substring(0, 30) + '...' : example}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

