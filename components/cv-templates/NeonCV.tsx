'use client';

import { CVTemplateProps } from '@/types/cv';

export default function NeonCV({ data, theme = 'dark' }: CVTemplateProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Neon Grid Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="neon-grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke={isDark ? '#00ffff' : '#06b6d4'}
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
            <filter id="neon-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#ff00ff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#ffff00', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#neon-grid)" />

          {/* Animated Neon Lines */}
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#00ffff" strokeWidth="2" opacity="0.3" className="animate-pulse" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#ff00ff" strokeWidth="2" opacity="0.3" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Glitch Header */}
        <div className="mb-12">
          <div
            className={`
              relative overflow-hidden rounded-none border-4 p-12
              ${isDark
                ? 'bg-black border-cyan-400'
                : 'bg-white border-cyan-600'
              }
            `}
            style={{
              boxShadow: isDark
                ? '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)'
                : '0 0 20px rgba(6, 182, 212, 0.2)'
            }}
          >
            {/* Corner Brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400" />

            <div className="flex items-start gap-8">
              {/* Neon Avatar */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-none blur-lg bg-gradient-to-br from-cyan-400 to-pink-500 opacity-50"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
                <div
                  className={`
                    relative w-32 h-32 border-4 border-cyan-400
                    ${isDark ? 'bg-gradient-to-br from-cyan-500 to-pink-500' : 'bg-gradient-to-br from-cyan-400 to-pink-400'}
                    flex items-center justify-center text-6xl font-bold
                  `}
                  style={{
                    boxShadow: isDark
                      ? '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.2)'
                      : '0 0 20px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  <span className="text-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                    {data.personalInfo.fullName.charAt(0)}
                  </span>
                </div>
              </div>

              <div className="flex-1">
                <h1
                  className={`
                    text-5xl font-black mb-2 tracking-wider uppercase
                    ${isDark ? 'text-cyan-400' : 'text-cyan-600'}
                  `}
                  style={{
                    textShadow: isDark
                      ? '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)'
                      : '0 0 10px rgba(6, 182, 212, 0.5)'
                  }}
                >
                  {data.personalInfo.fullName}
                </h1>
                <p
                  className={`text-2xl mb-4 font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}
                  style={{
                    textShadow: isDark
                      ? '0 0 15px rgba(255, 0, 255, 0.6)'
                      : '0 0 8px rgba(236, 72, 153, 0.4)'
                  }}
                >
                  {data.personalInfo.title}
                </p>
                <div
                  className={`
                    h-1 w-32 mb-4
                    ${isDark ? 'bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400' : 'bg-gradient-to-r from-cyan-600 via-pink-600 to-yellow-600'}
                  `}
                  style={{
                    boxShadow: isDark
                      ? '0 0 10px rgba(0, 255, 255, 0.6)'
                      : '0 0 5px rgba(6, 182, 212, 0.4)'
                  }}
                />
                <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {data.personalInfo.bio}
                </p>

                {/* Contact Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <NeonContactItem label="EMAIL" value={data.personalInfo.email} isDark={isDark} />
                  <NeonContactItem label="PHONE" value={data.personalInfo.phone} isDark={isDark} />
                  <NeonContactItem label="LOCATION" value={data.personalInfo.location} isDark={isDark} />
                  <NeonContactItem label="WEB" value={data.personalInfo.website} isDark={isDark} />
                </div>

                {/* Social Links */}
                <div className="flex gap-4">
                  {data.personalInfo.github && <NeonSocialLink platform="GITHUB" url={data.personalInfo.github} isDark={isDark} />}
                  {data.personalInfo.linkedin && <NeonSocialLink platform="LINKEDIN" url={data.personalInfo.linkedin} isDark={isDark} />}
                  {data.personalInfo.twitter && <NeonSocialLink platform="TWITTER" url={data.personalInfo.twitter} isDark={isDark} />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-8">
            {/* Skills */}
            <NeonSection title="SKILLS" isDark={isDark}>
              <div className="space-y-6">
                {data.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <div
                      className={`
                        text-xs font-bold mb-3 px-2 py-1 inline-block
                        ${isDark ? 'bg-cyan-400 text-black' : 'bg-cyan-600 text-white'}
                      `}
                      style={{
                        boxShadow: isDark ? '0 0 10px rgba(0, 255, 255, 0.5)' : 'none'
                      }}
                    >
                      {skillGroup.category.toUpperCase()}
                    </div>
                    <div className="space-y-2">
                      {skillGroup.items.map((skill, i) => (
                        <div
                          key={i}
                          className={`
                            px-3 py-2 border-l-4
                            ${isDark ? 'border-pink-400 bg-pink-400/10 text-gray-200' : 'border-pink-600 bg-pink-50 text-gray-800'}
                            hover:translate-x-1 transition-transform
                          `}
                        >
                          <span className="font-mono text-sm">{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </NeonSection>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <NeonSection title="LANGUAGES" isDark={isDark}>
                <div className="space-y-3">
                  {data.languages.map((lang, idx) => (
                    <div key={idx} className={`p-3 border-2 ${isDark ? 'border-yellow-400/30 bg-yellow-400/5' : 'border-yellow-600/30 bg-yellow-50'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{lang.name}</span>
                        <span
                          className={`text-xs px-2 py-1 ${isDark ? 'bg-yellow-400 text-black' : 'bg-yellow-600 text-white'}`}
                          style={{ boxShadow: isDark ? '0 0 8px rgba(255, 255, 0, 0.4)' : 'none' }}
                        >
                          {lang.proficiency.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </NeonSection>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <NeonSection title="CERTIFICATIONS" isDark={isDark}>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className={`
                        p-4 border-2
                        ${isDark ? 'border-cyan-400/30 bg-cyan-400/5' : 'border-cyan-600/30 bg-cyan-50'}
                      `}
                    >
                      <h4 className={`font-bold mb-1 text-sm ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                        {cert.name}
                      </h4>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{cert.issuer}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{cert.date}</p>
                    </div>
                  ))}
                </div>
              </NeonSection>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <NeonSection title="EXPERIENCE" isDark={isDark}>
              <div className="space-y-8">
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className={`${idx !== 0 ? 'pt-8 border-t-2 border-dashed' : ''} ${isDark ? 'border-cyan-400/20' : 'border-cyan-600/20'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4
                          className={`text-xl font-black uppercase ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}
                          style={{
                            textShadow: isDark ? '0 0 10px rgba(0, 255, 255, 0.4)' : 'none'
                          }}
                        >
                          {exp.position}
                        </h4>
                        <p className={`text-lg font-bold ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                          {exp.company}
                        </p>
                      </div>
                      <div
                        className={`
                          px-3 py-1 border-2 font-mono text-xs
                          ${isDark ? 'border-yellow-400 text-yellow-400' : 'border-yellow-600 text-yellow-700'}
                        `}
                        style={{
                          boxShadow: isDark ? '0 0 10px rgba(255, 255, 0, 0.3)' : 'none'
                        }}
                      >
                        {exp.startDate} - {exp.endDate}
                      </div>
                    </div>

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {exp.location}
                    </p>

                    <div className={`space-y-2 mb-4 pl-4 border-l-4 ${isDark ? 'border-pink-400' : 'border-pink-600'}`}>
                      {exp.description.map((desc, i) => (
                        <p key={i} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className={`${isDark ? 'text-cyan-400' : 'text-cyan-600'} mr-2`}>›</span>
                          {desc}
                        </p>
                      ))}
                    </div>

                    {exp.technologies && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className={`
                              text-xs px-2 py-1 font-mono border
                              ${isDark ? 'border-purple-400 text-purple-300 bg-purple-400/10' : 'border-purple-600 text-purple-700 bg-purple-50'}
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
            </NeonSection>

            {/* Projects */}
            <NeonSection title="FEATURED PROJECTS" isDark={isDark}>
              <div className="space-y-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className={`
                      p-6 border-4
                      ${isDark ? 'border-pink-400/30 bg-pink-400/5' : 'border-pink-600/30 bg-pink-50'}
                      hover:border-opacity-100 transition-all
                    `}
                  >
                    <h4
                      className={`text-xl font-black uppercase mb-2 ${isDark ? 'text-pink-400' : 'text-pink-700'}`}
                      style={{
                        textShadow: isDark ? '0 0 10px rgba(255, 0, 255, 0.4)' : 'none'
                      }}
                    >
                      {project.name}
                    </h4>
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {project.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {project.highlights.map((highlight, i) => (
                        <p key={i} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className={`${isDark ? 'text-yellow-400' : 'text-yellow-600'} mr-2`}>▸</span>
                          {highlight}
                        </p>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className={`
                            text-xs px-2 py-1 font-mono
                            ${isDark ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/50' : 'bg-cyan-100 text-cyan-700 border border-cyan-300'}
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
                              text-sm font-bold px-3 py-1 border-2
                              ${isDark ? 'border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black' : 'border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white'}
                              transition-colors
                            `}
                          >
                            LIVE
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            className={`
                              text-sm font-bold px-3 py-1 border-2
                              ${isDark ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black' : 'border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'}
                              transition-colors
                            `}
                          >
                            CODE
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </NeonSection>

            {/* Education */}
            <NeonSection title="EDUCATION" isDark={isDark}>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div
                    key={edu.id}
                    className={`
                      p-6 border-l-8
                      ${isDark ? 'border-yellow-400 bg-yellow-400/5' : 'border-yellow-600 bg-yellow-50'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`text-xl font-black uppercase ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                          {edu.degree}
                        </h4>
                        <p className={`text-lg font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-700'}`}>
                          {edu.institution}
                        </p>
                      </div>
                      <span
                        className={`
                          text-xs px-2 py-1 font-mono border
                          ${isDark ? 'border-pink-400 text-pink-400' : 'border-pink-600 text-pink-700'}
                        `}
                      >
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>

                    <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{edu.field}</p>

                    {edu.gpa && (
                      <p className={`text-sm mb-3 font-mono ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        GPA: {edu.gpa}
                      </p>
                    )}

                    {edu.achievements && (
                      <div className="space-y-1">
                        {edu.achievements.map((achievement, i) => (
                          <p key={i} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className={`${isDark ? 'text-pink-400' : 'text-pink-600'} mr-2`}>✓</span>
                            {achievement}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </NeonSection>
          </div>
        </div>
      </div>
    </div>
  );
}

function NeonSection({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className={`
        relative border-4 p-6
        ${isDark ? 'bg-black border-cyan-400' : 'bg-white border-cyan-600'}
      `}
      style={{
        boxShadow: isDark
          ? '0 0 20px rgba(0, 255, 255, 0.2)'
          : '0 4px 15px rgba(6, 182, 212, 0.1)'
      }}
    >
      <h3
        className={`
          text-2xl font-black mb-6 uppercase tracking-wider
          ${isDark ? 'text-cyan-400' : 'text-cyan-700'}
        `}
        style={{
          textShadow: isDark ? '0 0 15px rgba(0, 255, 255, 0.6)' : 'none'
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function NeonContactItem({ label, value, isDark }: { label: string; value?: string; isDark: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div
        className={`text-xs font-bold mb-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}
        style={{ textShadow: isDark ? '0 0 5px rgba(0, 255, 255, 0.5)' : 'none' }}
      >
        {label}
      </div>
      <div className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{value}</div>
    </div>
  );
}

function NeonSocialLink({ platform, url, isDark }: { platform: string; url: string; isDark: boolean }) {
  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        px-3 py-1 border-2 text-xs font-bold uppercase
        ${isDark
          ? 'border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-black'
          : 'border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'
        }
        transition-all
      `}
      style={{
        boxShadow: isDark ? '0 0 10px rgba(255, 0, 255, 0.3)' : 'none'
      }}
    >
      {platform}
    </a>
  );
}
