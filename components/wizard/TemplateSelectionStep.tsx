'use client';

import { useState } from 'react';
import { CVData } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import CyberCV from '../cv-templates/CyberCV';
import NeonCV from '../cv-templates/NeonCV';
import GlassCV from '../cv-templates/GlassCV';
import MinimalCV from '../cv-templates/MinimalCV';
import CoverLetter from '../CoverLetter';

const templates = [
  { id: 'cyber', name: 'Cyber Web3', component: CyberCV, description: 'Modern 3D effects perfect for tech roles' },
  { id: 'neon', name: 'Neon Retro', component: NeonCV, description: 'Cyberpunk style for creative positions' },
  { id: 'glass', name: 'Glassmorphic', component: GlassCV, description: 'Modern glass effects for designers' },
  { id: 'minimal', name: 'Minimal Pro', component: MinimalCV, description: 'Clean typography for corporate roles' },
];

interface TemplateSelectionStepProps {
  enhancedCV: CVData;
  coverLetter?: string | null;
  jobDescription?: JobDescription;
  onTemplateSelect: (templateId: string) => void;
  onBack: () => void;
  theme?: 'dark' | 'light';
}

export default function TemplateSelectionStep({
  enhancedCV,
  coverLetter,
  jobDescription,
  onTemplateSelect,
  onBack,
  theme = 'dark'
}: TemplateSelectionStepProps) {
  const isDark = theme === 'dark';
  const [selectedTemplate, setSelectedTemplate] = useState<string>('cyber');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>(theme);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');

  const handleSelect = () => {
    onTemplateSelect(selectedTemplate);
  };

  const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || CyberCV;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className={`sticky top-0 z-50 ${isDark ? 'bg-black/95 border-b border-indigo-500/30' : 'bg-white/95 border-b border-gray-200'} backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {activeTab === 'resume' ? 'Choose Your Template' : 'Cover Letter'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {activeTab === 'resume' 
                  ? templates.find(t => t.id === selectedTemplate)?.name
                  : 'Personalized cover letter based on your CV and job description'
                }
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Tabs */}
              {coverLetter && (
                <div className={`flex gap-2 rounded-lg p-1 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                  <button
                    onClick={() => setActiveTab('resume')}
                    className={`
                      px-4 py-2 rounded-md font-medium transition-all text-sm
                      ${activeTab === 'resume'
                        ? isDark
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white text-indigo-700 shadow-sm'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    📄 Resume
                  </button>
                  <button
                    onClick={() => setActiveTab('cover-letter')}
                    className={`
                      px-4 py-2 rounded-md font-medium transition-all text-sm
                      ${activeTab === 'cover-letter'
                        ? isDark
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white text-indigo-700 shadow-sm'
                        : isDark
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    ✉️ Cover Letter
                  </button>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${isDark
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
                  }
                `}
              >
                {previewTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
              </button>

              <button
                onClick={onBack}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all
                  ${isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                ← Back
              </button>

              <button
                onClick={() => {
                  alert('PDF export is coming soon! For now, please use your browser\'s print function (Ctrl/Cmd + P) to save as PDF.');
                }}
                className={`
                  px-8 py-2 rounded-lg font-bold transition-all relative
                  ${isDark
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                  shadow-lg
                `}
                title="Coming soon - Use browser print (Ctrl/Cmd + P) for now"
              >
                <span className="relative">
                  Download PDF
                  <span className="absolute -top-1 -right-6 text-xs bg-yellow-500 text-black px-1 rounded">Soon</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Template Selector Sidebar - Only show for resume */}
        {activeTab === 'resume' && (
          <div className={`w-80 h-screen sticky top-0 overflow-y-auto ${isDark ? 'bg-gray-900 border-r border-gray-800' : 'bg-gray-50 border-r border-gray-200'}`}>
            <div className="p-6 space-y-4">
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                Templates
              </h3>

              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all
                    ${selectedTemplate === template.id
                      ? isDark
                        ? 'bg-indigo-500/20 border-2 border-indigo-500'
                        : 'bg-indigo-100 border-2 border-indigo-500'
                      : isDark
                      ? 'bg-gray-800 border-2 border-transparent hover:border-gray-700'
                      : 'bg-white border-2 border-transparent hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`
                        w-3 h-3 rounded-full
                        ${selectedTemplate === template.id
                          ? 'bg-indigo-500'
                          : isDark
                          ? 'bg-gray-700'
                          : 'bg-gray-300'
                        }
                      `}
                    />
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {template.name}
                    </h4>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'cover-letter' ? '' : ''}`}>
          <div id="cv-preview" className="min-h-screen">
            {activeTab === 'resume' ? (
              <SelectedTemplateComponent data={enhancedCV} theme={previewTheme} />
            ) : coverLetter ? (
              <CoverLetter
                content={coverLetter}
                personalInfo={{
                  fullName: enhancedCV.personalInfo?.fullName,
                  email: enhancedCV.personalInfo?.email,
                  phone: enhancedCV.personalInfo?.phone,
                  location: enhancedCV.personalInfo?.location,
                }}
                jobInfo={{
                  company: jobDescription?.company,
                  title: jobDescription?.title,
                }}
                theme={previewTheme}
              />
            ) : (
              <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0a0b0d] text-gray-400' : 'bg-white text-gray-600'}`}>
                <div className="text-center">
                  <p className="text-xl mb-2">No cover letter available</p>
                  <p className="text-sm">Please provide a job description to generate a cover letter.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
