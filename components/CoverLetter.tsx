"use client";

interface CoverLetterProps {
  content: string;
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  jobInfo?: {
    company?: string;
    title?: string;
  };
  theme?: "dark" | "light";
}

export default function CoverLetter({
  content,
  personalInfo,
  jobInfo,
  theme = "dark",
}: CoverLetterProps) {
  const isDark = theme === "dark";
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Parse content to extract salutation and closing if present
  const lines = content.split("\n").filter((line) => line.trim());
  let salutation = "Dear Hiring Manager,";
  let closing = "Sincerely,";
  let mainContent = content;

  // Try to extract salutation
  const salutationMatch = content.match(/^(Dear\s+[^,\n]+(?:,|:))/i);
  if (salutationMatch) {
    salutation = salutationMatch[1];
    mainContent = content.replace(salutationMatch[0], "").trim();
  }

  // Try to extract closing
  const closingMatch = content.match(
    /(Sincerely|Best regards|Regards|Yours sincerely|Yours truly)[,\s]*$/i
  );
  if (closingMatch) {
    closing = closingMatch[1] + ",";
    mainContent = mainContent
      .replace(new RegExp(closingMatch[0] + ".*$", "i"), "")
      .trim();
  }

  // Split content into paragraphs
  const paragraphs = mainContent
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div
      className={`
        min-h-screen p-8 md:p-12 lg:p-16
        ${isDark ? "bg-[#0a0b0d] text-gray-100" : "bg-white text-gray-900"}
        transition-colors duration-300
      `}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className={`mb-8 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {personalInfo?.fullName && (
            <div
              className={`text-xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {personalInfo.fullName}
            </div>
          )}
          <div className="text-sm space-y-1">
            {personalInfo?.email && <div>{personalInfo.email}</div>}
            {personalInfo?.phone && <div>{personalInfo.phone}</div>}
            {personalInfo?.location && <div>{personalInfo.location}</div>}
          </div>
        </div>

        {/* Date */}
        <div
          className={`mb-6 text-sm ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {today}
        </div>

        {/* Recipient */}
        {jobInfo?.company && (
          <div className={`mb-6 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <div className="font-semibold">{jobInfo.company}</div>
            {jobInfo.title && (
              <div className="text-sm mt-1">{jobInfo.title} Position</div>
            )}
          </div>
        )}

        {/* Salutation */}
        <div
          className={`mb-4 font-medium ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {salutation}
        </div>

        {/* Content */}
        <div
          className={`space-y-4 mb-8 leading-relaxed ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, index) => (
              <p key={index} className="text-justify">
                {paragraph}
              </p>
            ))
          ) : (
            <div className="whitespace-pre-wrap">{content}</div>
          )}
        </div>

        {/* Closing */}
        <div
          className={`mt-8 space-y-2 ${
            isDark ? "text-gray-200" : "text-gray-800"
          }`}
        >
          <div>{closing}</div>
          {personalInfo?.fullName && (
            <div className="font-semibold mt-4">{personalInfo.fullName}</div>
          )}
        </div>
      </div>
    </div>
  );
}
