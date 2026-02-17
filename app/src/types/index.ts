// Types for Web Photobooth Application

export interface TemplateFrame {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Template {
  id: string;
  name: string;
  thumbnailUrl: string;
  overlayImageUrl: string;
  framesCount: number;
  frames: TemplateFrame[];
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
}

export interface CapturedImage {
  id: string;
  dataUrl: string;
  frameIndex: number;
}

export interface Sticker {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
}

export interface CustomStickerItem {
  id: string;
  url: string;
  name: string;
}

export interface CustomStickerCategory {
  id: string;
  name: string;
  stickers: CustomStickerItem[];
}

export type FilterType = 'none' | 'grayscale' | 'sepia' | 'brightness' | 'contrast' | 'vintage' | 'warm' | 'cool';

export interface EditorState {
  activeFilter: FilterType;
  rotation: number;
  scale: number;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
}

export type AppStep = 'home' | 'template' | 'capture' | 'editor' | 'save';

export interface AppState {
  // Current step
  currentStep: AppStep;
  setCurrentStep: (step: AppStep) => void;
  
  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Template
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;
  customTemplates: Template[];
  addCustomTemplate: (template: Template) => void;
  removeCustomTemplate: (id: string) => void;
  
  // Captured images
  capturedImages: CapturedImage[];
  addCapturedImage: (image: CapturedImage) => void;
  clearCapturedImages: () => void;
  
  // Editor state
  editorState: EditorState;
  setActiveFilter: (filter: FilterType) => void;
  setRotation: (rotation: number) => void;
  setScale: (scale: number) => void;
  setCrop: (crop: EditorState['crop']) => void;
  resetEditorState: () => void;
  
  // Stickers
  stickers: Sticker[];
  addSticker: (sticker: Sticker) => void;
  updateSticker: (id: string, updates: Partial<Sticker>) => void;
  removeSticker: (id: string) => void;
  clearStickers: () => void;
  
  // Text elements
  textElements: TextElement[];
  addTextElement: (text: TextElement) => void;
  updateTextElement: (id: string, updates: Partial<TextElement>) => void;
  removeTextElement: (id: string) => void;
  clearTextElements: () => void;
  
  // Custom fonts
  customFonts: string[];
  addCustomFont: (fontName: string) => void;
  
  // Custom sticker categories (persisted)
  customStickerCategories: CustomStickerCategory[];
  addCustomStickerCategory: (category: CustomStickerCategory) => void;
  addStickerToCategory: (categoryId: string, sticker: CustomStickerItem) => void;
  removeCustomStickerCategory: (id: string) => void;
}
