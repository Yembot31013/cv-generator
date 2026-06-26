"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CVData, CoverLetter } from "@/types/cv";
import { JobDescription } from "@/types/flow";
import {
  AIReviewResult,
  ScoreBreakdown,
  ScoreLevel,
  getScoreColor,
  getScoreColorLight,
  getLevelLabel,
  getLevelEmoji,
  KeywordMatch,
} from "@/types/review";
import { createAIReviewer, ReviewSession } from "@/lib/aiReviewer";
import { createAIModifier, ReviewFixScope, getReviewFixGroups, REVIEW_FIX_SCOPE_LABELS } from "@/lib/aiModifier";
import { useAiSettings } from "@/contexts/ApiKeyContext";

interface AIReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cvData: CVData;
  coverLetter?: string | null;
  jobDescription: JobDescription;
  files?: File[];
  onResumeModified?: (cv: CVData) => void;
  onCoverLetterModified?: (content: string) => void;
  theme?: "dark" | "light";
}

// Ring Progress Component
function RingProgress({
  score,
  size = 120,
  strokeWidth = 10,
  level,
  isDark,
  showLabel = true,
  animated = true,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  level: ScoreLevel;
  isDark: boolean;
  showLabel?: boolean;
  animated?: boolean;
}) {
  const [animatedScore, setAnimatedScore] = useState(animated ? 0 : score);
  const colors = isDark ? getScoreColor(level) : getScoreColorLight(level);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colors.ring} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-2xl font-black ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {Math.round(animatedScore)}
          </span>
          <span className={`text-xs font-medium ${colors.text}`}>
            {getLevelLabel(level)}
          </span>
        </div>
      )}
    </div>
  );
}

// Mini Ring Progress for category scores
function MiniRingProgress({
  score,
  level,
  isDark,
}: {
  score: number;
  level: ScoreLevel;
  isDark: boolean;
}) {
  const colors = isDark ? getScoreColor(level) : getScoreColorLight(level);
  const size = 44;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`${colors.ring} transition-all duration-700 ease-out`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-xs font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {score}
        </span>
      </div>
    </div>
  );
}

// Info Tooltip Component - uses fixed positioning to escape overflow containers
function InfoTooltip({ text, isDark }: { text: string; isDark: boolean }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = (
    e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  };

  return (
    <>
      <button
        className={`
          w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
          transition-all cursor-help shrink-0
          ${
            isDark
              ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              : "bg-gray-200 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
          }
        `}
        onMouseEnter={(e) => {
          updatePosition(e);
          setIsVisible(true);
        }}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={(e) => {
          updatePosition(e);
          setIsVisible(true);
        }}
        onBlur={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          updatePosition(e);
          setIsVisible(!isVisible);
        }}
        aria-label="More information"
        type="button"
      >
        i
      </button>
      {isVisible && (
        <div
          className="fixed z-200 pointer-events-none"
          style={{
            top: position.top,
            left: position.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className={`
              w-72 p-3 rounded-lg text-sm shadow-2xl
              ${
                isDark
                  ? "bg-gray-900 text-gray-200 border border-gray-600"
                  : "bg-white text-gray-700 border border-gray-200 shadow-lg"
              }
              animate-fade-in
            `}
            role="tooltip"
          >
            <div className="relative">
              {text}
              {/* Arrow */}
              <div
                className={`
                  absolute -bottom-[14px] left-1/2 -translate-x-1/2
                  border-[6px] border-transparent
                  ${isDark ? "border-t-gray-900" : "border-t-white"}
                `}
                style={{
                  filter: isDark
                    ? "none"
                    : "drop-shadow(0 1px 1px rgba(0,0,0,0.1))",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Badge Component
function Badge({
  level,
  text,
  isDark,
}: {
  level: ScoreLevel;
  text: string;
  isDark: boolean;
}) {
  const colors = isDark ? getScoreColor(level) : getScoreColorLight(level);
  return (
    <span
      className={`
      inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
      ${colors.bg} ${colors.text} ${colors.border} border
    `}
    >
      {getLevelEmoji(level)} {text}
    </span>
  );
}

// Category Score Card
function CategoryScoreCard({
  category,
  isDark,
  delay = 0,
}: {
  category: ScoreBreakdown;
  isDark: boolean;
  delay?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = isDark
    ? getScoreColor(category.level)
    : getScoreColorLight(category.level);

  return (
    <div
      className={`
        rounded-xl transition-all duration-300
        ${
          isDark
            ? "bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50"
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }
        animate-slide-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-4 text-left"
      >
        <MiniRingProgress
          score={category.score}
          level={category.level}
          isDark={isDark}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4
              className={`font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {category.title}
            </h4>
            <InfoTooltip text={category.tooltip} isDark={isDark} />
            {category.importance === "high" && (
              <span
                className={`
                text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide
                ${
                  isDark
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-amber-100 text-amber-700"
                }
              `}
              >
                Important
              </span>
            )}
          </div>
          <p
            className={`text-sm truncate ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {category.description}
          </p>
        </div>

        <svg
          className={`w-5 h-5 transition-transform ${
            isExpanded ? "rotate-180" : ""
          } ${isDark ? "text-gray-500" : "text-gray-400"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && category.suggestions.length > 0 && (
        <div
          className={`px-4 pb-4 border-t ${
            isDark ? "border-gray-700/50" : "border-gray-100"
          }`}
        >
          <h5
            className={`text-xs font-bold uppercase tracking-wide mt-3 mb-2 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            How to Improve
          </h5>
          <ul className="space-y-2">
            {category.suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-2 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span className="text-indigo-500 mt-0.5">→</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Keyword Chip
function KeywordChip({
  keyword,
  isDark,
}: {
  keyword: KeywordMatch;
  isDark: boolean;
}) {
  const getImportanceColor = () => {
    if (keyword.found) {
      return isDark
        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        : "bg-emerald-100 text-emerald-700 border-emerald-300";
    }
    switch (keyword.importance) {
      case "critical":
        return isDark
          ? "bg-red-500/20 text-red-400 border-red-500/30"
          : "bg-red-100 text-red-700 border-red-300";
      case "important":
        return isDark
          ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
          : "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return isDark
          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          : "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border
        ${getImportanceColor()}
      `}
      title={keyword.context}
    >
      {keyword.found ? "✓" : "✗"} {keyword.keyword}
    </span>
  );
}

// Section Review Card
function SectionReviewCard({
  section,
  isDark,
  delay = 0,
}: {
  section: {
    sectionName: string;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  };
  isDark: boolean;
  delay?: number;
}) {
  const level =
    section.score >= 80
      ? "good"
      : section.score >= 60
      ? "fair"
      : section.score >= 40
      ? "needs_work"
      : "critical";
  const colors = isDark
    ? getScoreColor(level as ScoreLevel)
    : getScoreColorLight(level as ScoreLevel);

  return (
    <div
      className={`
        p-4 rounded-xl
        ${
          isDark
            ? "bg-gray-800/30 border border-gray-700/30"
            : "bg-gray-50 border border-gray-200"
        }
        animate-slide-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <h4
          className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
        >
          {section.sectionName}
        </h4>
        <span className={`text-sm font-bold ${colors.text}`}>
          {section.score}/100
        </span>
      </div>
      <p
        className={`text-sm mb-3 ${isDark ? "text-gray-400" : "text-gray-600"}`}
      >
        {section.feedback}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {section.strengths.length > 0 && (
          <div>
            <h5
              className={`text-xs font-bold mb-1.5 ${
                isDark ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              ✓ Strengths
            </h5>
            <ul className="space-y-1">
              {section.strengths.slice(0, 2).map((s, i) => (
                <li
                  key={i}
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {section.improvements.length > 0 && (
          <div>
            <h5
              className={`text-xs font-bold mb-1.5 ${
                isDark ? "text-orange-400" : "text-orange-600"
              }`}
            >
              ↑ Improve
            </h5>
            <ul className="space-y-1">
              {section.improvements.slice(0, 2).map((s, i) => (
                <li
                  key={i}
                  className={`text-xs ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading Animation
function LoadingAnimation({
  isDark,
  isReAnalysis = false,
  reviewNumber = 1,
}: {
  isDark: boolean;
  isReAnalysis?: boolean;
  reviewNumber?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-32 h-32 mb-8">
        {/* Outer spinning ring */}
        <div
          className={`
          absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-purple-500 border-b-pink-500 border-l-transparent
          animate-spin
        `}
        />
        {/* Inner pulsing circle */}
        <div
          className={`
          absolute inset-4 rounded-full
          ${isDark ? "bg-indigo-500/20" : "bg-indigo-100"}
          animate-pulse flex items-center justify-center
        `}
        >
          <span className="text-4xl">{isReAnalysis ? "🔄" : "🔍"}</span>
        </div>
      </div>
      <h3
        className={`text-xl font-bold mb-2 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {isReAnalysis
          ? `Re-analyzing (Review #${reviewNumber})`
          : "Analyzing Your Application"}
      </h3>
      <p
        className={`text-sm text-center max-w-md ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {isReAnalysis
          ? "Comparing your resume with previous feedback to track your progress..."
          : "Our AI is reviewing your resume and cover letter..."}
      </p>
      <div
        className={`
        mt-6 flex items-center gap-2 px-4 py-2 rounded-full
        ${isDark ? "bg-gray-800" : "bg-gray-100"}
      `}
      >
        <div className="flex gap-1">
          <span
            className={`w-2 h-2 rounded-full bg-indigo-500 animate-bounce`}
            style={{ animationDelay: "0ms" }}
          />
          <span
            className={`w-2 h-2 rounded-full bg-purple-500 animate-bounce`}
            style={{ animationDelay: "150ms" }}
          />
          <span
            className={`w-2 h-2 rounded-full bg-pink-500 animate-bounce`}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        <span
          className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          This usually takes 10-15 seconds
        </span>
      </div>
    </div>
  );
}

// Fix with AI — confirmation dialog with optional user context
function FixWithAIDialog({
  isOpen,
  scope,
  review,
  userContext,
  onContextChange,
  onConfirm,
  onClose,
  isApplying,
  isDark,
}: {
  isOpen: boolean;
  scope: ReviewFixScope | null;
  review: AIReviewResult | null;
  userContext: string;
  onContextChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isApplying: boolean;
  isDark: boolean;
}) {
  if (!isOpen || !scope || !review) return null;

  const groups = getReviewFixGroups(review, scope);
  const totalItems = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isApplying ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fix-with-ai-title"
        className={`
          relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden
          ${isDark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-6 py-5 border-b ${
            isDark ? "border-gray-800 bg-gray-900/80" : "border-gray-100 bg-gray-50/80"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                id="fix-with-ai-title"
                className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}
              >
                Fix with AI
              </h3>
              <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {REVIEW_FIX_SCOPE_LABELS[scope]}
                {totalItems > 0 && ` · ${totalItems} item${totalItems === 1 ? "" : "s"}`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isApplying}
              className={`p-2 rounded-lg transition-colors shrink-0 ${
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              } ${isApplying ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[min(60vh,420px)] overflow-y-auto">
          {groups.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    {group.label}
                  </p>
                  <ul className="space-y-2">
                    {group.items.map((item, idx) => (
                      <li
                        key={idx}
                        className={`text-sm flex gap-2 ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        <span
                          className={`shrink-0 mt-0.5 ${
                            isDark ? "text-emerald-500" : "text-emerald-600"
                          }`}
                        >
                          •
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              No items in this scope. Try a different fix option.
            </p>
          )}

          <div>
            <label
              htmlFor="fix-user-context"
              className={`block text-sm font-semibold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Additional context
              <span className={`font-normal ml-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                (recommended)
              </span>
            </label>
            <p className={`text-xs mb-3 ${isDark ? "text-gray-500" : "text-gray-500"}`}>
              Add details the AI needs to apply fixes — e.g. phone number, email, URLs, or
              metrics the review flagged as missing.
            </p>
            <textarea
              id="fix-user-context"
              value={userContext}
              onChange={(e) => onContextChange(e.target.value)}
              disabled={isApplying}
              rows={4}
              placeholder={`Example:\nPhone: +1 (555) 123-4567\nPortfolio: https://myportfolio.dev\nAdd AWS to skills — I use it daily at work`}
              className={`
                w-full px-4 py-3 rounded-xl text-sm resize-none transition-all
                ${
                  isDark
                    ? "bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    : "bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }
                focus:outline-none disabled:opacity-60
              `}
            />
          </div>

          <div
            className={`flex items-start gap-2 p-3 rounded-xl text-xs ${
              isDark
                ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-200"
                : "bg-indigo-50 border border-indigo-100 text-indigo-800"
            }`}
          >
            <span className="shrink-0">🔒</span>
            <p>
              Your original resume facts are preserved. Only the details you provide here and
              existing data are used — nothing is invented.
            </p>
          </div>
        </div>

        <div
          className={`px-6 py-4 flex gap-3 border-t ${
            isDark ? "border-gray-800 bg-gray-900/50" : "border-gray-100 bg-gray-50/50"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isApplying}
            className={`
              flex-1 py-2.5 rounded-xl font-medium text-sm transition-all
              ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }
              ${isApplying ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isApplying || groups.length === 0}
            className={`
              flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
              ${
                isApplying || groups.length === 0
                  ? isDark
                    ? "bg-emerald-500/30 text-emerald-200/60 cursor-not-allowed"
                    : "bg-emerald-200 text-emerald-700/60 cursor-not-allowed"
                  : isDark
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500"
              }
            `}
          >
            {isApplying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Applying…
              </>
            ) : (
              <>Apply fixes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Modal Component
export default function AIReviewModal({
  isOpen,
  onClose,
  cvData,
  coverLetter,
  jobDescription,
  files,
  onResumeModified,
  onCoverLetterModified,
  theme = "dark",
}: AIReviewModalProps) {
  const isDark = theme === "dark";
  const { apiKey, flashModel } = useAiSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixScope, setFixScope] = useState<ReviewFixScope | null>(null);
  const [fixDialogOpen, setFixDialogOpen] = useState(false);
  const [pendingFixScope, setPendingFixScope] = useState<ReviewFixScope | null>(null);
  const [fixUserContext, setFixUserContext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fixMessage, setFixMessage] = useState<string | null>(null);
  const [review, setReview] = useState<AIReviewResult | null>(null);
  const [session, setSession] = useState<ReviewSession | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<
    "resume" | "cover-letter" | "keywords"
  >("resume");

  /** Immutable factual snapshot captured when the review modal opens. */
  const baselineRef = useRef<{ cv: CVData; coverLetter?: CoverLetter } | null>(
    null
  );

  const toCoverLetterObject = useCallback(
    (content?: string | null): CoverLetter | undefined =>
      content?.trim()
        ? {
            content: content.trim(),
            salutation: "Dear Hiring Manager,",
            closing: "Sincerely,",
          }
        : undefined,
    []
  );

  useEffect(() => {
    if (!isOpen) {
      baselineRef.current = null;
      return;
    }
    baselineRef.current = {
      cv: structuredClone(cvData),
      coverLetter: toCoverLetterObject(coverLetter),
    };
    // Capture baseline once per modal open — not on subsequent cvData updates after fixes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !review && !isLoading) {
      handleReview();
    }
  }, [isOpen]);

  const handleReview = async () => {
    if (!apiKey) {
      setError("API key not configured");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reviewer = createAIReviewer(apiKey, flashModel);
      // Pass the current session for context-aware re-analysis
      const { result, session: updatedSession } =
        await reviewer.reviewApplicationMaterials(
          cvData,
          jobDescription,
          coverLetter || undefined,
          session // Pass existing session for re-analysis context
        );
      setReview(result);
      setSession(updatedSession); // Store updated session with history
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to review. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openFixDialog = (scope: ReviewFixScope) => {
    setPendingFixScope(scope);
    setFixUserContext("");
    setFixDialogOpen(true);
  };

  const closeFixDialog = () => {
    if (isFixing) return;
    setFixDialogOpen(false);
    setPendingFixScope(null);
    setFixUserContext("");
  };

  const handleFixFromReview = async (scope: ReviewFixScope, userContext?: string) => {
    if (!apiKey) {
      setError("API key not configured");
      return;
    }
    if (!review) return;
    if (!onResumeModified) {
      setError("Cannot apply fixes — resume update handler is missing.");
      return;
    }
    if (!baselineRef.current) {
      setError("Baseline snapshot missing. Close and reopen the review.");
      return;
    }

    setIsFixing(true);
    setFixScope(scope);
    setError(null);
    setFixMessage(null);

    try {
      const modifier = createAIModifier(apiKey, flashModel);
      const workingCoverLetter = toCoverLetterObject(coverLetter);

      const result = await modifier.fixFromReview(
        review,
        scope,
        cvData,
        workingCoverLetter,
        baselineRef.current.cv,
        baselineRef.current.coverLetter,
        jobDescription,
        files,
        userContext
      );

      if (!result.success) {
        setFixMessage(result.message);
        return;
      }

      if (result.modifiedResume) {
        onResumeModified(result.modifiedResume);
      }
      if (result.modifiedCoverLetter && onCoverLetterModified) {
        onCoverLetterModified(result.modifiedCoverLetter.content);
      }

      const changeSummary =
        result.changes.length > 0
          ? result.changes.slice(0, 3).join(" · ")
          : result.message;

      setFixMessage(
        `Changes applied. Re-analyze to see your updated score. ${changeSummary}`
      );
      setFixDialogOpen(false);
      setPendingFixScope(null);
      setFixUserContext("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to apply fixes. Please try again."
      );
    } finally {
      setIsFixing(false);
      setFixScope(null);
    }
  };

  const handleConfirmFix = () => {
    if (!pendingFixScope) return;
    handleFixFromReview(pendingFixScope, fixUserContext);
  };

  if (!isOpen) return null;

  const resumeCategories = review
    ? Object.values(review.resumeReview.categories)
    : [];
  const coverLetterCategories = review?.coverLetterReview
    ? Object.values(review.coverLetterReview.categories)
    : [];

  return (
    <div className="fixed inset-0 z-100 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
        absolute inset-4 md:inset-8 lg:inset-12 rounded-3xl overflow-hidden shadow-2xl
        ${isDark ? "bg-gray-900" : "bg-white"}
        animate-scale-in
      `}
      >
        {/* Header */}
        <div
          className={`
          sticky top-0 z-10 px-6 py-4
          ${
            isDark
              ? "bg-gray-900/95 border-b border-gray-800"
              : "bg-white/95 border-b border-gray-200"
          }
          backdrop-blur-lg
        `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${
                  isDark
                    ? "bg-linear-to-br from-indigo-500 to-purple-600"
                    : "bg-linear-to-br from-indigo-400 to-purple-500"
                }
              `}
              >
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className={`text-2xl font-black ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    AI Application Review
                  </h2>
                  {session && session.reviewCount > 1 && (
                    <span
                      className={`
                        text-xs px-2 py-0.5 rounded-full font-medium
                        ${
                          isDark
                            ? "bg-indigo-500/20 text-indigo-300"
                            : "bg-indigo-100 text-indigo-700"
                        }
                      `}
                    >
                      Review #{session.reviewCount}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {review
                    ? `Reviewed for: ${review.jobTitle || "Job Position"}${
                        review.company ? ` at ${review.company}` : ""
                      }`
                    : "Analyzing your application materials..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {review && (
                <>
                  <button
                    onClick={() => openFixDialog("all")}
                    disabled={isFixing || isLoading || !onResumeModified}
                    className={`
                      relative px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                      ${isFixing || isLoading ? "opacity-60 cursor-wait" : ""}
                      ${
                        isDark
                          ? "bg-linear-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 hover:from-emerald-500/30 hover:to-teal-500/30"
                          : "bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-300 hover:from-emerald-100 hover:to-teal-100"
                      }
                    `}
                    title="Apply review feedback to your resume and cover letter"
                  >
                    {isFixing && fixScope === "all" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                        <span>Applying…</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Fix with AI</span>
                      </>
                    )}
                  </button>

                  {/* Re-analyze Button */}
                  <button
                    onClick={handleReview}
                    disabled={isLoading || isFixing}
                    className={`
                      px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2
                      ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      ${
                        isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                  >
                    <span className={isLoading ? "animate-spin" : ""}>🔄</span>
                    {isLoading
                      ? "Analyzing..."
                      : `Re-analyze${
                          session && session.reviewCount > 0
                            ? ` (#${session.reviewCount + 1})`
                            : ""
                        }`}
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all
                  ${
                    isDark
                      ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                      : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                ×
              </button>
            </div>
          </div>

          {/* Tabs - only show when we have results */}
          {review && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab("resume")}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    activeTab === "resume"
                      ? isDark
                        ? "bg-indigo-500 text-white"
                        : "bg-indigo-500 text-white"
                      : isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                📄 Resume Review
              </button>
              {review.coverLetterReview && (
                <button
                  onClick={() => setActiveTab("cover-letter")}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm transition-all
                    ${
                      activeTab === "cover-letter"
                        ? isDark
                          ? "bg-indigo-500 text-white"
                          : "bg-indigo-500 text-white"
                        : isDark
                        ? "text-gray-400 hover:text-white hover:bg-gray-800"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  ✉️ Cover Letter Review
                </button>
              )}
              <button
                onClick={() => setActiveTab("keywords")}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${
                    activeTab === "keywords"
                      ? isDark
                        ? "bg-indigo-500 text-white"
                        : "bg-indigo-500 text-white"
                      : isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                🔑 Keyword Analysis
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={`overflow-y-auto h-[calc(100%-120px)] p-6 custom-scrollbar ${
            isDark ? "scrollbar-dark" : "scrollbar-light"
          }`}
        >
          {isLoading ? (
            <LoadingAnimation
              isDark={isDark}
              isReAnalysis={session !== undefined && session.reviewCount > 0}
              reviewNumber={(session?.reviewCount || 0) + 1}
            />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div
                className={`
                w-20 h-20 rounded-full flex items-center justify-center mb-4
                ${isDark ? "bg-red-500/20" : "bg-red-100"}
              `}
              >
                <span className="text-4xl">❌</span>
              </div>
              <h3
                className={`text-xl font-bold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Review Failed
              </h3>
              <p
                className={`text-sm mb-4 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {error}
              </p>
              <button
                onClick={handleReview}
                className={`
                  px-6 py-2 rounded-lg font-medium transition-all
                  ${
                    isDark
                      ? "bg-indigo-500 text-white hover:bg-indigo-600"
                      : "bg-indigo-500 text-white hover:bg-indigo-600"
                  }
                `}
              >
                Try Again
              </button>
            </div>
          ) : review ? (
            <>
              {(fixMessage || (isFixing && fixScope)) && (
                <div
                  className={`
                    max-w-5xl mx-auto mb-6 px-4 py-3 rounded-xl border text-sm flex items-start gap-3
                    ${
                      fixMessage?.includes("applied")
                        ? isDark
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                          : "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : isDark
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }
                  `}
                >
                  <span className="text-lg shrink-0" aria-hidden="true">
                    {isFixing ? "⏳" : fixMessage?.includes("applied") ? "✅" : "💡"}
                  </span>
                  <div>
                    <p className="font-medium">
                      {isFixing
                        ? "Applying review fixes — your factual baseline is preserved…"
                        : fixMessage}
                    </p>
                    {fixMessage?.includes("applied") && !isFixing && (
                      <p
                        className={`mt-1 text-xs ${
                          isDark ? "text-emerald-300/80" : "text-emerald-700/80"
                        }`}
                      >
                        Your original facts are kept on file. Click Re-analyze to
                        score the updated resume.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* Resume Tab */}
              {activeTab === "resume" && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* Overall Score Section */}
                  <div
                    className={`
                    rounded-2xl p-8
                    ${
                      isDark
                        ? "bg-linear-to-br from-gray-800 to-gray-800/50 border border-gray-700/50"
                        : "bg-linear-to-br from-gray-50 to-white border border-gray-200"
                    }
                  `}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <RingProgress
                        score={review.resumeReview.overallScore}
                        level={review.resumeReview.overallLevel}
                        isDark={isDark}
                        size={160}
                        strokeWidth={12}
                      />
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                          <Badge
                            level={review.resumeReview.overallLevel}
                            text={getLevelLabel(
                              review.resumeReview.overallLevel
                            )}
                            isDark={isDark}
                          />
                          <InfoTooltip
                            text="Your overall resume score based on job alignment, impact statements, skills match, and more. Aim for 80+ to be competitive."
                            isDark={isDark}
                          />
                        </div>
                        <p
                          className={`text-lg ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {review.resumeReview.summary}
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-dashed border-gray-600/30">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-black ${
                            isDark ? "text-emerald-400" : "text-emerald-600"
                          }`}
                        >
                          {review.resumeReview.topStrengths.length}
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Key Strengths
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-3xl font-black ${
                            isDark ? "text-orange-400" : "text-orange-600"
                          }`}
                        >
                          {review.resumeReview.criticalIssues.length}
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Issues to Fix
                        </div>
                      </div>
                      <div className="text-center">
                        <div
                          className={`text-3xl font-black ${
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          }`}
                        >
                          {review.resumeReview.quickWins.length}
                        </div>
                        <div
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Quick Wins
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-emerald-50 border border-emerald-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-emerald-400" : "text-emerald-700"
                        }`}
                      >
                        <span>🌟</span> Top Strengths
                        <InfoTooltip
                          text="These are the strongest aspects of your resume that make you stand out for this role."
                          isDark={isDark}
                        />
                      </h3>
                      <ul className="space-y-2">
                        {review.resumeReview.topStrengths.map(
                          (strength, idx) => (
                            <li
                              key={idx}
                              className={`text-sm flex items-start gap-2 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              <span
                                className={`mt-0.5 ${
                                  isDark
                                    ? "text-emerald-500"
                                    : "text-emerald-600"
                                }`}
                              >
                                ✓
                              </span>
                              {strength}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Critical Issues */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-red-50 border border-red-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-red-400" : "text-red-700"
                        }`}
                      >
                        <span>🚨</span> Critical Issues
                        <InfoTooltip
                          text="These issues could significantly hurt your chances. Address them before applying."
                          isDark={isDark}
                        />
                      </h3>
                      <ul className="space-y-2">
                        {review.resumeReview.criticalIssues.length > 0 ? (
                          review.resumeReview.criticalIssues.map(
                            (issue, idx) => (
                              <li
                                key={idx}
                                className={`text-sm flex items-start gap-2 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                <span
                                  className={`mt-0.5 ${
                                    isDark ? "text-red-500" : "text-red-600"
                                  }`}
                                >
                                  !
                                </span>
                                {issue}
                              </li>
                            )
                          )
                        ) : (
                          <li
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            No critical issues found! 🎉
                          </li>
                        )}
                      </ul>
                      {/* Fix with AI button for critical issues */}
                      {review.resumeReview.criticalIssues.length > 0 && (
                        <button
                          onClick={() => openFixDialog("critical")}
                          disabled={isFixing || isLoading || !onResumeModified}
                          className={`
                            mt-4 w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2
                            ${isFixing || isLoading ? "opacity-60 cursor-wait" : ""}
                            ${
                              isDark
                                ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                                : "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
                            }
                          `}
                        >
                          {isFixing && fixScope === "critical" ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              <span>Fixing…</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>Fix All Issues</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Quick Wins */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-indigo-500/10 border border-indigo-500/20"
                          : "bg-indigo-50 border border-indigo-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-indigo-400" : "text-indigo-700"
                        }`}
                      >
                        <span>⚡</span> Quick Wins
                        <InfoTooltip
                          text="Easy improvements that can boost your score with minimal effort."
                          isDark={isDark}
                        />
                      </h3>
                      <ul className="space-y-2">
                        {review.resumeReview.quickWins.map((win, idx) => (
                          <li
                            key={idx}
                            className={`text-sm flex items-start gap-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <span
                              className={`mt-0.5 ${
                                isDark ? "text-indigo-500" : "text-indigo-600"
                              }`}
                            >
                              →
                            </span>
                            {win}
                          </li>
                        ))}
                      </ul>
                      {/* Apply Quick Wins button */}
                      {review.resumeReview.quickWins.length > 0 && (
                        <button
                          onClick={() => openFixDialog("quick_wins")}
                          disabled={isFixing || isLoading || !onResumeModified}
                          className={`
                            mt-4 w-full py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2
                            ${isFixing || isLoading ? "opacity-60 cursor-wait" : ""}
                            ${
                              isDark
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                                : "bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200"
                            }
                          `}
                        >
                          {isFixing && fixScope === "quick_wins" ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                              <span>Applying…</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>Apply Quick Wins</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Category Scores */}
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      📊 Detailed Category Breakdown
                      <InfoTooltip
                        text="Click on each category to see specific suggestions for improvement."
                        isDark={isDark}
                      />
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {resumeCategories.map((category, idx) => (
                        <CategoryScoreCard
                          key={category.title}
                          category={category}
                          isDark={isDark}
                          delay={idx * 50}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Section Reviews */}
                  {review.resumeReview.sectionReviews.length > 0 && (
                    <div>
                      <h3
                        className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        📋 Section-by-Section Review
                        <InfoTooltip
                          text="How each section of your resume performs individually."
                          isDark={isDark}
                        />
                      </h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {review.resumeReview.sectionReviews.map(
                          (section, idx) => (
                            <SectionReviewCard
                              key={section.sectionName}
                              section={section}
                              isDark={isDark}
                              delay={idx * 50}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cover Letter Tab */}
              {activeTab === "cover-letter" && review.coverLetterReview && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  {/* Overall Score Section */}
                  <div
                    className={`
                    rounded-2xl p-8
                    ${
                      isDark
                        ? "bg-linear-to-br from-gray-800 to-gray-800/50 border border-gray-700/50"
                        : "bg-linear-to-br from-gray-50 to-white border border-gray-200"
                    }
                  `}
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <RingProgress
                        score={review.coverLetterReview.overallScore}
                        level={review.coverLetterReview.overallLevel}
                        isDark={isDark}
                        size={160}
                        strokeWidth={12}
                      />
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                          <Badge
                            level={review.coverLetterReview.overallLevel}
                            text={getLevelLabel(
                              review.coverLetterReview.overallLevel
                            )}
                            isDark={isDark}
                          />
                        </div>
                        <p
                          className={`text-lg ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {review.coverLetterReview.summary}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Strengths */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-emerald-500/10 border border-emerald-500/20"
                          : "bg-emerald-50 border border-emerald-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-emerald-400" : "text-emerald-700"
                        }`}
                      >
                        <span>🌟</span> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {review.coverLetterReview.topStrengths.map(
                          (strength, idx) => (
                            <li
                              key={idx}
                              className={`text-sm flex items-start gap-2 ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              <span className="text-emerald-500">✓</span>
                              {strength}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    {/* Issues */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-red-500/10 border border-red-500/20"
                          : "bg-red-50 border border-red-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-red-400" : "text-red-700"
                        }`}
                      >
                        <span>🚨</span> Issues
                      </h3>
                      <ul className="space-y-2">
                        {review.coverLetterReview.criticalIssues.length > 0 ? (
                          review.coverLetterReview.criticalIssues.map(
                            (issue, idx) => (
                              <li
                                key={idx}
                                className={`text-sm flex items-start gap-2 ${
                                  isDark ? "text-gray-300" : "text-gray-700"
                                }`}
                              >
                                <span className="text-red-500">!</span>
                                {issue}
                              </li>
                            )
                          )
                        ) : (
                          <li
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            No issues found! 🎉
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Quick Wins */}
                    <div
                      className={`
                      rounded-xl p-5
                      ${
                        isDark
                          ? "bg-indigo-500/10 border border-indigo-500/20"
                          : "bg-indigo-50 border border-indigo-200"
                      }
                    `}
                    >
                      <h3
                        className={`font-bold mb-3 flex items-center gap-2 ${
                          isDark ? "text-indigo-400" : "text-indigo-700"
                        }`}
                      >
                        <span>⚡</span> Quick Wins
                      </h3>
                      <ul className="space-y-2">
                        {review.coverLetterReview.quickWins.map((win, idx) => (
                          <li
                            key={idx}
                            className={`text-sm flex items-start gap-2 ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            <span className="text-indigo-500">→</span>
                            {win}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Category Scores */}
                  <div>
                    <h3
                      className={`text-lg font-bold mb-4 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      📊 Category Breakdown
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {coverLetterCategories.map((category, idx) => (
                        <CategoryScoreCard
                          key={category.title}
                          category={category}
                          isDark={isDark}
                          delay={idx * 50}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Keywords Tab */}
              {activeTab === "keywords" && (
                <div className="space-y-8 max-w-4xl mx-auto">
                  {/* Keyword Match Rate */}
                  <div
                    className={`
                    rounded-2xl p-8 text-center
                    ${
                      isDark
                        ? "bg-linear-to-br from-gray-800 to-gray-800/50 border border-gray-700/50"
                        : "bg-linear-to-br from-gray-50 to-white border border-gray-200"
                    }
                  `}
                  >
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <h3
                        className={`text-xl font-bold ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Keyword Match Rate
                      </h3>
                      <InfoTooltip
                        text="Percentage of important job description keywords found in your resume. 75% of resumes are rejected by ATS due to missing keywords. Aim for 80%+ match rate."
                        isDark={isDark}
                      />
                    </div>
                    <RingProgress
                      score={review.resumeReview.keywordAnalysis.matchRate}
                      level={
                        review.resumeReview.keywordAnalysis.matchRate >= 80
                          ? "good"
                          : review.resumeReview.keywordAnalysis.matchRate >= 60
                          ? "fair"
                          : "needs_work"
                      }
                      isDark={isDark}
                      size={180}
                      strokeWidth={14}
                    />
                    <p
                      className={`mt-4 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {review.resumeReview.keywordAnalysis.matchRate >= 80
                        ? "🎉 Excellent! Your resume is well-optimized for ATS."
                        : review.resumeReview.keywordAnalysis.matchRate >= 60
                        ? "⚠️ Good start, but add more keywords from the job description."
                        : "🚨 Low match rate. Your resume may not pass ATS screening."}
                    </p>
                  </div>

                  {/* Matched Keywords */}
                  <div
                    className={`
                    rounded-xl p-6
                    ${
                      isDark
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : "bg-emerald-50 border border-emerald-200"
                    }
                  `}
                  >
                    <h3
                      className={`font-bold mb-4 flex items-center gap-2 ${
                        isDark ? "text-emerald-400" : "text-emerald-700"
                      }`}
                    >
                      <span>✓</span> Found Keywords (
                      {
                        review.resumeReview.keywordAnalysis.matchedKeywords
                          .length
                      }
                      )
                      <InfoTooltip
                        text="These keywords from the job description were found in your resume. They help your resume pass ATS filters."
                        isDark={isDark}
                      />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {review.resumeReview.keywordAnalysis.matchedKeywords.map(
                        (kw, idx) => (
                          <KeywordChip key={idx} keyword={kw} isDark={isDark} />
                        )
                      )}
                      {review.resumeReview.keywordAnalysis.matchedKeywords
                        .length === 0 && (
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No keyword analysis available.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div
                    className={`
                    rounded-xl p-6
                    ${
                      isDark
                        ? "bg-red-500/10 border border-red-500/20"
                        : "bg-red-50 border border-red-200"
                    }
                  `}
                  >
                    <h3
                      className={`font-bold mb-4 flex items-center gap-2 ${
                        isDark ? "text-red-400" : "text-red-700"
                      }`}
                    >
                      <span>✗</span> Missing Keywords (
                      {
                        review.resumeReview.keywordAnalysis.missingKeywords
                          .length
                      }
                      )
                      <InfoTooltip
                        text="These important keywords from the job description are missing from your resume. Consider adding them where relevant."
                        isDark={isDark}
                      />
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {review.resumeReview.keywordAnalysis.missingKeywords.map(
                        (kw, idx) => (
                          <KeywordChip key={idx} keyword={kw} isDark={isDark} />
                        )
                      )}
                      {review.resumeReview.keywordAnalysis.missingKeywords
                        .length === 0 && (
                        <p
                          className={`text-sm ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          All important keywords found! 🎉
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Legend */}
                  <div
                    className={`
                    rounded-xl p-4
                    ${
                      isDark
                        ? "bg-gray-800/50 border border-gray-700/50"
                        : "bg-gray-100 border border-gray-200"
                    }
                  `}
                  >
                    <h4
                      className={`font-semibold mb-3 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Understanding Keyword Importance
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isDark ? "bg-red-500" : "bg-red-400"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          <strong>Critical</strong> - Must have
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isDark ? "bg-orange-500" : "bg-orange-400"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          <strong>Important</strong> - Should have
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isDark ? "bg-yellow-500" : "bg-yellow-400"
                          }`}
                        />
                        <span
                          className={isDark ? "text-gray-300" : "text-gray-700"}
                        >
                          <strong>Nice to have</strong> - Bonus
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      <FixWithAIDialog
        isOpen={fixDialogOpen}
        scope={pendingFixScope}
        review={review}
        userContext={fixUserContext}
        onContextChange={setFixUserContext}
        onConfirm={handleConfirmFix}
        onClose={closeFixDialog}
        isApplying={isFixing}
        isDark={isDark}
      />

      {/* Animations & Custom Scrollbar */}
      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }

        /* Custom Scrollbar Styles */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-gutter: stable;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 10px;
          margin: 8px 0;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          border-radius: 10px;
          background-clip: padding-box;
          border: 2px solid transparent;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          border: 1px solid transparent;
        }

        /* Dark mode scrollbar */
        .scrollbar-dark {
          scrollbar-color: rgba(99, 102, 241, 0.5) transparent;
        }

        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.4) 0%,
            rgba(139, 92, 246, 0.4) 100%
          );
        }

        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.7) 0%,
            rgba(139, 92, 246, 0.7) 100%
          );
        }

        /* Light mode scrollbar */
        .scrollbar-light {
          scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
        }

        .scrollbar-light::-webkit-scrollbar-thumb {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.3) 0%,
            rgba(139, 92, 246, 0.3) 100%
          );
        }

        .scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            180deg,
            rgba(99, 102, 241, 0.5) 0%,
            rgba(139, 92, 246, 0.5) 100%
          );
        }
      `}</style>
    </div>
  );
}
