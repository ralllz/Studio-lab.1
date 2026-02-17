import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  AppState, 
  Template, 
  CapturedImage, 
  Sticker, 
  TextElement, 
  FilterType,
  AppStep,
  CustomStickerCategory,
  CustomStickerItem
} from '@/types';

export const defaultTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Classic Frame',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300&h=400&fit=crop',
    overlayImageUrl: '',
    framesCount: 1,
    frames: [{ id: 0, x: 50, y: 50, width: 300, height: 400 }],
    aspectRatio: '3:4',
  },
  {
    id: 'template-2',
    name: 'Triple Strip',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520390138845-fd2d229dd552?w=300&h=600&fit=crop',
    overlayImageUrl: '',
    framesCount: 3,
    frames: [
      { id: 0, x: 50, y: 50, width: 200, height: 150 },
      { id: 1, x: 50, y: 220, width: 200, height: 150 },
      { id: 2, x: 50, y: 390, width: 200, height: 150 },
    ],
    aspectRatio: '3:4',
  },
  {
    id: 'template-3',
    name: 'Four Square',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=400&fit=crop',
    overlayImageUrl: '',
    framesCount: 4,
    frames: [
      { id: 0, x: 50, y: 50, width: 150, height: 150 },
      { id: 1, x: 220, y: 50, width: 150, height: 150 },
      { id: 2, x: 50, y: 220, width: 150, height: 150 },
      { id: 3, x: 220, y: 220, width: 150, height: 150 },
    ],
    aspectRatio: '1:1',
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Current step
      currentStep: 'home',
      setCurrentStep: (step: AppStep) => set({ currentStep: step }),

      // Dark mode
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Template
      selectedTemplate: null,
      setSelectedTemplate: (template: Template | null) =>
        set((state) => {
          if (!template) return { selectedTemplate: null };

          // If there are captured images, assign them to template frame indices sequentially
          const framesCount = template.frames?.length || template.framesCount || 0;
          if (state.capturedImages && state.capturedImages.length > 0 && framesCount > 0) {
            const reassigned = state.capturedImages.map((img, idx) => ({
              ...img,
              frameIndex: idx < framesCount ? idx : idx % framesCount,
            }));
            return { selectedTemplate: template, capturedImages: reassigned };
          }

          return { selectedTemplate: template };
        }),
      customTemplates: [],
      addCustomTemplate: (template: Template) =>
        set((state) => {
          const newCustoms = [...state.customTemplates, template];

          // Automatically select the new template and map existing captured images into its frames
          const framesCount = template.frames?.length || template.framesCount || 0;
          if (state.capturedImages && state.capturedImages.length > 0 && framesCount > 0) {
            const reassigned = state.capturedImages.map((img, idx) => ({
              ...img,
              frameIndex: idx < framesCount ? idx : idx % framesCount,
            }));
            return { customTemplates: newCustoms, selectedTemplate: template, capturedImages: reassigned };
          }

          return { customTemplates: newCustoms };
        }),
      removeCustomTemplate: (id: string) =>
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
          selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
        })),

      // Captured images
      capturedImages: [],
      addCapturedImage: (image: CapturedImage) =>
        set((state) => ({
          capturedImages: [...state.capturedImages, image],
        })),
      clearCapturedImages: () => set({ capturedImages: [] }),

      // Editor state
      editorState: {
        activeFilter: 'none',
        rotation: 0,
        scale: 1,
        crop: null,
      },
      setActiveFilter: (filter: FilterType) =>
        set((state) => ({
          editorState: {
            ...state.editorState,
            activeFilter: state.editorState.activeFilter === filter ? 'none' : filter,
          },
        })),
      setRotation: (rotation: number) =>
        set((state) => ({
          editorState: { ...state.editorState, rotation },
        })),
      setScale: (scale: number) =>
        set((state) => ({
          editorState: { ...state.editorState, scale },
        })),
      setCrop: (crop) =>
        set((state) => ({
          editorState: { ...state.editorState, crop },
        })),
      resetEditorState: () =>
        set({
          editorState: {
            activeFilter: 'none',
            rotation: 0,
            scale: 1,
            crop: null,
          },
        }),

      // Stickers
      stickers: [],
      addSticker: (sticker: Sticker) =>
        set((state) => ({
          stickers: [...state.stickers, sticker],
        })),
      updateSticker: (id: string, updates: Partial<Sticker>) =>
        set((state) => ({
          stickers: state.stickers.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      removeSticker: (id: string) =>
        set((state) => ({
          stickers: state.stickers.filter((s) => s.id !== id),
        })),
      clearStickers: () => set({ stickers: [] }),

      // Text elements
      textElements: [],
      addTextElement: (text: TextElement) =>
        set((state) => ({
          textElements: [...state.textElements, text],
        })),
      updateTextElement: (id: string, updates: Partial<TextElement>) =>
        set((state) => ({
          textElements: state.textElements.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      removeTextElement: (id: string) =>
        set((state) => ({
          textElements: state.textElements.filter((t) => t.id !== id),
        })),
      clearTextElements: () => set({ textElements: [] }),

      // Custom fonts
      customFonts: [],
      addCustomFont: (fontName: string) =>
        set((state) => ({
          customFonts: [...state.customFonts, fontName],
        })),

      // Custom sticker categories
      customStickerCategories: [],
      addCustomStickerCategory: (category: CustomStickerCategory) =>
        set((state) => ({
          customStickerCategories: [...state.customStickerCategories, category],
        })),
      addStickerToCategory: (categoryId: string, sticker: CustomStickerItem) =>
        set((state) => ({
          customStickerCategories: state.customStickerCategories.map((cat) =>
            cat.id === categoryId
              ? { ...cat, stickers: [...cat.stickers, sticker] }
              : cat
          ),
        })),
      removeCustomStickerCategory: (id: string) =>
        set((state) => ({
          customStickerCategories: state.customStickerCategories.filter((cat) => cat.id !== id),
        })),
    }),
    {
      name: 'photobooth-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        customTemplates: state.customTemplates,
        customFonts: state.customFonts,
        customStickerCategories: state.customStickerCategories,
      }),
    }
  )
);

// Predefined stickers
export const predefinedStickers = [
  { id: 'sticker-1', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583319.png', name: 'Heart' },
  { id: 'sticker-2', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583434.png', name: 'Star' },
  { id: 'sticker-3', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583340.png', name: 'Smile' },
  { id: 'sticker-4', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583354.png', name: 'Crown' },
  { id: 'sticker-5', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583447.png', name: 'Flower' },
  { id: 'sticker-6', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583315.png', name: 'Butterfly' },
];

// Available fonts
export const availableFonts = [
  'Inter',
  'Poppins',
  'Playfair Display',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
];

// Extended fonts (Vercel-safe Google Fonts)
export const extendedFonts = [
  'Inter',
  'Poppins',
  'Playfair Display',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Nunito',
  'Ubuntu',
  'Merriweather',
  'PT Sans',
  'Noto Sans',
  'Work Sans',
  'Bebas Neue',
  'Pacifico',
  'Dancing Script',
  'Lobster',
  'Abril Fatface',
];

// Filter definitions with CSS values
export const filterDefinitions: Record<FilterType, string> = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  brightness: 'brightness(130%)',
  contrast: 'contrast(150%)',
  vintage: 'sepia(50%) contrast(120%) saturate(80%)',
  warm: 'sepia(30%) saturate(140%) hue-rotate(-10deg)',
  cool: 'saturate(80%) hue-rotate(10deg) brightness(105%)',
};
