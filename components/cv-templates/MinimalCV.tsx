'use client';

import { CVTemplateProps } from '@/types/cv';

export default function MinimalCV({ data, theme = 'dark' }: CVTemplateProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0d1117]' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Subtle background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill={isDark ? '#fff' : '#000'} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-8 py-16">
        {/* Minimal Header */}
        <header className="mb-16 pb-8 border-b-2 border-indigo-500/20">
          <div className="mb-8">
            <h1
              className={`text-7xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ letterSpacing: '-0.02em' }}
            >
              {data.personalInfo.fullName}
            </h1>
            <p className={`text-2xl font-light ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              {data.personalInfo.title}
            </p>
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap gap-6 mb-6">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {data.personalInfo.email}
                </span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {data.personalInfo.phone}
                </span>
              </div>
            )}
            {data.personalInfo.location && (
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {data.personalInfo.location}
                </span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-2">
                <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-indigo-400' : 'bg-indigo-600'}`} />
                <a
                  href={`https://${data.personalInfo.website}`}
                  className={`text-sm ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                >
                  {data.personalInfo.website}
                </a>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-4">
            {data.personalInfo.github && (
              <a
                href={`https://${data.personalInfo.github}`}
                className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                GitHub →
              </a>
            )}
            {data.personalInfo.linkedin && (
              <a
                href={`https://${data.personalInfo.linkedin}`}
                className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                LinkedIn →
              </a>
            )}
            {data.personalInfo.twitter && (
              <a
                href={`https://${data.personalInfo.twitter}`}
                className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
              >
                Twitter →
              </a>
            )}
          </div>
        </header>

        {/* About */}
        <section className="mb-16">
          <SectionTitle title="About" isDark={isDark} />
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-4xl`}>
            {data.personalInfo.bio}
          </p>
        </section>

        {/* Experience */}
        <section className="mb-16">
          <SectionTitle title="Experience" isDark={isDark} />
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id} className="group">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {exp.position}
                  </h3>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {exp.startDate} — {exp.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <p className={`text-lg font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {exp.company}
                  </p>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {exp.location}
                  </span>
                </div>

                <ul className={`space-y-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {exp.description.map((desc, i) => (
                    <li key={i} className="flex gap-3 text-base">
                      <span className={`${isDark ? 'text-indigo-500' : 'text-indigo-600'} mt-1.5`}>—</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>

                {exp.technologies && (
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className={`text-xs px-2 py-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-16">
          <SectionTitle title="Featured Projects" isDark={isDark} />
          <div className="grid gap-8">
            {data.projects.map((project) => (
              <div key={project.id} className="group">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {project.name}
                  </h3>
                  <div className="flex gap-3">
                    {project.link && (
                      <a
                        href={project.link}
                        className={`text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}
                      >
                        View →
                      </a>
                    )}
                    {project.github && (
                      <a
                        href={project.github}
                        className={`text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        Code →
                      </a>
                    )}
                  </div>
                </div>

                <p className={`text-base mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>

                <ul className={`space-y-1 mb-3 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                  {project.highlights.map((highlight, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={isDark ? 'text-indigo-500' : 'text-indigo-600'}>•</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2 py-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout for Education and Skills */}
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          {/* Education */}
          <section>
            <SectionTitle title="Education" isDark={isDark} />
            <div className="space-y-8">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {edu.degree}
                  </h3>
                  <p className={`font-semibold mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {edu.institution}
                  </p>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {edu.startDate} — {edu.endDate}
                  </p>
                  {edu.gpa && (
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                  {edu.achievements && (
                    <ul className={`space-y-1 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {edu.achievements.map((achievement, i) => (
                        <li key={i} className="flex gap-2 text-sm">
                          <span>•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <SectionTitle title="Skills" isDark={isDark} />
            <div className="space-y-6">
              {data.skills.map((skillGroup, idx) => (
                <div key={idx}>
                  <h4 className={`text-sm font-bold mb-2 uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                    {skillGroup.category}
                  </h4>
                  <p className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {skillGroup.items.join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Certifications and Languages */}
        <div className="grid md:grid-cols-2 gap-16">
          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <section>
              <SectionTitle title="Certifications" isDark={isDark} />
              <div className="space-y-4">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {cert.name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {cert.issuer} • {cert.date}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <section>
              <SectionTitle title="Languages" isDark={isDark} />
              <div className="space-y-2">
                {data.languages.map((lang, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{lang.name}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <h2 className={`text-xs font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
      {title}
    </h2>
  );
}
