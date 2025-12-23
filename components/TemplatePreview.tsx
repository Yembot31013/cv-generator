'use client';

import { useState } from 'react';
import { CVData } from '@/types/cv';
import CyberCV from './cv-templates/CyberCV';
import NeonCV from './cv-templates/NeonCV';
import GlassCV from './cv-templates/GlassCV';
import MinimalCV from './cv-templates/MinimalCV';

const templates = [
  { id: 'cyber', name: 'Cyber Web3', component: CyberCV },
  { id: 'neon', name: 'Neon Retro', component: NeonCV },
  { id: 'glass', name: 'Glassmorphic', component: GlassCV },
  { id: 'minimal', name: 'Minimal Pro', component: MinimalCV },
];

interface TemplatePreviewProps {
  data: CVData;
  onApprove?: (templateId: string) => void;
  onRequestChanges?: (templateId: string, feedback: string) => void;
}

export default function TemplatePreview({ data, onApprove, onRequestChanges }: TemplatePreviewProps) {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentTemplate = templates[currentTemplateIndex];
  const TemplateComponent = currentTemplate.component;

  const handleNext = () => {
    setCurrentTemplateIndex((prev) => (prev + 1) % templates.length);
    setShowFeedback(false);
    setFeedback('');
  };

  const handlePrevious = () => {
    setCurrentTemplateIndex((prev) => (prev - 1 + templates.length) % templates.length);
    setShowFeedback(false);
    setFeedback('');
  };

  const handleApprove = () => {
    if (onApprove) {
      onApprove(currentTemplate.id);
    }
    alert(`Template "${currentTemplate.name}" approved! Moving to implementation phase.`);
  };

  const handleRequestChanges = () => {
    if (feedback.trim() && onRequestChanges) {
      onRequestChanges(currentTemplate.id, feedback);
      alert(`Feedback submitted for "${currentTemplate.name}" template.`);
      setShowFeedback(false);
      setFeedback('');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Control Panel */}
      <div
        className={`
          fixed top-0 left-0 right-0 z-50
          ${theme === 'dark' ? 'bg-black/95 border-b border-indigo-500/30' : 'bg-white/95 border-b border-gray-200'}
          backdrop-blur-lg
        `}
        style={{
          boxShadow: theme === 'dark'
            ? '0 4px 20px rgba(99, 102, 241, 0.2)'
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Template Info */}
            <div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                CV Template Preview
              </h2>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Current: <span className={`font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {currentTemplate.name}
                </span> ({currentTemplateIndex + 1}/{templates.length})
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${theme === 'dark'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
                  }
                `}
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>

              {/* Navigation */}
              <button
                onClick={handlePrevious}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${theme === 'dark'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                  }
                `}
              >
                ← Previous
              </button>

              <button
                onClick={handleNext}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${theme === 'dark'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30'
                    : 'bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200'
                  }
                `}
              >
                Next →
              </button>

              {/* Actions */}
              <button
                onClick={() => setShowFeedback(!showFeedback)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${theme === 'dark'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200'
                  }
                `}
              >
                Request Changes
              </button>

              <button
                onClick={handleApprove}
                className={`
                  px-6 py-2 rounded-lg font-bold transition-all
                  ${theme === 'dark'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800'
                  }
                `}
                style={{
                  boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
                }}
              >
                ✓ Approve Design
              </button>
            </div>
          </div>

          {/* Feedback Form */}
          {showFeedback && (
            <div className="mt-4 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-900 border-yellow-500/30' : 'bg-yellow-50 border-yellow-300'}">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe what changes you'd like to see in this template..."
                className={`
                  w-full px-4 py-3 rounded-lg resize-none
                  ${theme === 'dark'
                    ? 'bg-black border border-yellow-500/30 text-gray-200 placeholder-gray-500'
                    : 'bg-white border border-yellow-300 text-gray-900 placeholder-gray-400'
                  }
                  focus:outline-none focus:ring-2 focus:ring-yellow-500
                `}
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleRequestChanges}
                  disabled={!feedback.trim()}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${theme === 'dark'
                      ? 'bg-yellow-500 text-black hover:bg-yellow-600 disabled:bg-gray-700 disabled:text-gray-500'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300 disabled:text-gray-500'
                    }
                  `}
                >
                  Submit Feedback
                </button>
                <button
                  onClick={() => setShowFeedback(false)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all
                    ${theme === 'dark'
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }
                  `}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Display */}
      <div className="pt-32">
        <TemplateComponent data={data} theme={theme} />
      </div>

      {/* Template Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`
          flex gap-2 px-4 py-2 rounded-full
          ${theme === 'dark' ? 'bg-black/90 border border-indigo-500/30' : 'bg-white/90 border border-gray-300'}
          backdrop-blur-lg
        `}>
          {templates.map((template, idx) => (
            <button
              key={template.id}
              onClick={() => setCurrentTemplateIndex(idx)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${idx === currentTemplateIndex
                  ? theme === 'dark'
                    ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50 w-8'
                    : 'bg-indigo-600 shadow-lg shadow-indigo-600/50 w-8'
                  : theme === 'dark'
                    ? 'bg-gray-600 hover:bg-gray-500'
                    : 'bg-gray-300 hover:bg-gray-400'
                }
              `}
              aria-label={`Switch to ${template.name} template`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
