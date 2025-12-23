'use client';

import { useState, useEffect } from 'react';
import { CVData } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import { useApiKey } from '@/contexts/ApiKeyContext';

interface AIEnhancementStepProps {
  partialCV: Partial<CVData>;
  jobDescription: JobDescription;
  onEnhanced: (data: CVData) => void;
  onBack: () => void;
  onNext: () => void;
  theme?: 'dark' | 'light';
}

export default function AIEnhancementStep({
  partialCV,
  jobDescription,
  onEnhanced,
  onBack,
  onNext,
  theme = 'dark'
}: AIEnhancementStepProps) {
  const { apiKey } = useApiKey();
  const isDark = theme === 'dark';
  const [status, setStatus] = useState<'idle' | 'processing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [enhancedData, setEnhancedData] = useState<CVData | null>(null);

  useEffect(() => {
    if (status === 'idle' && apiKey) {
      startEnhancement();
    } else if (!apiKey) {
      setError('API key is required. Please configure your Gemini API key.');
      setStatus('error');
    }
  }, [apiKey]);

  const startEnhancement = async () => {
    if (!apiKey) {
      setError('API key is required');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setProgress(10);
    setError(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      // Import and run AI enhancement
      const { createAIEnhancer } = await import('@/lib/aiEnhancer');
      const enhancer = createAIEnhancer(apiKey);

      setProgress(30);

      const enhanced = jobDescription.description
        ? await enhancer.enhanceCV(partialCV, jobDescription)
        : await enhancer.quickEnhance(partialCV);

      clearInterval(progressInterval);
      setProgress(100);
      setStatus('complete');
      setEnhancedData(enhanced);
      onEnhanced(enhanced);

      // Auto-advance after showing success
      setTimeout(() => {
        onNext();
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'AI enhancement failed. Please try again.');
      console.error('AI Enhancement Error:', err);
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setProgress(0);
    setError(null);
    startEnhancement();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className={`text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {status === 'complete' ? 'Enhancement Complete!' : 'AI Enhancement'}
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {status === 'processing' && 'Our AI is tailoring your CV...'}
          {status === 'complete' && 'Your CV has been perfectly optimized!'}
          {status === 'error' && 'Something went wrong'}
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`
          relative overflow-hidden rounded-3xl p-12
          ${isDark
            ? 'bg-gradient-to-br from-[#1a1b26] to-[#16171f] border border-indigo-500/20'
            : 'bg-white border border-indigo-200 shadow-xl'
          }
        `}
      >
        {status === 'processing' && (
          <div className="text-center">
            {/* Animated Icon */}
            <div className="relative mx-auto mb-8 w-32 h-32">
              <div
                className={`absolute inset-0 rounded-full border-8 border-t-transparent animate-spin ${
                  isDark ? 'border-indigo-500' : 'border-indigo-600'
                }`}
              />
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                🤖
              </div>
            </div>

            {/* Progress Bar */}
            <div
              className={`w-full h-4 rounded-full overflow-hidden mb-6 ${
                isDark ? 'bg-gray-800' : 'bg-gray-200'
              }`}
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {progress}% Complete
            </p>

            {/* Status Messages */}
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {progress < 30 && '🔍 Analyzing your experience...'}
              {progress >= 30 && progress < 60 && '✨ Tailoring content to job requirements...'}
              {progress >= 60 && progress < 90 && '📝 Adding metrics and achievements...'}
              {progress >= 90 && '🎨 Finalizing your perfect CV...'}
            </div>
          </div>
        )}

        {status === 'complete' && (
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-6xl animate-bounce">
              ✓
            </div>

            <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Your CV is Ready!
            </h2>

            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
                <div className="text-3xl mb-2">🎯</div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Perfectly Tailored
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <div className="text-3xl mb-2">📊</div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Metrics Added
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-pink-500/10' : 'bg-pink-50'}`}>
                <div className="text-3xl mb-2">✨</div>
                <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Expert Level
                </p>
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-6 w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center text-6xl">
              ⚠️
            </div>

            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Enhancement Failed
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleRetry}
              className={`
                px-8 py-3 rounded-xl font-bold transition-all
                ${isDark
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }
                shadow-lg
              `}
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      {status === 'processing' && (
        <div className={`mt-8 p-6 rounded-2xl text-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            This usually takes 10-30 seconds. Please don't close this page.
          </p>
        </div>
      )}

      {/* Actions */}
      {(status === 'error' || status === 'complete') && (
        <div className="flex justify-between items-center mt-12">
          <button
            onClick={onBack}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            ← Back
          </button>

          {status === 'complete' && (
            <button
              onClick={onNext}
              className={`
                px-8 py-3 rounded-xl font-bold transition-all
                ${isDark
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }
                shadow-lg
              `}
            >
              Select Template →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
