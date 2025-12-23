'use client';

import { CVTemplateProps } from '@/types/cv';

export default function CyberCV({ data, theme = 'dark' }: CVTemplateProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0b0d]' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Animated 3D Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke={isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'}
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.8 }} />
              <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }} />
            </linearGradient>
            <filter id="glow-filter">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="animate-pulse" style={{ animationDuration: '4s' }} />

          {/* Floating 3D Orbs */}
          <circle
            cx="15%"
            cy="20%"
            r="150"
            fill="url(#glow)"
            opacity="0.15"
            className="animate-float"
            filter="url(#glow-filter)"
          />
          <circle
            cx="85%"
            cy="70%"
            r="120"
            fill="url(#glow)"
            opacity="0.12"
            className="animate-float-delayed"
            filter="url(#glow-filter)"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-12">
        {/* Header Section with 3D Card Effect */}
        <div className="relative mb-12">
          <div className={`
            relative overflow-hidden rounded-3xl p-12
            ${isDark
              ? 'bg-gradient-to-br from-[#1a1b26] via-[#16171f] to-[#1a1b26] border border-indigo-500/20'
              : 'bg-white border border-indigo-200 shadow-xl'
            }
            transform-gpu transition-all duration-300
          `}
          style={{
            boxShadow: isDark
              ? '0 0 80px rgba(99, 102, 241, 0.15), inset 0 0 40px rgba(99, 102, 241, 0.05)'
              : '0 20px 60px rgba(99, 102, 241, 0.1)'
          }}>
            {/* Decorative Corner Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill={isDark ? '#6366f1' : '#a5b4fc'}
                  d="M43.3,-76.7C54.9,-68.5,62.3,-54.5,70.8,-40.1C79.3,-25.7,88.9,-10.9,90.3,4.7C91.7,20.3,84.9,36.7,74.8,49.8C64.7,62.9,51.3,72.7,36.8,78.1C22.3,83.5,6.7,84.5,-9.2,82.9C-25.1,81.3,-41.3,77.1,-54.8,68.4C-68.3,59.7,-79.1,46.5,-84.5,31.3C-89.9,16.1,-89.9,-1.1,-84.7,-16.9C-79.5,-32.7,-69.1,-47.1,-55.3,-54.5C-41.5,-61.9,-24.3,-62.3,-8.7,-58.9C6.9,-55.5,31.7,-84.9,43.3,-76.7Z"
                  transform="translate(100 100)"
                  className="animate-morph"
                />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-8">
                {/* Avatar with 3D Effect */}
                <div className="relative group">
                  <div className={`
                    absolute inset-0 rounded-2xl blur-xl
                    ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}
                    opacity-50 group-hover:opacity-75 transition-opacity
                  `} />
                  <div className={`
                    relative w-32 h-32 rounded-2xl overflow-hidden
                    ${isDark ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}
                    flex items-center justify-center text-6xl font-bold text-white
                    transform-gpu group-hover:scale-105 transition-transform
                  `}>
                    {data.personalInfo.fullName.charAt(0)}
                  </div>
                </div>

                {/* Personal Info */}
                <div className="flex-1">
                  <h1 className={`
                    text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r
                    ${isDark
                      ? 'from-indigo-400 via-purple-400 to-pink-400'
                      : 'from-indigo-600 via-purple-600 to-pink-600'
                    }
                  `}>
                    {data.personalInfo.fullName}
                  </h1>
                  <p className={`text-2xl mb-4 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                    {data.personalInfo.title}
                  </p>
                  <p className={`text-lg leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {data.personalInfo.bio}
                  </p>

                  {/* Contact Info with Icons */}
                  <div className="grid grid-cols-2 gap-3">
                    <ContactItem icon="📧" text={data.personalInfo.email} isDark={isDark} />
                    <ContactItem icon="📱" text={data.personalInfo.phone} isDark={isDark} />
                    <ContactItem icon="📍" text={data.personalInfo.location} isDark={isDark} />
                    <ContactItem icon="🌐" text={data.personalInfo.website} isDark={isDark} />
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-3 mt-6">
                    {data.personalInfo.github && <SocialBadge icon="GitHub" url={data.personalInfo.github} isDark={isDark} />}
                    {data.personalInfo.linkedin && <SocialBadge icon="LinkedIn" url={data.personalInfo.linkedin} isDark={isDark} />}
                    {data.personalInfo.twitter && <SocialBadge icon="Twitter" url={data.personalInfo.twitter} isDark={isDark} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Languages */}
          <div className="space-y-8">
            {/* Skills Section */}
            <Section3D title="Skills" isDark={isDark}>
              <div className="space-y-6">
                {data.skills.map((skillGroup, idx) => (
                  <div key={idx}>
                    <h4 className={`text-sm font-bold mb-3 uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                      {skillGroup.category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((skill, i) => (
                        <span
                          key={i}
                          className={`
                            px-3 py-1.5 rounded-lg text-sm font-medium
                            ${isDark
                              ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }
                            hover:scale-105 transition-transform cursor-default
                          `}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section3D>

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <Section3D title="Languages" isDark={isDark}>
                <div className="space-y-3">
                  {data.languages.map((lang, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{lang.name}</span>
                      <span className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </Section3D>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <Section3D title="Certifications" isDark={isDark}>
                <div className="space-y-4">
                  {data.certifications.map((cert, index) => (
                    <div key={cert.id || `cert-${index}`} className={`p-4 rounded-xl ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-50'}`}>
                      <h4 className={`font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        {cert.name}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {cert.issuer}
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {cert.date}
                      </p>
                    </div>
                  ))}
                </div>
              </Section3D>
            )}
          </div>

          {/* Right Column - Experience, Education, Projects */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <Section3D title="Experience" isDark={isDark}>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-8 pb-8 border-l-2 border-indigo-500/30 last:pb-0">
                    <div className={`
                      absolute -left-2 top-0 w-4 h-4 rounded-full
                      ${isDark ? 'bg-indigo-500' : 'bg-indigo-600'}
                      shadow-lg shadow-indigo-500/50
                    `} />

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {exp.position}
                        </h4>
                        <p className={`text-lg ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          {exp.company}
                        </p>
                      </div>
                      <span className={`
                        text-sm px-3 py-1 rounded-full
                        ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}
                      `}>
                        {exp.startDate} - {exp.endDate}
                      </span>
                    </div>

                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      📍 {exp.location}
                    </p>

                    <ul className={`space-y-2 mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {exp.description.map((desc, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-indigo-500 mt-1.5">▹</span>
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
                              text-xs px-2 py-1 rounded
                              ${isDark ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700'}
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
            </Section3D>

            {/* Projects */}
            <Section3D title="Featured Projects" isDark={isDark}>
              <div className="grid gap-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className={`
                      p-6 rounded-xl
                      ${isDark
                        ? 'bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/20'
                        : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200'
                      }
                      hover:scale-[1.02] transition-transform
                    `}
                  >
                    <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                      {project.name}
                    </h4>
                    <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {project.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {project.highlights.map((highlight, i) => (
                        <p key={i} className={`text-sm flex gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="text-indigo-500">✦</span>
                          {highlight}
                        </p>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className={`
                            text-xs px-2 py-1 rounded
                            ${isDark ? 'bg-indigo-500/10 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}
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
                              text-sm font-medium
                              ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}
                            `}
                          >
                            🔗 Live Demo
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            className={`
                              text-sm font-medium
                              ${isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'}
                            `}
                          >
                            💻 Source Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section3D>

            {/* Education */}
            <Section3D title="Education" isDark={isDark}>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="relative pl-8 border-l-2 border-purple-500/30 pb-6 last:pb-0">
                    <div className={`
                      absolute -left-2 top-0 w-4 h-4 rounded-full
                      ${isDark ? 'bg-purple-500' : 'bg-purple-600'}
                      shadow-lg shadow-purple-500/50
                    `} />

                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                          {edu.degree}
                        </h4>
                        <p className={`text-lg ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          {edu.institution}
                        </p>
                      </div>
                      <span className={`
                        text-sm px-3 py-1 rounded-full
                        ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}
                      `}>
                        {edu.startDate} - {edu.endDate}
                      </span>
                    </div>

                    <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {edu.field}
                    </p>

                    {edu.gpa && (
                      <p className={`text-sm mb-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        GPA: {edu.gpa}
                      </p>
                    )}

                    {edu.achievements && (
                      <ul className={`space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {edu.achievements.map((achievement, i) => (
                          <li key={i} className="flex gap-2 text-sm">
                            <span className="text-purple-500">▹</span>
                            <span>{achievement}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </Section3D>
          </div>
        </div>
      </div>

      {/* Add animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.03); }
        }
        @keyframes morph {
          0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-morph {
          animation: morph 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

function Section3D({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className={`
        relative rounded-2xl p-6
        ${isDark
          ? 'bg-gradient-to-br from-[#1a1b26]/80 to-[#16171f]/80 border border-indigo-500/10'
          : 'bg-white border border-gray-200 shadow-lg'
        }
        backdrop-blur-sm
      `}
      style={{
        boxShadow: isDark
          ? '0 0 40px rgba(99, 102, 241, 0.1)'
          : '0 10px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      <h3 className={`
        text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r
        ${isDark
          ? 'from-indigo-400 to-purple-400'
          : 'from-indigo-600 to-purple-600'
        }
      `}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ContactItem({ icon, text, isDark }: { icon: string; text?: string; isDark: boolean }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{text}</span>
    </div>
  );
}

function SocialBadge({ icon, url, isDark }: { icon: string; url: string; isDark: boolean }) {
  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        px-4 py-2 rounded-lg text-sm font-medium
        ${isDark
          ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20'
          : 'bg-indigo-100 text-indigo-700 border border-indigo-300 hover:bg-indigo-200'
        }
        transition-all hover:scale-105
      `}
    >
      {icon}
    </a>
  );
}
