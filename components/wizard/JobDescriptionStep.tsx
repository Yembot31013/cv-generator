"use client";

import { useState, useEffect } from "react";
import { JobDescription } from "@/types/flow";
import { useApiKey } from "@/contexts/ApiKeyContext";

interface JobDescriptionStepProps {
  onJobDescriptionSubmit: (jobDesc: JobDescription) => void;
  onBack: () => void;
  onNext: () => void;
  theme?: "dark" | "light";
}

export default function JobDescriptionStep({
  onJobDescriptionSubmit,
  onBack,
  onNext,
  theme = "dark",
}: JobDescriptionStepProps) {
  const { apiKey } = useApiKey();
  const isDark = theme === "dark";
  const [jobData, setJobData] = useState<JobDescription>({
    title: "",
    company: "",
    location: "",
    description: "",
    salary: "",
    experienceRequired: "",
    employmentType: "",
    workMode: "",
    teamSize: "",
    industry: "",
    applicationMethod: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState<JobDescription | null>(null);
  const [rawText, setRawText] = useState("");

  // Detect when user pastes text (might be recruiter message)
  const handleDescriptionChange = (text: string) => {
    setJobData({ ...jobData, description: text });

    // If user pastes text and fields are empty, offer to parse
    // Lower threshold for short messages (50 chars) vs longer ones (200 chars)
    const threshold = text.length < 200 ? 50 : 200;

    if (
      text.length >= threshold &&
      !jobData.title &&
      !jobData.company &&
      !showModal &&
      !parsedData
    ) {
      // Check if it looks like a job description (expanded keywords for short messages)
      const keywords = [
        "position",
        "role",
        "opportunity",
        "hiring",
        "requirements",
        "responsibilities",
        "engineer",
        "developer",
        "lead",
        "senior",
        "yrs",
        "years",
        "exp",
        "salary",
        "usd",
        "eur",
        "send cv",
        "join us",
        "looking for",
      ];
      const lowerText = text.toLowerCase();
      // For short messages, require fewer keyword matches
      const requiredMatches = text.length < 200 ? 2 : 3;
      const matchCount = keywords.filter((keyword) =>
        lowerText.includes(keyword)
      ).length;

      if (matchCount >= requiredMatches) {
        setRawText(text);
        setShowModal(true);
      }
    }
  };

  const handleParseWithAI = async () => {
    if (!apiKey) {
      alert(
        "API key is required for AI parsing. Please configure your Gemini API key first."
      );
      return;
    }

    setParsing(true);

    try {
      const { createJobDescriptionParser } = await import(
        "@/lib/jobDescriptionParser"
      );
      const parser = createJobDescriptionParser(apiKey);
      const parsed = await parser.parseJobDescription(rawText);

      setParsedData(parsed);
      setParsing(false);
    } catch (error) {
      console.error("Parsing error:", error);
      setParsing(false);
      alert(
        "Failed to parse job description. You can still fill in the fields manually."
      );
      setShowModal(false);
    }
  };

  const handleAcceptParsed = () => {
    if (parsedData) {
      setJobData({
        title: parsedData.title || jobData.title,
        company: parsedData.company || jobData.company,
        location: parsedData.location || jobData.location,
        description: parsedData.description || jobData.description,
        requirements: parsedData.requirements,
        responsibilities: parsedData.responsibilities,
        skills: parsedData.skills,
        benefits: parsedData.benefits,
        // Include all new fields
        salary: parsedData.salary,
        salaryRange: parsedData.salaryRange,
        experienceRequired: parsedData.experienceRequired,
        employmentType: parsedData.employmentType,
        workMode: parsedData.workMode,
        teamSize: parsedData.teamSize,
        industry: parsedData.industry,
        applicationMethod: parsedData.applicationMethod,
      });
    }
    setShowModal(false);
  };

  const handleDeclineAI = () => {
    setShowModal(false);
    setParsedData(null);
  };

  const handleSubmit = () => {
    if (!jobData.description.trim()) {
      alert("Please enter a job description");
      return;
    }

    onJobDescriptionSubmit(jobData);
    onNext();
  };

  const handleSkip = () => {
    onJobDescriptionSubmit({ description: "" });
    onNext();
  };

  const isValid = jobData.description.trim().length > 50;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1
          className={`text-5xl font-black mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Job Description
        </h1>
        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Paste the job description or recruiter message to tailor your CV
        </p>
      </div>

      {/* Prominent AI Auto-Fill Card */}
      {!parsedData && jobData.description.length < 200 && (
        <div
          className={`mb-8 p-6 rounded-2xl border-2 ${
            isDark
              ? "bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30"
              : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`text-4xl ${
                isDark ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              🤖
            </div>
            <div className="flex-1">
              <h3
                className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Quick Tip: Use AI Auto-Fill!
              </h3>
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Just paste any recruiter message, job posting, or email below,
                and our AI will automatically extract:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Job Title
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Company Name
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Location
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Salary &
                  Compensation
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Experience Required
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Work Mode
                  (Remote/Hybrid)
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Requirements
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Skills Needed
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Responsibilities
                </div>
              </div>
              <button
                onClick={() => {
                  if (jobData.description.trim()) {
                    setRawText(jobData.description);
                    setShowModal(true);
                  } else {
                    // Focus the textarea and show a hint
                    document
                      .getElementById("job-description-textarea")
                      ?.focus();
                    alert(
                      "Please paste your recruiter message or job posting in the text area below, then click this button again!"
                    );
                  }
                }}
                className={`
                  px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                  ${
                    isDark
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-lg"
                  }
                `}
              >
                <span>🚀</span>
                <span>Click Here After Pasting</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Job Title */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
              isDark ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Job Title (Optional)
          </label>
          <input
            type="text"
            value={jobData.title}
            onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            placeholder="e.g., Senior Full-Stack Developer"
            className={`
              w-full px-4 py-3 rounded-xl
              ${
                isDark
                  ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
        </div>

        {/* Company */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
              isDark ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Company (Optional)
          </label>
          <input
            type="text"
            value={jobData.company}
            onChange={(e) =>
              setJobData({ ...jobData, company: e.target.value })
            }
            placeholder="e.g., TechCorp Inc."
            className={`
              w-full px-4 py-3 rounded-xl
              ${
                isDark
                  ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
        </div>

        {/* Location */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
              isDark ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Location (Optional)
          </label>
          <input
            type="text"
            value={jobData.location || ""}
            onChange={(e) =>
              setJobData({ ...jobData, location: e.target.value })
            }
            placeholder="e.g., San Francisco, CA (Remote)"
            className={`
              w-full px-4 py-3 rounded-xl
              ${
                isDark
                  ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
        </div>

        {/* Additional Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Salary */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              💰 Salary (Optional)
            </label>
            <input
              type="text"
              value={jobData.salary || ""}
              onChange={(e) =>
                setJobData({ ...jobData, salary: e.target.value })
              }
              placeholder="e.g., $4,500 - $5,500 USD/mo"
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            />
          </div>

          {/* Experience Required */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              📅 Experience Required (Optional)
            </label>
            <input
              type="text"
              value={jobData.experienceRequired || ""}
              onChange={(e) =>
                setJobData({ ...jobData, experienceRequired: e.target.value })
              }
              placeholder="e.g., 5+ years, +6 yrs exp"
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            />
          </div>

          {/* Employment Type */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              📋 Employment Type (Optional)
            </label>
            <select
              value={jobData.employmentType || ""}
              onChange={(e) =>
                setJobData({ ...jobData, employmentType: e.target.value })
              }
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white"
                    : "bg-white border border-gray-300 text-gray-900"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            >
              <option value="">Select type...</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          {/* Work Mode */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              🏠 Work Mode (Optional)
            </label>
            <select
              value={jobData.workMode || ""}
              onChange={(e) =>
                setJobData({ ...jobData, workMode: e.target.value })
              }
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white"
                    : "bg-white border border-gray-300 text-gray-900"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            >
              <option value="">Select mode...</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>

          {/* Team Size */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              👥 Team Size (Optional)
            </label>
            <input
              type="text"
              value={jobData.teamSize || ""}
              onChange={(e) =>
                setJobData({ ...jobData, teamSize: e.target.value })
              }
              placeholder="e.g., Team of 5, Leading team of 10"
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            />
          </div>

          {/* Industry */}
          <div>
            <label
              className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              🏢 Industry (Optional)
            </label>
            <input
              type="text"
              value={jobData.industry || ""}
              onChange={(e) =>
                setJobData({ ...jobData, industry: e.target.value })
              }
              placeholder="e.g., Technology, Finance, Healthcare"
              className={`
                w-full px-4 py-3 rounded-xl
                ${
                  isDark
                    ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              `}
            />
          </div>
        </div>

        {/* Application Method */}
        <div>
          <label
            className={`block text-sm font-bold mb-2 uppercase tracking-wider ${
              isDark ? "text-gray-400" : "text-gray-700"
            }`}
          >
            📧 Application Method (Optional)
          </label>
          <input
            type="text"
            value={jobData.applicationMethod || ""}
            onChange={(e) =>
              setJobData({ ...jobData, applicationMethod: e.target.value })
            }
            placeholder="e.g., Send your CV, Apply via email, Apply on website"
            className={`
              w-full px-4 py-3 rounded-xl
              ${
                isDark
                  ? "bg-gray-900 border border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-400"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500
            `}
          />
        </div>

        {/* Job Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className={`block text-sm font-bold uppercase tracking-wider ${
                isDark ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Job Description *
            </label>
            {jobData.description.length > 50 && !parsedData && (
              <button
                onClick={() => {
                  setRawText(jobData.description);
                  setShowModal(true);
                }}
                className={`
                  px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2
                  ${
                    isDark
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg"
                      : "bg-gradient-to-r from-indigo-600 to-purple-700 text-white hover:from-indigo-700 hover:to-purple-800 shadow-lg"
                  }
                `}
              >
                <span>🤖</span>
                <span>Auto-Fill with AI</span>
              </button>
            )}
          </div>

          {/* Enhanced placeholder with visual guide */}
          <div className="relative">
            <textarea
              id="job-description-textarea"
              value={jobData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              placeholder="📋 Paste anything here:
• LinkedIn recruiter message
• Email from hiring manager  
• Job posting from company website
• Copy-paste from job board
• Any text about the role

💡 Then click 'Auto-Fill with AI' button above to extract all details automatically!"
              rows={16}
              className={`
                w-full px-4 py-3 rounded-xl resize-none text-sm
                ${
                  isDark
                    ? "bg-gray-900 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
                    : "bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500"
                }
                focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all
              `}
            />

            {/* Floating helper when empty */}
            {!jobData.description && (
              <div
                className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium ${
                  isDark
                    ? "bg-indigo-500/20 text-indigo-300"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                💡 Paste & Click AI Button
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <p
              className={`text-xs ${
                isDark ? "text-gray-500" : "text-gray-600"
              }`}
            >
              {jobData.description.length} characters
            </p>
            {jobData.description.length < 50 && (
              <p className="text-xs text-amber-500">
                Need at least 50 characters for AI enhancement
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Info Box - Show different content based on state */}
      {!parsedData ? (
        <div
          className={`mt-8 p-6 rounded-2xl border-2 ${
            isDark
              ? "bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30"
              : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">✨</div>
            <div className="flex-1">
              <h3
                className={`text-lg font-bold mb-2 ${
                  isDark ? "text-purple-400" : "text-purple-700"
                }`}
              >
                What Happens Next?
              </h3>
              <p
                className={`text-sm mb-3 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                After you paste and use AI Auto-Fill, our AI will analyze the
                job description and intelligently tailor your CV to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Highlight relevant
                  skills and experience
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Add quantifiable
                  metrics and achievements
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Match keywords from
                  the job posting
                </div>
                <div
                  className={`flex items-center gap-2 text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="text-green-500">✓</span> Position you as the
                  perfect candidate
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`mt-8 p-6 rounded-2xl ${
            isDark
              ? "bg-green-500/10 border border-green-500/30"
              : "bg-green-50 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <h3
                className={`font-bold mb-1 ${
                  isDark ? "text-green-400" : "text-green-700"
                }`}
              >
                AI Auto-Fill Complete!
              </h3>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Job details have been extracted. You can still edit any field
                above if needed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-12">
        <button
          onClick={onBack}
          className={`
            px-6 py-3 rounded-xl font-medium transition-all
            ${
              isDark
                ? "text-gray-400 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }
          `}
        >
          ← Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }
            `}
          >
            Skip (Quick Format)
          </button>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className={`
              px-8 py-3 rounded-xl font-bold transition-all
              ${
                !isValid
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : isDark
                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
              }
              shadow-lg
            `}
          >
            Generate Tailored CV →
          </button>
        </div>
      </div>

      {/* AI Parsing Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`
              relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8
              ${
                isDark
                  ? "bg-[#1a1b26] border border-indigo-500/20"
                  : "bg-white border border-indigo-200"
              }
              shadow-2xl
            `}
          >
            {!parsing && !parsedData && (
              <>
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                      isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                    }`}
                  >
                    <span className="text-4xl">🤖</span>
                  </div>
                  <h2
                    className={`text-3xl font-black mb-3 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    AI Auto-Fill Ready!
                  </h2>
                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    We can automatically extract all job details from your text.
                    This takes just a few seconds!
                  </p>
                </div>

                <div
                  className={`p-6 rounded-xl mb-6 border-2 ${
                    isDark
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-indigo-50 border-indigo-200"
                  }`}
                >
                  <h3
                    className={`text-base font-bold mb-4 flex items-center gap-2 ${
                      isDark ? "text-indigo-400" : "text-indigo-700"
                    }`}
                  >
                    <span>✨</span>
                    <span>AI will automatically extract:</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Job Title</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Company Name</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Location</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Salary & Compensation</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Experience Required</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Work Mode (Remote/Hybrid)</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Key Requirements</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Required Skills</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 text-sm ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <span className="text-green-500 font-bold">✓</span>
                      <span>Responsibilities</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDeclineAI}
                    className={`
                      px-6 py-3 rounded-xl font-medium transition-all
                      ${
                        isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
                      }
                    `}
                  >
                    No Thanks, I'll Fill Manually
                  </button>
                  <button
                    onClick={handleParseWithAI}
                    className={`
                      flex-1 px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
                      ${
                        isDark
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
                      }
                    `}
                  >
                    <span>🚀</span>
                    <span>Yes, Extract with AI!</span>
                  </button>
                </div>
              </>
            )}

            {parsing && (
              <div className="text-center py-12">
                <div
                  className={`animate-spin h-16 w-16 mx-auto mb-4 border-4 border-t-transparent rounded-full ${
                    isDark ? "border-indigo-500" : "border-indigo-600"
                  }`}
                />
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  AI is analyzing...
                </h3>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Extracting job details from your text
                </p>
              </div>
            )}

            {parsedData && !parsing && (
              <>
                <h2
                  className={`text-3xl font-black mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  ✨ Extracted Job Details
                </h2>
                <p
                  className={`text-lg mb-6 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Review the extracted information and click accept to use it:
                </p>

                <div className="space-y-4 mb-6">
                  {/* Basic Info Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parsedData.title && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-indigo-500/10" : "bg-indigo-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase mb-1 ${
                            isDark ? "text-indigo-400" : "text-indigo-700"
                          }`}
                        >
                          Job Title
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {parsedData.title}
                        </p>
                      </div>
                    )}

                    {parsedData.company && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-purple-500/10" : "bg-purple-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase mb-1 ${
                            isDark ? "text-purple-400" : "text-purple-700"
                          }`}
                        >
                          Company
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {parsedData.company}
                        </p>
                      </div>
                    )}

                    {parsedData.location && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-pink-500/10" : "bg-pink-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase mb-1 ${
                            isDark ? "text-pink-400" : "text-pink-700"
                          }`}
                        >
                          Location
                        </p>
                        <p
                          className={`text-lg font-semibold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {parsedData.location}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Compensation & Details Row */}
                  {(parsedData.salary ||
                    parsedData.experienceRequired ||
                    parsedData.workMode ||
                    parsedData.employmentType) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {parsedData.salary && (
                        <div
                          className={`p-4 rounded-xl ${
                            isDark ? "bg-green-500/10" : "bg-green-50"
                          }`}
                        >
                          <p
                            className={`text-xs font-bold uppercase mb-1 ${
                              isDark ? "text-green-400" : "text-green-700"
                            }`}
                          >
                            💰 Salary
                          </p>
                          <p
                            className={`text-base font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {parsedData.salary}
                          </p>
                        </div>
                      )}

                      {parsedData.experienceRequired && (
                        <div
                          className={`p-4 rounded-xl ${
                            isDark ? "bg-blue-500/10" : "bg-blue-50"
                          }`}
                        >
                          <p
                            className={`text-xs font-bold uppercase mb-1 ${
                              isDark ? "text-blue-400" : "text-blue-700"
                            }`}
                          >
                            📅 Experience
                          </p>
                          <p
                            className={`text-base font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {parsedData.experienceRequired}
                          </p>
                        </div>
                      )}

                      {parsedData.workMode && (
                        <div
                          className={`p-4 rounded-xl ${
                            isDark ? "bg-cyan-500/10" : "bg-cyan-50"
                          }`}
                        >
                          <p
                            className={`text-xs font-bold uppercase mb-1 ${
                              isDark ? "text-cyan-400" : "text-cyan-700"
                            }`}
                          >
                            🏠 Work Mode
                          </p>
                          <p
                            className={`text-base font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {parsedData.workMode}
                          </p>
                        </div>
                      )}

                      {parsedData.employmentType && (
                        <div
                          className={`p-4 rounded-xl ${
                            isDark ? "bg-orange-500/10" : "bg-orange-50"
                          }`}
                        >
                          <p
                            className={`text-xs font-bold uppercase mb-1 ${
                              isDark ? "text-orange-400" : "text-orange-700"
                            }`}
                          >
                            📋 Employment Type
                          </p>
                          <p
                            className={`text-base font-semibold ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {parsedData.employmentType}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {parsedData.skills && parsedData.skills.length > 0 && (
                    <div
                      className={`p-4 rounded-xl ${
                        isDark ? "bg-green-500/10" : "bg-green-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase mb-2 ${
                          isDark ? "text-green-400" : "text-green-700"
                        }`}
                      >
                        Required Skills ({parsedData.skills.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.skills.map((skill, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? "bg-green-500/20 text-green-300"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.requirements &&
                    parsedData.requirements.length > 0 && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-gray-800" : "bg-gray-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase mb-2 ${
                            isDark ? "text-gray-400" : "text-gray-700"
                          }`}
                        >
                          Requirements ({parsedData.requirements.length})
                        </p>
                        <ul
                          className={`space-y-1 text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {parsedData.requirements.slice(0, 5).map((req, i) => (
                            <li key={i}>• {req}</li>
                          ))}
                          {parsedData.requirements.length > 5 && (
                            <li className="text-xs italic">
                              + {parsedData.requirements.length - 5} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  {parsedData.responsibilities &&
                    parsedData.responsibilities.length > 0 && (
                      <div
                        className={`p-4 rounded-xl ${
                          isDark ? "bg-yellow-500/10" : "bg-yellow-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-bold uppercase mb-2 ${
                            isDark ? "text-yellow-400" : "text-yellow-700"
                          }`}
                        >
                          Responsibilities ({parsedData.responsibilities.length}
                          )
                        </p>
                        <ul
                          className={`space-y-1 text-sm ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {parsedData.responsibilities
                            .slice(0, 5)
                            .map((resp, i) => (
                              <li key={i}>• {resp}</li>
                            ))}
                          {parsedData.responsibilities.length > 5 && (
                            <li className="text-xs italic">
                              + {parsedData.responsibilities.length - 5} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                  {parsedData.benefits && parsedData.benefits.length > 0 && (
                    <div
                      className={`p-4 rounded-xl ${
                        isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase mb-2 ${
                          isDark ? "text-emerald-400" : "text-emerald-700"
                        }`}
                      >
                        Benefits ({parsedData.benefits.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parsedData.benefits.map((benefit, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsedData.applicationMethod && (
                    <div
                      className={`p-4 rounded-xl ${
                        isDark ? "bg-teal-500/10" : "bg-teal-50"
                      }`}
                    >
                      <p
                        className={`text-xs font-bold uppercase mb-1 ${
                          isDark ? "text-teal-400" : "text-teal-700"
                        }`}
                      >
                        📧 Application Method
                      </p>
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {parsedData.applicationMethod}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeclineAI}
                    className={`
                      flex-1 px-6 py-3 rounded-xl font-medium transition-all
                      ${
                        isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }
                    `}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptParsed}
                    className={`
                      flex-1 px-6 py-3 rounded-xl font-bold transition-all
                      ${
                        isDark
                          ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                          : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      }
                      shadow-lg
                    `}
                  >
                    ✓ Accept & Use These Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
