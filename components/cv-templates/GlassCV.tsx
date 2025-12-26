"use client";

import { CVTemplateProps } from "@/types/cv";

export default function GlassCV({ data, theme = "dark" }: CVTemplateProps) {
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen ${isDark ? "bg-black" : "bg-gray-50"}`}>
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-20 w-96 h-96 bg-indigo-500 rounded-full ${
            isDark ? "opacity-20" : "opacity-10"
          } blur-3xl animate-float`}
        />
        <div
          className={`absolute bottom-20 right-20 w-96 h-96 bg-pink-500 rounded-full ${
            isDark ? "opacity-20" : "opacity-10"
          } blur-3xl animate-float-delayed`}
        />
        <div
          className={`absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500 rounded-full ${
            isDark ? "opacity-20" : "opacity-10"
          } blur-3xl animate-pulse`}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Glassmorphic Header */}
        <div className="mb-12">
          <div
            className={`
              relative overflow-hidden rounded-3xl p-12
              ${
                isDark
                  ? "bg-white/10 backdrop-blur-2xl border border-white/20"
                  : "bg-white/70 backdrop-blur-2xl border border-white/40"
              }
              shadow-2xl
            `}
          >
            <div className="flex items-start gap-8">
              {/* Glass Avatar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-pink-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />
                <div
                  className={`
                    relative w-40 h-40 rounded-3xl overflow-hidden
                    ${
                      isDark
                        ? "bg-white/10 backdrop-blur-xl"
                        : "bg-white/50 backdrop-blur-xl"
                    }
                    border-4 border-white/30
                    flex items-center justify-center
                    shadow-2xl transform group-hover:scale-105 transition-transform
                  `}
                >
                  <div
                    className={`text-7xl font-bold bg-clip-text text-transparent ${
                      isDark
                        ? "bg-gradient-to-br from-indigo-400 to-pink-400"
                        : "bg-gradient-to-br from-indigo-600 to-pink-600"
                    }`}
                  >
                    {data.personalInfo.fullName.charAt(0)}
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="flex-1">
                <h1
                  className={`
                  text-6xl font-black mb-3 bg-clip-text text-transparent
                  ${
                    isDark
                      ? "bg-gradient-to-r from-white via-indigo-200 to-pink-200"
                      : "bg-gradient-to-r from-gray-900 via-indigo-800 to-pink-800"
                  }
                `}
                >
                  {data.personalInfo.fullName}
                </h1>
                <p
                  className={`text-2xl mb-4 font-bold ${
                    isDark ? "text-indigo-300" : "text-indigo-700"
                  }`}
                >
                  {data.personalInfo.title}
                </p>
                <p
                  className={`text-lg leading-relaxed mb-6 ${
                    isDark ? "text-white/90" : "text-gray-800"
                  }`}
                >
                  {data.personalInfo.bio}
                </p>

                {/* Glass Contact Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <GlassContactItem
                    icon="✉️"
                    label="Email"
                    text={data.personalInfo.email}
                    isDark={isDark}
                  />
                  <GlassContactItem
                    icon="📱"
                    label="Phone"
                    text={data.personalInfo.phone}
                    isDark={isDark}
                  />
                  <GlassContactItem
                    icon="📍"
                    label="Location"
                    text={data.personalInfo.location}
                    isDark={isDark}
                  />
                  <GlassContactItem
                    icon="🌐"
                    label="Website"
                    text={data.personalInfo.website}
                    isDark={isDark}
                  />
                </div>

                {/* Glass Social Badges */}
                <div className="flex gap-3">
                  {data.personalInfo.github && (
                    <GlassSocialBadge
                      icon="💻"
                      platform="GitHub"
                      url={data.personalInfo.github}
                      isDark={isDark}
                    />
                  )}
                  {data.personalInfo.linkedin && (
                    <GlassSocialBadge
                      icon="💼"
                      platform="LinkedIn"
                      url={data.personalInfo.linkedin}
                      isDark={isDark}
                    />
                  )}
                  {data.personalInfo.twitter && (
                    <GlassSocialBadge
                      icon="🐦"
                      platform="Twitter"
                      url={data.personalInfo.twitter}
                      isDark={isDark}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Skills */}
            <GlassSection title="Skills" icon="⚡" isDark={isDark}>
              <div className="space-y-6">
                {data.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h4
                      className={`text-sm font-bold mb-3 uppercase tracking-wider ${
                        isDark ? "text-indigo-300" : "text-indigo-700"
                      }`}
                    >
                      {skillGroup.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, i) => (
                        <span
                          key={i}
                          className={`
                            px-3 py-1.5 rounded-full text-sm font-medium
                            ${
                              isDark
                                ? "bg-white/10 text-white/90 backdrop-blur-xl border border-white/20"
                                : "bg-gray-100 text-gray-800 backdrop-blur-xl border border-gray-300"
                            }
                            hover:scale-105 transition-all cursor-default
                            shadow-lg
                          `}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassSection>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <GlassSection title="Languages" icon="🌍" isDark={isDark}>
                <div className="space-y-3">
                  {data.languages.map((lang, idx) => (
                    <div
                      key={idx}
                      className={`
                        p-4 rounded-xl
                        ${
                          isDark
                            ? "bg-white/5 backdrop-blur-xl"
                            : "bg-white/60 backdrop-blur-xl"
                        }
                        border ${
                          isDark ? "border-white/10" : "border-gray-200/50"
                        }
                        hover:scale-105 transition-transform
                      `}
                    >
                      <div className="flex justify-between items-center">
                        <span
                          className={`font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {lang.name}
                        </span>
                        <span
                          className={`
                            text-xs px-3 py-1 rounded-full
                            ${
                              isDark
                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            }
                          `}
                        >
                          {lang.proficiency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassSection>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <GlassSection title="Certifications" icon="🏆" isDark={isDark}>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className={`
                        p-4 rounded-xl
                        ${
                          isDark
                            ? "bg-white/5 backdrop-blur-xl"
                            : "bg-white/60 backdrop-blur-xl"
                        }
                        border ${
                          isDark ? "border-white/10" : "border-gray-200/50"
                        }
                        hover:scale-105 transition-transform
                      `}
                    >
                      <h4
                        className={`font-bold mb-1 text-sm ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {cert.name}
                      </h4>
                      <p
                        className={`text-xs ${
                          isDark ? "text-white/70" : "text-gray-700"
                        }`}
                      >
                        {cert.issuer}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          isDark ? "text-indigo-300" : "text-indigo-700"
                        }`}
                      >
                        {cert.date}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassSection>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <GlassSection title="Experience" icon="💼" isDark={isDark}>
              <div className="space-y-8">
                {data.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className={`
                      relative p-6 rounded-2xl
                      ${
                        isDark
                          ? "bg-white/5 backdrop-blur-xl"
                          : "bg-white/60 backdrop-blur-xl"
                      }
                      border ${
                        isDark ? "border-white/10" : "border-gray-200/50"
                      }
                      hover:scale-[1.02] transition-transform
                      ${idx !== 0 ? "mt-6" : ""}
                    `}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4
                          className={`text-xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {exp.position}
                        </h4>
                        <p
                          className={`text-lg font-semibold ${
                            isDark ? "text-indigo-300" : "text-indigo-700"
                          }`}
                        >
                          {exp.company}
                        </p>
                      </div>
                      <span
                        className={`
                          text-sm px-4 py-2 rounded-full font-medium
                          ${
                            isDark
                              ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                              : "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                          }
                          shadow-lg
                        `}
                      >
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>

                    <p
                      className={`text-sm mb-4 ${
                        isDark ? "text-white/70" : "text-gray-700"
                      }`}
                    >
                      📍 {exp.location}
                    </p>

                    <ul
                      className={`space-y-2 mb-4 ${
                        isDark ? "text-white/90" : "text-gray-800"
                      }`}
                    >
                      {exp.description.map((desc, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className={`mt-1 ${
                              isDark ? "text-indigo-400" : "text-indigo-600"
                            }`}
                          >
                            ◆
                          </span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>

                    {exp.technologies && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className={`
                              text-xs px-3 py-1 rounded-full
                              ${
                                isDark
                                  ? "bg-white/10 text-white/80 border border-white/20"
                                  : "bg-white/60 text-gray-800 border border-white/40"
                              }
                            `}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassSection>

            {/* Projects */}
            <GlassSection title="Featured Projects" icon="🚀" isDark={isDark}>
              <div className="grid gap-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className={`
                      p-6 rounded-2xl
                      ${
                        isDark
                          ? "bg-white/5 backdrop-blur-xl"
                          : "bg-white/60 backdrop-blur-xl"
                      }
                      border ${
                        isDark ? "border-white/10" : "border-gray-200/50"
                      }
                      hover:scale-[1.02] transition-transform
                      shadow-xl
                    `}
                  >
                    <h4
                      className={`text-xl font-bold mb-2 ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {project.name}
                    </h4>
                    <p
                      className={`mb-4 ${
                        isDark ? "text-white/80" : "text-gray-800"
                      }`}
                    >
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {project.highlights.map((highlight, i) => (
                        <p
                          key={i}
                          className={`text-sm flex gap-2 ${
                            isDark ? "text-white/70" : "text-gray-700"
                          }`}
                        >
                          <span
                            className={`${
                              isDark ? "text-pink-400" : "text-pink-600"
                            }`}
                          >
                            ✦
                          </span>
                          {highlight}
                        </p>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className={`
                            text-xs px-3 py-1 rounded-full
                            ${
                              isDark
                                ? "bg-white/10 text-white/80 border border-white/20"
                                : "bg-gray-100 text-gray-800 border border-gray-300"
                            }
                          `}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {(project.link || project.github) && (
                      <div className="flex gap-3">
                        {project.link && (
                          <a
                            href={project.link}
                            className={`
                              text-sm font-semibold px-4 py-2 rounded-full
                              ${
                                isDark
                                  ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
                                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                              }
                              shadow-lg transition-all
                            `}
                          >
                            🔗 Live Demo
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            className={`
                              text-sm font-semibold px-4 py-2 rounded-full
                              ${
                                isDark
                                  ? "bg-white/10 text-white border border-white/30 hover:bg-white/20"
                                  : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
                              }
                              transition-all
                            `}
                          >
                            💻 Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </GlassSection>

            {/* Education */}
            <GlassSection title="Education" icon="🎓" isDark={isDark}>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`
                      p-6 rounded-2xl
                      ${
                        isDark
                          ? "bg-white/5 backdrop-blur-xl"
                          : "bg-white/60 backdrop-blur-xl"
                      }
                      border ${
                        isDark ? "border-white/10" : "border-gray-200/50"
                      }
                      hover:scale-[1.02] transition-transform
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4
                          className={`text-xl font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {edu.degree}
                        </h4>
                        <p
                          className={`text-lg font-semibold ${
                            isDark ? "text-purple-300" : "text-purple-700"
                          }`}
                        >
                          {edu.institution}
                        </p>
                      </div>
                      <span
                        className={`
                          text-sm px-4 py-2 rounded-full font-medium
                          ${
                            isDark
                              ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white"
                              : "bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
                          }
                          shadow-lg
                        `}
                      >
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>

                    <p
                      className={`mb-2 ${
                        isDark ? "text-white/80" : "text-gray-800"
                      }`}
                    >
                      {edu.field}
                    </p>

                    {edu.gpa && (
                      <p
                        className={`text-sm mb-3 ${
                          isDark ? "text-indigo-300" : "text-indigo-700"
                        }`}
                      >
                        GPA: {edu.gpa}
                      </p>
                    )}

                    {edu.achievements && (
                      <ul
                        className={`space-y-1 ${
                          isDark ? "text-white/70" : "text-gray-700"
                        }`}
                      >
                        {edu.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span
                              className={`${
                                isDark ? "text-purple-400" : "text-purple-600"
                              }`}
                            >
                              ▹
                            </span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </GlassSection>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-20px, -20px) scale(1.1);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(20px, 20px) scale(1.1);
          }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function GlassSection({
  title,
  icon,
  children,
  isDark,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className={`
        relative rounded-3xl p-6
              ${
                isDark
                  ? "bg-white/10 backdrop-blur-2xl border border-white/20"
                  : "bg-white/80 backdrop-blur-2xl border border-gray-200/50"
              }
        shadow-2xl
      `}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">{icon}</span>
        <h3
          className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function GlassContactItem({
  icon,
  label,
  text,
  isDark,
}: {
  icon: string;
  label: string;
  text?: string;
  isDark: boolean;
}) {
  if (!text) return null;
  return (
    <div
      className={`
        p-3 rounded-xl
        ${
          isDark
            ? "bg-white/5 backdrop-blur-xl"
            : "bg-white/60 backdrop-blur-xl"
        }
        border ${isDark ? "border-white/10" : "border-gray-200/50"}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span
          className={`text-xs uppercase font-bold tracking-wider ${
            isDark ? "text-white/60" : "text-gray-600"
          }`}
        >
          {label}
        </span>
      </div>
      <span className={`text-sm ${isDark ? "text-white/90" : "text-gray-900"}`}>
        {text}
      </span>
    </div>
  );
}

function GlassSocialBadge({
  icon,
  platform,
  url,
  isDark,
}: {
  icon: string;
  platform: string;
  url: string;
  isDark: boolean;
}) {
  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2
        ${
          isDark
            ? "bg-white/10 text-white/90 backdrop-blur-xl border border-white/20 hover:bg-white/20"
            : "bg-gray-100 text-gray-800 backdrop-blur-xl border border-gray-300 hover:bg-gray-200"
        }
        transition-all hover:scale-105 shadow-lg
      `}
    >
      <span>{icon}</span>
      <span>{platform}</span>
    </a>
  );
}
