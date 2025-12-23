'use client';

import CVWizard from '@/components/CVWizard';
import { ApiKeyProvider } from '@/contexts/ApiKeyContext';

export default function Home() {
  return (
    <ApiKeyProvider>
      <main>
        <CVWizard />
      </main>
    </ApiKeyProvider>
  );
}
