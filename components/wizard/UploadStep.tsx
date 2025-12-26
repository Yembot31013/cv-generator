"use client";

import { useState, useCallback } from "react";
import { CVData } from "@/types/cv";
import { useApiKey } from "@/contexts/ApiKeyContext";

interface UploadStepProps {
  onDataExtracted: (data: Partial<CVData>, files?: File[]) => void;
  onNext: () => void;
  theme?: "dark" | "light";
}

export default function UploadStep({
  onDataExtracted,
  onNext,
  theme = "dark",
}: UploadStepProps) {
  const { apiKey } = useApiKey();
  const isDark = theme === "dark";
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (uploadedFiles: File[]) => {
    setError(null);

    // Validate file types
    const validTypes = [
      "application/json",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".json", ".pdf", ".docx"];

    const invalidFiles = uploadedFiles.filter((file) => {
      const isValidType =
        validTypes.includes(file.type) ||
        validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      return !isValidType;
    });

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file type(s): ${invalidFiles
          .map((f) => f.name)
          .join(", ")}. Please upload JSON, PDF, or DOCX files only.`
      );
      return;
    }

    setFiles(uploadedFiles);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      // Check if any JSON files (use old extractor for JSON)
      const jsonFiles = files.filter((f) =>
        f.name.toLowerCase().endsWith(".json")
      );
      const otherFiles = files.filter(
        (f) => !f.name.toLowerCase().endsWith(".json")
      );

      let extractedData: Partial<CVData> = {};

      // If we have JSON files, use the old extractor
      if (jsonFiles.length > 0) {
        const { parseLinkedInResume } = await import("@/lib/linkedinExtractor");
        extractedData = await parseLinkedInResume(jsonFiles[0]);
      }

      // If we have PDF/DOCX files, use AI extractor
      if (otherFiles.length > 0) {
        if (!apiKey) {
          throw new Error(
            "API key is required for PDF/DOCX extraction. Please configure your Gemini API key."
          );
        }
        const { createAICVExtractor } = await import("@/lib/aiCVExtractor");
        const extractor = createAICVExtractor(apiKey);
        const aiExtractedData = await extractor.extractFromFiles(otherFiles);

        // Merge with JSON data if exists
        extractedData = {
          ...extractedData,
          ...aiExtractedData,
          // Merge arrays
          experience: [
            ...(extractedData.experience || []),
            ...(aiExtractedData.experience || []),
          ],
          education: [
            ...(extractedData.education || []),
            ...(aiExtractedData.education || []),
          ],
          projects: [
            ...(extractedData.projects || []),
            ...(aiExtractedData.projects || []),
          ],
          certifications: [
            ...(extractedData.certifications || []),
            ...(aiExtractedData.certifications || []),
          ],
        };
      }

      // Pass data and files to parent
      onDataExtracted(extractedData, files);

      // Auto-advance after a brief delay
      setTimeout(() => {
        setUploading(false);
        onNext();
      }, 1000);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Failed to parse files. Please try again.");
    }
  };

  const handleSkip = () => {
    // Skip with empty data
    onDataExtracted({});
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1
          className={`text-5xl font-black mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Upload Your Resume
        </h1>
        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Upload one or multiple files (PDF, DOCX, JSON) and AI will extract all
          information
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`
          relative border-4 border-dashed rounded-3xl p-12 text-center
          ${
            dragActive
              ? isDark
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-indigo-600 bg-indigo-50"
              : isDark
              ? "border-gray-700 hover:border-indigo-500/50"
              : "border-gray-300 hover:border-indigo-400"
          }
          transition-all cursor-pointer
          ${isDark ? "bg-gray-900/50" : "bg-white"}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          className="hidden"
          accept=".json,.pdf,.docx,application/json,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          disabled={uploading}
          multiple
        />

        {uploading ? (
          <div className="py-8">
            <div
              className={`animate-spin h-16 w-16 mx-auto mb-4 border-4 border-t-transparent rounded-full ${
                isDark ? "border-indigo-500" : "border-indigo-600"
              }`}
            />
            <p
              className={`text-lg ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              AI is analyzing your {files.length > 1 ? "files" : "file"}...
            </p>
            <p
              className={`text-sm mt-2 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Using Gemini 2.5 Pro with thinking mode
            </p>
          </div>
        ) : (
          <>
            {/* Upload Icon */}
            <svg
              className={`mx-auto h-24 w-24 mb-6 ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {files.length > 0 ? (
              <div className="mb-6">
                <p
                  className={`text-lg font-semibold mb-4 ${
                    isDark ? "text-green-400" : "text-green-600"
                  }`}
                >
                  ✓ {files.length} File{files.length > 1 ? "s" : ""} Selected
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className={`
                        flex items-center justify-between px-4 py-2 rounded-lg
                        ${isDark ? "bg-gray-800" : "bg-gray-100"}
                      `}
                    >
                      <span
                        className={`text-sm truncate flex-1 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {file.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className={`
                          ml-2 px-2 py-1 rounded text-xs
                          ${
                            isDark
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-red-600 hover:bg-red-50"
                          }
                        `}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p
                  className={`text-xl font-semibold mb-2 ${
                    isDark ? "text-gray-200" : "text-gray-900"
                  }`}
                >
                  Drop your files here, or click to browse
                </p>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-500" : "text-gray-600"
                  }`}
                >
                  Supports multiple PDF, DOCX, or JSON files
                </p>
                <p
                  className={`text-xs mt-2 ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  💡 Upload multiple documents for more complete extraction
                </p>
              </>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features */}
      <div className={`mt-8 grid grid-cols-3 gap-4`}>
        <div
          className={`p-4 rounded-xl text-center ${
            isDark ? "bg-indigo-500/10" : "bg-indigo-50"
          }`}
        >
          <div className="text-2xl mb-2">🤖</div>
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            AI-Powered
          </p>
          <p
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}
          >
            Gemini 2.5 Pro
          </p>
        </div>
        <div
          className={`p-4 rounded-xl text-center ${
            isDark ? "bg-purple-500/10" : "bg-purple-50"
          }`}
        >
          <div className="text-2xl mb-2">📚</div>
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Multiple Files
          </p>
          <p
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}
          >
            Merge intelligently
          </p>
        </div>
        <div
          className={`p-4 rounded-xl text-center ${
            isDark ? "bg-pink-500/10" : "bg-pink-50"
          }`}
        >
          <div className="text-2xl mb-2">🧠</div>
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Thinking Mode
          </p>
          <p
            className={`text-xs ${isDark ? "text-gray-500" : "text-gray-600"}`}
          >
            Deep reasoning
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div
        className={`mt-8 p-6 rounded-2xl ${
          isDark
            ? "bg-indigo-500/10 border border-indigo-500/20"
            : "bg-indigo-50 border border-indigo-200"
        }`}
      >
        <h3
          className={`text-lg font-bold mb-3 ${
            isDark ? "text-indigo-400" : "text-indigo-700"
          }`}
        >
          How it works:
        </h3>
        <ul
          className={`space-y-2 text-sm ${
            isDark ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <li>
            ✓ Upload one or multiple resume files (PDF, DOCX, or LinkedIn JSON)
          </li>
          <li>✓ AI analyzes all documents together with deep reasoning</li>
          <li>✓ Extracts and merges information intelligently</li>
          <li>✓ Builds comprehensive profile from all sources</li>
          <li>✓ No manual text extraction needed!</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-12">
        <button
          onClick={handleSkip}
          className={`
            px-6 py-3 rounded-xl font-medium transition-all
            ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }
          `}
        >
          Skip (Manual Entry)
        </button>

        <button
          onClick={handleProcess}
          disabled={files.length === 0 || uploading}
          className={`
            px-8 py-3 rounded-xl font-bold transition-all
            ${
              files.length === 0 || uploading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : isDark
                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
            }
            shadow-lg
          `}
        >
          {uploading
            ? "Processing..."
            : `Process ${files.length > 0 ? `(${files.length})` : ""} →`}
        </button>
      </div>
    </div>
  );
}
