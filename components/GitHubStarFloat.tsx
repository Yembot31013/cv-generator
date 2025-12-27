"use client";

import { useState, useEffect } from "react";

interface GitHubStarFloatProps {
  theme?: "dark" | "light";
}

const funMessages = [
  {
    emoji: "⭐",
    text: "Psst... stars fuel my caffeine addiction",
    subtext: "Help a dev out?",
  },
  {
    emoji: "🌟",
    text: "This CV is looking stellar!",
    subtext: "Know what else could be stellar? Our GitHub stars",
  },
  {
    emoji: "✨",
    text: "Free & open source",
    subtext: "A star would make our day (and cost you nothing)",
  },
  {
    emoji: "🚀",
    text: "You're building an amazing CV!",
    subtext: "Maybe drop us a star on your way out?",
  },
  {
    emoji: "💜",
    text: "Made with love",
    subtext: "Stars = love. It's simple math, really",
  },
  {
    emoji: "🎯",
    text: "Hit that star button",
    subtext: "It's like a high-five, but for code",
  },
  {
    emoji: "☕",
    text: "Stars > Coffee",
    subtext: "Okay that's a lie, but stars are still nice",
  },
  {
    emoji: "🔥",
    text: "Your CV is fire!",
    subtext: "Our repo could use some heat too ⭐",
  },
];

export default function GitHubStarFloat({
  theme = "dark",
}: GitHubStarFloatProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [message, setMessage] = useState(funMessages[0]);
  const [isHovered, setIsHovered] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    // Check if user has already dismissed or starred
    const dismissed = localStorage.getItem("github-star-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Pick a random message
    setMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);

    // Show after 30 seconds of using the app
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Secret keyboard shortcut: Ctrl+Shift+G to reset and show (for demos)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "G") {
        e.preventDefault();
        localStorage.removeItem("github-star-dismissed");
        setIsDismissed(false);
        setMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);
        setIsVisible(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Remember for 7 days
    localStorage.setItem("github-star-dismissed", Date.now().toString());
  };

  const handleStar = () => {
    window.open("https://github.com/Yembot31013/cv-generator", "_blank");
    handleDismiss();
  };

  const handleMaybeLater = () => {
    setIsVisible(false);
    // Show again after 5 minutes
    setTimeout(() => {
      if (!isDismissed) {
        setMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);
        setIsVisible(true);
      }
    }, 300000);
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50 max-w-sm
        transform transition-all duration-500 ease-out
        ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`
          relative rounded-2xl p-5 shadow-2xl backdrop-blur-xl
          border transition-all duration-300
          ${
            isDark
              ? "bg-gray-900/95 border-gray-700/50"
              : "bg-white/95 border-gray-200"
          }
          ${isHovered ? "scale-[1.02] shadow-3xl" : ""}
        `}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-2xl opacity-50 blur-xl -z-10 ${
            isDark
              ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20"
              : "bg-gradient-to-r from-yellow-400/30 to-orange-400/30"
          }`}
        />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className={`
            absolute -top-2 -right-2 w-6 h-6 rounded-full
            flex items-center justify-center text-xs font-bold
            transition-all hover:scale-110
            ${
              isDark
                ? "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
                : "bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-300"
            }
          `}
          title="Dismiss forever"
        >
          ✕
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div
            className={`
            text-4xl animate-bounce
            ${isHovered ? "animate-spin" : "animate-bounce"}
          `}
            style={{ animationDuration: isHovered ? "1s" : "2s" }}
          >
            {message.emoji}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <p
                className={`font-bold text-base ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {message.text}
              </p>
              <p
                className={`text-sm mt-1 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {message.subtext}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStar}
                className={`
                  flex-1 px-4 py-2 rounded-lg font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition-all transform hover:scale-105
                  bg-gradient-to-r from-yellow-500 to-orange-500
                  text-white shadow-lg hover:shadow-yellow-500/25
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Star on GitHub
              </button>

              <button
                onClick={handleMaybeLater}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium
                  transition-all
                  ${
                    isDark
                      ? "text-gray-400 hover:text-white hover:bg-gray-800"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                Later
              </button>
            </div>

            <p
              className={`text-xs ${
                isDark ? "text-gray-600" : "text-gray-400"
              }`}
            >
              100% open source • Your API keys stay local • Forever free
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
