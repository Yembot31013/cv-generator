'use client';

import { useState, useEffect } from 'react';
import { CVData, CoverLetter as CoverLetterType } from '@/types/cv';
import { JobDescription } from '@/types/flow';
import CyberCV from '../cv-templates/CyberCV';
import NeonCV from '../cv-templates/NeonCV';
import GlassCV from '../cv-templates/GlassCV';
import MinimalCV from '../cv-templates/MinimalCV';
import CoverLetter from '../CoverLetter';
import AIReviewModal from '../AIReviewModal';
import AIModifierFloatingBar from '../AIModifierFloatingBar';
import { downloadResumePdf, downloadCoverLetterPdf } from '@/lib/resumePdf';

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
  files?: File[];
  onTemplateSelect: (templateId: string) => void;
  onCVChange?: (newCV: CVData) => void;
  onCoverLetterChange?: (newCoverLetter: string) => void;
  onBack: () => void;
  theme?: 'dark' | 'light';
}

export default function TemplateSelectionStep({
  enhancedCV,
  coverLetter,
  jobDescription,
  files,
  onTemplateSelect,
  onCVChange,
  onCoverLetterChange,
  onBack,
  theme = 'dark'
}: TemplateSelectionStepProps) {
  const isDark = theme === 'dark';
  const [selectedTemplate, setSelectedTemplate] = useState<string>('cyber');
  const [previewTheme, setPreviewTheme] = useState<'dark' | 'light'>(theme);
  const [activeTab, setActiveTab] = useState<'resume' | 'cover-letter'>('resume');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Local state for modifiable data
  const [currentCV, setCurrentCV] = useState<CVData>(enhancedCV);
  const [currentCoverLetter, setCurrentCoverLetter] = useState<string | undefined>(coverLetter || undefined);
  
  // Update local state when props change
  useEffect(() => {
    setCurrentCV(enhancedCV);
  }, [enhancedCV]);
  
  useEffect(() => {
    setCurrentCoverLetter(coverLetter || undefined);
  }, [coverLetter]);
  
  // Handle CV modifications
  const handleCVModified = (newCV: CVData) => {
    setCurrentCV(newCV);
    onCVChange?.(newCV);
  };
  
  // Handle cover letter modifications
  const handleCoverLetterModified = (newCoverLetter: CoverLetterType) => {
    setCurrentCoverLetter(newCoverLetter.content);
    onCoverLetterChange?.(newCoverLetter.content);
  };

  const handleSelect = () => {
    onTemplateSelect(selectedTemplate);
  };

  // Auto-dismiss toast notifications
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setToast(null);

    try {
      if (activeTab === 'cover-letter') {
        if (!currentCoverLetter?.trim()) {
          setToast({ type: 'error', message: 'No cover letter available to download.' });
          return;
        }
        downloadCoverLetterPdf(
          currentCoverLetter,
          {
            fullName: currentCV.personalInfo?.fullName,
            email: currentCV.personalInfo?.email,
            phone: currentCV.personalInfo?.phone,
            location: currentCV.personalInfo?.location,
          },
          { company: jobDescription?.company, title: jobDescription?.title },
          selectedTemplate
        );
        setToast({ type: 'success', message: 'Cover letter downloaded.' });
      } else {
        downloadResumePdf(currentCV, selectedTemplate);
        setToast({ type: 'success', message: 'Resume downloaded.' });
      }
    } catch (error) {
      console.error('PDF download failed:', error);
      setToast({ type: 'error', message: 'Could not generate the PDF. Please try again.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadLabel = activeTab === 'cover-letter' ? 'Download Cover Letter' : 'Download Resume';

  const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplate)?.component || CyberCV;

  // Check if we have a job description to enable AI features
  const canReview = jobDescription && jobDescription.description && jobDescription.description.trim().length > 0;
  const canModify = jobDescription !== undefined;

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

            <div className="flex items-center gap-3">
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

              {/* AI Review Button */}
              {canReview && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className={`
                    group relative px-4 py-2 rounded-lg font-medium transition-all overflow-hidden
                    ${isDark
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-400 hover:to-indigo-400 shadow-lg shadow-indigo-500/30'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    <span>AI Review</span>
                    <span className={`
                      text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase
                      ${isDark ? 'bg-white/20' : 'bg-white/30'}
                    `}>
                      New
                    </span>
                  </span>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
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
                onClick={handleDownload}
                disabled={isDownloading}
                className={`
                  inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg
                  ${isDownloading
                    ? isDark
                      ? 'bg-indigo-500/50 text-white/70 cursor-wait'
                      : 'bg-indigo-400 text-white/80 cursor-wait'
                    : isDark
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-indigo-500/30'
                  }
                `}
                title={`Download your ${activeTab === 'cover-letter' ? 'cover letter' : 'resume'} as a PDF`}
              >
                {isDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Generating…</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>{downloadLabel}</span>
                  </>
                )}
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

              {/* AI Review Card in Sidebar */}
              {canReview && (
                <div className={`
                  mt-6 p-4 rounded-xl
                  ${isDark 
                    ? 'bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20' 
                    : 'bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200'
                  }
                `}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🎯</span>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      AI Review
                    </h4>
                  </div>
                  <p className={`text-xs mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get AI feedback on how well your resume matches the job description
                  </p>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className={`
                      w-full py-2 rounded-lg font-medium text-sm transition-all
                      ${isDark
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 hover:bg-violet-500/30'
                        : 'bg-violet-100 text-violet-700 border border-violet-300 hover:bg-violet-200'
                      }
                    `}
                  >
                    Analyze Now →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview Area */}
        <div className={`flex-1 overflow-y-auto ${activeTab === 'cover-letter' ? '' : ''}`}>
          <div id="cv-preview" className="min-h-screen">
            {activeTab === 'resume' ? (
              <SelectedTemplateComponent data={currentCV} theme={previewTheme} />
            ) : currentCoverLetter ? (
              <CoverLetter
                content={currentCoverLetter}
                personalInfo={{
                  fullName: currentCV.personalInfo?.fullName,
                  email: currentCV.personalInfo?.email,
                  phone: currentCV.personalInfo?.phone,
                  location: currentCV.personalInfo?.location,
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

      {/* AI Review Modal */}
      {jobDescription && (
        <AIReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          cvData={currentCV}
          coverLetter={currentCoverLetter}
          jobDescription={jobDescription}
          files={files}
          onResumeModified={handleCVModified}
          onCoverLetterModified={(content) =>
            handleCoverLetterModified({
              content,
              salutation: 'Dear Hiring Manager,',
              closing: 'Sincerely,',
            })
          }
          theme={theme}
        />
      )}

      {/* Download Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`
            fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-md
            ${toast.type === 'success'
              ? isDark
                ? 'bg-green-500/15 border-green-500/40 text-green-200'
                : 'bg-green-50 border-green-300 text-green-800'
              : isDark
              ? 'bg-red-500/15 border-red-500/40 text-red-200'
              : 'bg-red-50 border-red-300 text-red-800'
            }
          `}
        >
          <span className="text-lg" aria-hidden="true">{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* AI Modifier Floating Bar */}
      {canModify && jobDescription && (
        <AIModifierFloatingBar
          currentResume={currentCV}
          currentCoverLetter={currentCoverLetter ? { content: currentCoverLetter, salutation: 'Dear Hiring Manager,', closing: 'Sincerely,' } : undefined}
          jobDescription={jobDescription}
          files={files}
          onResumeModified={handleCVModified}
          onCoverLetterModified={handleCoverLetterModified}
          theme={theme}
        />
      )}
    </div>
  );
}
