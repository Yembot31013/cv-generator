'use client';

import { getModelsForRole, getModelLabel, type AiModelRole } from '@/lib/aiModels';
import { useAiSettings } from '@/contexts/AiSettingsContext';

interface AiModelSettingsProps {
  theme?: 'dark' | 'light';
  compact?: boolean;
}

function ModelSelect({
  role,
  label,
  hint,
  value,
  onChange,
  isDark,
}: {
  role: AiModelRole;
  label: string;
  hint: string;
  value: string;
  onChange: (id: string) => void;
  isDark: boolean;
}) {
  const options = getModelsForRole(role);

  return (
    <div>
      <label
        className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{hint}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2.5 rounded-lg text-sm border transition-all
          ${
            isDark
              ? 'bg-gray-900 border-gray-700 text-white focus:border-indigo-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
          }
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20
        `}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
            {opt.recommended ? ' (Recommended)' : ''}
          </option>
        ))}
      </select>
      <p className={`mt-1.5 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        {options.find((o) => o.id === value)?.description}
      </p>
    </div>
  );
}

export default function AiModelSettings({ theme = 'dark', compact = false }: AiModelSettingsProps) {
  const isDark = theme === 'dark';
  const { flashModel, proModel, setFlashModel, setProModel } = useAiSettings();

  return (
    <div
      className={`rounded-xl ${compact ? 'p-4' : 'p-6'} ${
        isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-300'
      }`}
    >
      <div className="mb-4">
        <h3 className={`font-bold ${compact ? 'text-base' : 'text-lg'} ${isDark ? 'text-white' : 'text-gray-900'}`}>
          AI Models
        </h3>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Choose which Gemini models power each task. Only supported, active models are listed.
        </p>
      </div>

      <div className={`grid gap-4 ${compact ? '' : 'md:grid-cols-2'}`}>
        <ModelSelect
          role="flash"
          label="Fast model"
          hint="Enhancement, review, job parsing, cover letter, and edits"
          value={flashModel}
          onChange={setFlashModel}
          isDark={isDark}
        />
        <ModelSelect
          role="pro"
          label="Extraction model"
          hint="Reading and extracting data from uploaded PDFs and DOCX files"
          value={proModel}
          onChange={setProModel}
          isDark={isDark}
        />
      </div>

      <p className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Active: {getModelLabel(flashModel)} + {getModelLabel(proModel)} · Saved in your browser
      </p>
    </div>
  );
}
