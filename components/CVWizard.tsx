"use client";

import { useState } from "react";
import { CVData } from "@/types/cv";
import { JobDescription } from "@/types/flow";
import { useApiKey } from "@/contexts/ApiKeyContext";
import UploadStep from "./wizard/UploadStep";
import JobDescriptionStep from "./wizard/JobDescriptionStep";
import AIEnhancementStep from "./wizard/AIEnhancementStep";
import TemplateSelectionStep from "./wizard/TemplateSelectionStep";
import ApiKeyInput from "./ApiKeyInput";
import GitHubStarFloat from "./GitHubStarFloat";

type WizardStep =
  | "upload"
  | "job-description"
  | "ai-enhance"
  | "template-select"
  | "download";

export default function CVWizard() {
  const { hasApiKey, apiKey } = useApiKey();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [currentStep, setCurrentStep] = useState<WizardStep>("upload");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [partialCV, setPartialCV] = useState<Partial<CVData>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    description: "",
  });
  const [enhancedCV, setEnhancedCV] = useState<CVData | null>(null);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("cyber");

  const handleDataExtracted = (data: Partial<CVData>, files?: File[]) => {
    setPartialCV(data);
    if (files) {
      setUploadedFiles(files);
    }
  };

  const handleJobDescriptionSubmit = (jobDesc: JobDescription) => {
    setJobDescription(jobDesc);
  };

  const handleEnhanced = (data: CVData, coverLetterText?: string) => {
    setEnhancedCV(data);
    if (coverLetterText) {
      setCoverLetter(coverLetterText);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId);
    // PDF export is coming soon
    alert(
      "PDF export is coming soon! For now, please use your browser's print function (Ctrl/Cmd + P) to save as PDF."
    );
  };

  const nextStep = () => {
    const steps: WizardStep[] = [
      "upload",
      "job-description",
      "ai-enhance",
      "template-select",
      "download",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const steps: WizardStep[] = [
      "upload",
      "job-description",
      "ai-enhance",
      "template-select",
      "download",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const isDark = theme === "dark";

  // Show API key input if not configured
  if (!hasApiKey) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-[#0a0b0d]" : "bg-gray-50"
        } transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1
              className={`text-4xl font-black mb-4 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to CV Generator
            </h1>
            <p
              className={`text-lg ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Get started by configuring your Gemini API key
            </p>
          </div>
          <ApiKeyInput theme={theme} onApiKeySet={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-[#0a0b0d]" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      {/* Progress Bar */}
      {currentStep !== "template-select" && (
        <div
          className={`sticky top-0 z-50 ${
            isDark
              ? "bg-black/95 border-b border-indigo-500/30"
              : "bg-white/95 border-b border-gray-200"
          } backdrop-blur-lg`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-sm font-bold ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {currentStep === "upload" && "Step 1: Upload Resume"}
                  {currentStep === "job-description" &&
                    "Step 2: Job Description"}
                  {currentStep === "ai-enhance" && "Step 3: AI Enhancement"}
                </h3>
              </div>

              {/* API Key Management */}
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
                title="Manage API Key"
              >
                🔑 API Key
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    isDark
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                      : "bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200"
                  }
                `}
              >
                {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2">
              {[
                "upload",
                "job-description",
                "ai-enhance",
                "template-select",
              ].map((step, index) => {
                const stepIndex = [
                  "upload",
                  "job-description",
                  "ai-enhance",
                  "template-select",
                ].indexOf(currentStep);
                const isActive = step === currentStep;
                const isCompleted = index < stepIndex;

                return (
                  <div
                    key={step}
                    className={`
                      flex-1 h-2 rounded-full transition-all
                      ${
                        isCompleted
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : isActive
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                          : isDark
                          ? "bg-gray-800"
                          : "bg-gray-200"
                      }
                    `}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className={`max-w-2xl w-full rounded-2xl ${
              isDark ? "bg-gray-900" : "bg-white"
            } p-6 max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2
                className={`text-2xl font-bold ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                API Key Settings
              </h2>
              <button
                onClick={() => setShowApiKeyInput(false)}
                className={`text-2xl ${
                  isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                ×
              </button>
            </div>
            <ApiKeyInput
              theme={theme}
              onApiKeySet={() => setShowApiKeyInput(false)}
            />
          </div>
        </div>
      )}

      {/* Step Content */}
      <div>
        {currentStep === "upload" && (
          <UploadStep
            onDataExtracted={handleDataExtracted}
            onNext={nextStep}
            theme={theme}
          />
        )}

        {currentStep === "job-description" && (
          <JobDescriptionStep
            onJobDescriptionSubmit={handleJobDescriptionSubmit}
            onBack={previousStep}
            onNext={nextStep}
            theme={theme}
          />
        )}

        {currentStep === "ai-enhance" && (
          <AIEnhancementStep
            partialCV={partialCV}
            jobDescription={jobDescription}
            uploadedFiles={uploadedFiles}
            onEnhanced={handleEnhanced}
            onBack={previousStep}
            onNext={nextStep}
            theme={theme}
          />
        )}

        {currentStep === "template-select" && enhancedCV && (
          <TemplateSelectionStep
            enhancedCV={enhancedCV}
            coverLetter={coverLetter}
            jobDescription={jobDescription}
            onTemplateSelect={handleTemplateSelect}
            onBack={previousStep}
            theme={theme}
          />
        )}
      </div>

      {/* GitHub Star Request */}
      <GitHubStarFloat theme={theme} />
    </div>
  );
}
