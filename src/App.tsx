import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useSupabaseTemplateSync } from '@/hooks/useSupabaseTemplateSync';
import { fetchTemplatesFromSupabase } from '@/lib/supabaseTemplates';
import { useEffect } from 'react';
import { HomeSection } from '@/sections/HomeSection';
import { TemplateSection } from '@/sections/TemplateSection';
import { CaptureSection } from '@/sections/CaptureSection';
import { EditorSection } from '@/sections/EditorSection';
import './App.css';

function App() {
  const { currentStep, isDarkMode } = useStore();
  useSupabaseTemplateSync();

  // Load templates from Supabase on app mount (merge into custom templates)
  useEffect(() => {
    (async () => {
      try {
        const remote = await fetchTemplatesFromSupabase();
        if (remote && remote.length > 0) {
          // set store custom templates
          useStore.getState().setCustomTemplates(remote);
        }
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <AnimatePresence mode="wait">
          {currentStep === 'home' && <HomeSection key="home" />}
          {currentStep === 'template' && <TemplateSection key="template" />}
          {currentStep === 'capture' && <CaptureSection key="capture" />}
          {currentStep === 'editor' && <EditorSection key="editor" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
