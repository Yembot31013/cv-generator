"use client";

import { useState, useEffect } from "react";

interface StickFigureLoaderProps {
  fileCount?: number;
  theme?: "dark" | "light";
}

// The epic saga of Steve the Stick Figure
const storyScenes = [
  {
    id: "reading",
    message: "Steve is reading your resume...",
    subMessage: "\"Wow, this person is impressive!\"",
    stickPose: "reading",
    icon: "📖",
  },
  {
    id: "thinking",
    message: "Steve is thinking REALLY hard...",
    subMessage: "Steam might come out of his head",
    stickPose: "thinking",
    icon: "🤔",
  },
  {
    id: "coffee",
    message: "We made this take a while on purpose...",
    subMessage: "So you could grab a coffee ☕",
    stickPose: "coffee",
    icon: "☕",
  },
  {
    id: "network_blame",
    message: "Actually... it's probably your network",
    subMessage: "Just kidding! (or are we? 👀)",
    stickPose: "shrug",
    icon: "📡",
  },
  {
    id: "juggling",
    message: "Steve is now juggling your data...",
    subMessage: "Don't worry, he only dropped it twice",
    stickPose: "juggling",
    icon: "🤹",
  },
  {
    id: "running",
    message: "Running to the AI servers...",
    subMessage: "Steve skipped leg day, this might take a bit",
    stickPose: "running",
    icon: "🏃",
  },
  {
    id: "phone",
    message: "Steve is on hold with Google AI...",
    subMessage: "🎵 Please hold, your resume is important to us 🎵",
    stickPose: "phone",
    icon: "📞",
  },
  {
    id: "nap",
    message: "Steve is taking a quick power nap...",
    subMessage: "Processing resumes is exhausting work!",
    stickPose: "sleeping",
    icon: "😴",
  },
  {
    id: "flex",
    message: "Just flexing your achievements...",
    subMessage: "Seriously, this resume is 💪",
    stickPose: "flex",
    icon: "💪",
  },
  {
    id: "dance",
    message: "Victory dance loading...",
    subMessage: "Almost done! Steve's celebrating early",
    stickPose: "dance",
    icon: "🕺",
  },
  {
    id: "technical",
    message: "Converting buzzwords to actual skills...",
    subMessage: "\"Synergy\" → \"Works with others\"",
    stickPose: "typing",
    icon: "⌨️",
  },
  {
    id: "magic",
    message: "Applying AI magic... ✨",
    subMessage: "No rabbits were harmed in this process",
    stickPose: "wizard",
    icon: "🪄",
  },
];

export default function StickFigureLoader({
  fileCount = 1,
  theme = "dark",
}: StickFigureLoaderProps) {
  const isDark = theme === "dark";
  const [currentScene, setCurrentScene] = useState(0);
  const [dots, setDots] = useState("");

  // Cycle through scenes
  useEffect(() => {
    const sceneInterval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % storyScenes.length);
    }, 4000);

    return () => clearInterval(sceneInterval);
  }, []);

  // Animate dots
  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  const scene = storyScenes[currentScene];

  return (
    <div className="py-8 flex flex-col items-center">
      {/* Stage / Theater Container */}
      <div
        className={`
          relative w-72 h-56 rounded-3xl mb-6 overflow-hidden
          ${isDark ? "bg-gradient-to-b from-gray-800 to-gray-900" : "bg-gradient-to-b from-blue-50 to-blue-100"}
          border-4 ${isDark ? "border-indigo-500/30" : "border-indigo-300"}
        `}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Floating particles */}
          <div className={`absolute w-2 h-2 rounded-full animate-float-1 ${isDark ? "bg-indigo-500/30" : "bg-indigo-300/50"}`} style={{ top: "20%", left: "10%" }} />
          <div className={`absolute w-3 h-3 rounded-full animate-float-2 ${isDark ? "bg-purple-500/30" : "bg-purple-300/50"}`} style={{ top: "60%", left: "80%" }} />
          <div className={`absolute w-2 h-2 rounded-full animate-float-3 ${isDark ? "bg-pink-500/30" : "bg-pink-300/50"}`} style={{ top: "40%", left: "50%" }} />
        </div>

        {/* Scene icon */}
        <div className="absolute top-3 right-3 text-3xl animate-bounce-slow">
          {scene.icon}
        </div>

        {/* Stick Figure SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <StickFigure pose={scene.stickPose} isDark={isDark} />
        </div>

        {/* Ground line */}
        <div className={`absolute bottom-8 left-8 right-8 h-1 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"}`} />
        
        {/* Speech bubble */}
        <div 
          className={`
            absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium
            ${isDark ? "bg-white/10 text-gray-300" : "bg-black/10 text-gray-700"}
            animate-pulse
          `}
        >
          {scene.stickPose === "coffee" ? "☕ sip sip" : 
           scene.stickPose === "sleeping" ? "💤 zzz..." : 
           scene.stickPose === "dance" ? "🎵 la la la" : 
           scene.stickPose === "phone" ? "🎵 hold music" : 
           "working hard!"}
        </div>
      </div>

      {/* Message */}
      <div className="text-center max-w-sm">
        <p 
          className={`text-lg font-bold mb-2 transition-all duration-500 ${isDark ? "text-white" : "text-gray-900"}`}
          key={scene.id + "-main"}
        >
          {scene.message}{dots}
        </p>
        <p 
          className={`text-sm transition-all duration-500 ${isDark ? "text-gray-400" : "text-gray-600"}`}
          key={scene.id + "-sub"}
        >
          {scene.subMessage}
        </p>
      </div>

      {/* Progress bar */}
      <div className={`mt-6 w-64 h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
        <div 
          className={`h-full rounded-full animate-progress-indeterminate ${isDark ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"}`}
        />
      </div>

      {/* Fun fact footer */}
      <p className={`mt-4 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        Processing {fileCount} file{fileCount > 1 ? "s" : ""} • Steve never gives up! 💪
      </p>
    </div>
  );
}

// Stick Figure Component with different poses
function StickFigure({ pose, isDark }: { pose: string; isDark: boolean }) {
  const strokeColor = isDark ? "#a5b4fc" : "#4f46e5";
  const strokeWidth = 3;

  const poses: { [key: string]: JSX.Element } = {
    reading: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-sway">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Eyes */}
        <circle cx="45" cy="22" r="2" fill={strokeColor} />
        <circle cx="55" cy="22" r="2" fill={strokeColor} />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms holding book */}
        <line x1="50" y1="55" x2="30" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="55" x2="70" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Book */}
        <rect x="30" y="65" width="40" height="25" rx="2" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        <line x1="50" y1="65" x2="50" y2="90" stroke={strokeColor} strokeWidth={strokeWidth - 1} />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    thinking: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-think">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Eyes looking up */}
        <circle cx="45" cy="20" r="2" fill={strokeColor} />
        <circle cx="55" cy="20" r="2" fill={strokeColor} />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arm on chin */}
        <line x1="50" y1="55" x2="35" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="35" y1="50" x2="42" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Other arm */}
        <line x1="50" y1="55" x2="75" y2="65" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Thought bubbles */}
        <circle cx="70" cy="10" r="5" stroke={strokeColor} strokeWidth={2} fill="none" className="animate-pulse" />
        <circle cx="80" cy="5" r="3" stroke={strokeColor} strokeWidth={2} fill="none" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    coffee: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-sip">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Happy closed eyes */}
        <path d="M42 22 Q45 25 48 22" stroke={strokeColor} strokeWidth={2} fill="none" />
        <path d="M52 22 Q55 25 58 22" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Smile */}
        <path d="M42 28 Q50 35 58 28" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms holding mug */}
        <line x1="50" y1="50" x2="35" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="35" y1="45" x2="40" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="65" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Coffee mug */}
        <rect x="32" y="30" width="15" height="12" rx="2" stroke={strokeColor} strokeWidth={2} fill="none" />
        <path d="M47 33 Q52 33 52 38 Q52 42 47 42" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Steam */}
        <path d="M35 25 Q33 20 36 15" stroke={strokeColor} strokeWidth={1.5} fill="none" className="animate-steam" />
        <path d="M40 25 Q38 18 42 12" stroke={strokeColor} strokeWidth={1.5} fill="none" className="animate-steam" style={{ animationDelay: "0.3s" }} />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    shrug: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-shrug">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Confused eyes */}
        <circle cx="45" cy="22" r="2" fill={strokeColor} />
        <circle cx="55" cy="22" r="2" fill={strokeColor} />
        {/* Confused mouth */}
        <path d="M45 32 Q50 30 55 32" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Shrugging arms */}
        <line x1="50" y1="50" x2="25" y2="40" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="25" y1="40" x2="20" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="75" y2="40" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="75" y1="40" x2="80" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Question marks */}
        <text x="15" y="30" fill={strokeColor} fontSize="12" className="animate-pulse">?</text>
        <text x="80" y="30" fill={strokeColor} fontSize="12" className="animate-pulse">?</text>
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    juggling: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-juggle-body">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Focused eyes */}
        <circle cx="45" cy="22" r="2" fill={strokeColor} />
        <circle cx="55" cy="22" r="2" fill={strokeColor} />
        {/* Open mouth */}
        <ellipse cx="50" cy="30" rx="4" ry="3" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms up */}
        <line x1="50" y1="50" x2="25" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="75" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Juggling balls */}
        <circle cx="20" cy="15" r="6" fill={strokeColor} className="animate-juggle-ball-1" />
        <circle cx="50" cy="5" r="6" fill={strokeColor} className="animate-juggle-ball-2" />
        <circle cx="80" cy="15" r="6" fill={strokeColor} className="animate-juggle-ball-3" />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    running: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-run">
        {/* Head */}
        <circle cx="55" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Determined eyes */}
        <line x1="50" y1="22" x2="53" y2="22" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        <line x1="57" y1="22" x2="60" y2="22" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        {/* Sweat drop */}
        <path d="M70 20 Q73 25 70 30" stroke={strokeColor} strokeWidth={1.5} fill="none" className="animate-drip" />
        {/* Body leaning forward */}
        <line x1="55" y1="40" x2="45" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Running arms */}
        <line x1="50" y1="50" x2="70" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="25" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Running legs */}
        <line x1="45" y1="75" x2="25" y2="100" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="45" y1="75" x2="65" y2="110" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Motion lines */}
        <line x1="10" y1="50" x2="25" y2="50" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" opacity="0.5" />
        <line x1="5" y1="60" x2="20" y2="60" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" opacity="0.5" />
        <line x1="10" y1="70" x2="25" y2="70" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
    phone: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-tap-foot">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Bored eyes */}
        <line x1="43" y1="22" x2="47" y2="22" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        <line x1="53" y1="22" x2="57" y2="22" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        {/* Bored mouth */}
        <line x1="45" y1="30" x2="55" y2="30" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arm holding phone */}
        <line x1="50" y1="50" x2="35" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="35" y1="45" x2="30" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Phone */}
        <rect x="25" y="22" width="8" height="14" rx="1" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Other arm on hip */}
        <line x1="50" y1="55" x2="70" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="70" y1="60" x2="65" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Musical notes */}
        <text x="15" y="18" fill={strokeColor} fontSize="10" className="animate-float-note">♪</text>
        <text x="8" y="30" fill={strokeColor} fontSize="10" className="animate-float-note" style={{ animationDelay: "0.5s" }}>♫</text>
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    sleeping: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-snore">
        {/* Head tilted */}
        <circle cx="50" cy="30" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Closed eyes (arcs) */}
        <path d="M42 28 Q45 25 48 28" stroke={strokeColor} strokeWidth={2} fill="none" />
        <path d="M52 28 Q55 25 58 28" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Sleeping mouth */}
        <ellipse cx="50" cy="35" rx="3" ry="2" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body slumped */}
        <line x1="50" y1="45" x2="50" y2="85" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms droopy */}
        <line x1="50" y1="55" x2="30" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="55" x2="70" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* ZZZ */}
        <text x="65" y="15" fill={strokeColor} fontSize="14" fontWeight="bold" className="animate-zzz">Z</text>
        <text x="72" y="8" fill={strokeColor} fontSize="10" className="animate-zzz" style={{ animationDelay: "0.3s" }}>Z</text>
        <text x="78" y="3" fill={strokeColor} fontSize="8" className="animate-zzz" style={{ animationDelay: "0.6s" }}>z</text>
        {/* Legs */}
        <line x1="50" y1="85" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="85" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    flex: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-flex">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Confident eyes */}
        <circle cx="45" cy="22" r="2" fill={strokeColor} />
        <circle cx="55" cy="22" r="2" fill={strokeColor} />
        {/* Big smile */}
        <path d="M42 28 Q50 38 58 28" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Flexing arms */}
        <line x1="50" y1="50" x2="30" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="30" y1="45" x2="25" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="70" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="70" y1="45" x2="75" y2="30" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Muscles */}
        <ellipse cx="25" cy="38" rx="4" ry="6" stroke={strokeColor} strokeWidth={2} fill="none" />
        <ellipse cx="75" cy="38" rx="4" ry="6" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Sparkles */}
        <text x="15" y="25" fill={strokeColor} fontSize="10">✨</text>
        <text x="80" y="25" fill={strokeColor} fontSize="10">✨</text>
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    dance: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-dance">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Happy eyes */}
        <path d="M42 22 Q45 19 48 22" stroke={strokeColor} strokeWidth={2} fill="none" />
        <path d="M52 22 Q55 19 58 22" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Big happy mouth */}
        <path d="M42 28 Q50 38 58 28" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Dancing arms */}
        <line x1="50" y1="50" x2="25" y2="35" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="50" x2="80" y2="45" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Dancing legs */}
        <line x1="50" y1="80" x2="30" y2="110" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="75" y2="100" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Music notes */}
        <text x="20" y="25" fill={strokeColor} fontSize="12" className="animate-float-note">♪</text>
        <text x="75" y="20" fill={strokeColor} fontSize="12" className="animate-float-note" style={{ animationDelay: "0.3s" }}>♫</text>
        <text x="85" y="35" fill={strokeColor} fontSize="10" className="animate-float-note" style={{ animationDelay: "0.6s" }}>♪</text>
      </svg>
    ),
    typing: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-type">
        {/* Head */}
        <circle cx="50" cy="25" r="15" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Focused eyes */}
        <circle cx="45" cy="22" r="2" fill={strokeColor} />
        <circle cx="55" cy="22" r="2" fill={strokeColor} />
        {/* Tongue out (concentration) */}
        <path d="M52 32 Q55 36 52 38" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="80" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms to keyboard */}
        <line x1="50" y1="55" x2="30" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="55" x2="70" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Keyboard */}
        <rect x="20" y="72" width="60" height="15" rx="2" stroke={strokeColor} strokeWidth={2} fill="none" />
        <line x1="30" y1="78" x2="33" y2="78" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" className="animate-key-1" />
        <line x1="40" y1="78" x2="43" y2="78" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" className="animate-key-2" />
        <line x1="50" y1="78" x2="53" y2="78" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" className="animate-key-3" />
        <line x1="60" y1="78" x2="63" y2="78" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" className="animate-key-1" style={{ animationDelay: "0.2s" }} />
        <line x1="70" y1="78" x2="73" y2="78" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" className="animate-key-2" style={{ animationDelay: "0.4s" }} />
        {/* Legs */}
        <line x1="50" y1="80" x2="35" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="80" x2="65" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    ),
    wizard: (
      <svg width="100" height="140" viewBox="0 0 100 140" className="animate-cast-spell">
        {/* Wizard hat */}
        <polygon points="50,0 35,30 65,30" stroke={strokeColor} strokeWidth={2} fill="none" />
        <ellipse cx="50" cy="30" rx="18" ry="5" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Star on hat */}
        <text x="46" y="20" fill={strokeColor} fontSize="8">★</text>
        {/* Head */}
        <circle cx="50" cy="42" r="12" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" />
        {/* Wizard eyes */}
        <circle cx="46" cy="40" r="2" fill={strokeColor} />
        <circle cx="54" cy="40" r="2" fill={strokeColor} />
        {/* Beard */}
        <path d="M42 48 Q50 65 58 48" stroke={strokeColor} strokeWidth={2} fill="none" />
        {/* Body */}
        <line x1="50" y1="54" x2="50" y2="90" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Arms with wand */}
        <line x1="50" y1="65" x2="25" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        <line x1="50" y1="65" x2="75" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" />
        {/* Wand */}
        <line x1="75" y1="50" x2="85" y2="40" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
        {/* Magic sparkles */}
        <text x="82" y="35" fill={strokeColor} fontSize="12" className="animate-sparkle">✨</text>
        <text x="88" y="45" fill={strokeColor} fontSize="8" className="animate-sparkle" style={{ animationDelay: "0.2s" }}>⭐</text>
        <text x="78" y="25" fill={strokeColor} fontSize="10" className="animate-sparkle" style={{ animationDelay: "0.4s" }}>✨</text>
        {/* Robe/legs */}
        <path d="M40 90 L35 115 L50 115 L65 115 L60 90" stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </svg>
    ),
  };

  return poses[pose] || poses.reading;
}

