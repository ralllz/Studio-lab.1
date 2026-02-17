import { AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { useSupabaseTemplateSync } from '@/hooks/useSupabaseTemplateSync';
import { HomeSection } from '@/sections/HomeSection';
import { TemplateSection } from '@/sections/TemplateSection';
import { CaptureSection } from '@/sections/CaptureSection';
import { EditorSection } from '@/sections/EditorSection';
import './App.css';

function App() {
  const { currentStep, isDarkMode } = useStore();
  useSupabaseTemplateSync();

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
