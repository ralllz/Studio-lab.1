import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  RotateCw,
  Type,
  Sticker,
  Palette,
  Trash2,
  Check,
  X,
  Plus,
  Minus,
  Upload,
  Image as ImageIcon,
  Save,
  RotateCcw,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore, filterDefinitions, extendedFonts } from '@/store/useStore';
import type { FilterType, Sticker as StickerType, TextElement, CustomStickerCategory, CustomStickerItem } from '@/types';

// Filter options
const filters: { name: FilterType; label: string }[] = [
  { name: 'none', label: 'Normal' },
  { name: 'grayscale', label: 'Grayscale' },
  { name: 'sepia', label: 'Sepia' },
  { name: 'brightness', label: 'Bright' },
  { name: 'contrast', label: 'Contrast' },
  { name: 'vintage', label: 'Vintage' },
  { name: 'warm', label: 'Warm' },
  { name: 'cool', label: 'Cool' },
];

// Default sticker categories
const defaultStickerCategories: Record<string, { name: string; stickers: { id: string; url: string; name: string }[] }> = {
  emoji: {
    name: 'Emoji',
    stickers: [
      { id: 'emoji-1', url: 'https://cdn-icons-png.flaticon.com/128/742/742751.png', name: 'Happy' },
      { id: 'emoji-2', url: 'https://cdn-icons-png.flaticon.com/128/742/742752.png', name: 'Love' },
      { id: 'emoji-3', url: 'https://cdn-icons-png.flaticon.com/128/742/742774.png', name: 'Cool' },
    ],
  },
  love: {
    name: 'Love',
    stickers: [
      { id: 'love-1', url: 'https://cdn-icons-png.flaticon.com/128/833/833472.png', name: 'Heart' },
      { id: 'love-2', url: 'https://cdn-icons-png.flaticon.com/128/833/833471.png', name: 'Heart2' },
      { id: 'love-3', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583319.png', name: 'Heart3' },
    ],
  },
  celebration: {
    name: 'Party',
    stickers: [
      { id: 'party-1', url: 'https://cdn-icons-png.flaticon.com/128/3082/3082060.png', name: 'Balloon' },
      { id: 'party-2', url: 'https://cdn-icons-png.flaticon.com/128/3082/3082059.png', name: 'Confetti' },
      { id: 'party-3', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583354.png', name: 'Crown' },
    ],
  },
  nature: {
    name: 'Nature',
    stickers: [
      { id: 'nature-1', url: 'https://cdn-icons-png.flaticon.com/128/892/892634.png', name: 'Sun' },
      { id: 'nature-2', url: 'https://cdn-icons-png.flaticon.com/128/414/414927.png', name: 'Cloud' },
      { id: 'nature-3', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583447.png', name: 'Flower' },
    ],
  },
  fun: {
    name: 'Fun',
    stickers: [
      { id: 'fun-1', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583434.png', name: 'Star' },
      { id: 'fun-2', url: 'https://cdn-icons-png.flaticon.com/128/2583/2583340.png', name: 'Smile' },
      { id: 'fun-3', url: 'https://cdn-icons-png.flaticon.com/128/3081/3081986.png', name: 'Fire' },
    ],
  },
};

export function EditorSection() {
  const {
    setCurrentStep,
    selectedTemplate,
    capturedImages,
    editorState,
    setActiveFilter,
    setRotation,
    setScale,
    stickers,
    addSticker,
    updateSticker,
    removeSticker,
    clearStickers,
    textElements,
    addTextElement,
    updateTextElement,
    removeTextElement,
    customStickerCategories,
    addStickerToCategory,
    addCustomStickerCategory,
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState('filters');
  const [activeStickerCategory, setActiveStickerCategory] = useState<string>('emoji');
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Inline text input
  const [showTextInput, setShowTextInput] = useState(false);
  const [newText, setNewText] = useState('');
  const [newTextColor, setNewTextColor] = useState('#000000');
  const [newTextFont, setNewTextFont] = useState('Inter');
  const [newTextSize, setNewTextSize] = useState(24);
  
  // Add sticker dialog
  const [isAddStickerDialogOpen, setIsAddStickerDialogOpen] = useState(false);
  const [newStickerUrl, setNewStickerUrl] = useState<string | null>(null);
  const [selectedCategoryForNewSticker, setSelectedCategoryForNewSticker] = useState<string>('emoji');
  
  // Add category dialog
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Canvas dimensions - HALF SIZE
  const CANVAS_WIDTH = selectedTemplate?.aspectRatio === '1:1' ? 400 : 400;
  const CANVAS_HEIGHT = selectedTemplate?.aspectRatio === '1:1' ? 400 : 533;

  // Photo offsets for individual dragging
  const [photoOffsets, setPhotoOffsets] = useState<Record<number, { x: number; y: number }>>({});

  // Combine default and custom categories
  const allCategories = { ...defaultStickerCategories };
  customStickerCategories.forEach((cat) => {
    allCategories[cat.id] = { name: cat.name, stickers: cat.stickers };
  });

  // Load images and render canvas
  const renderCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedTemplate) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gray background
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };

    try {
      // Layer 0: Draw captured photos (individual)
      for (let index = 0; index < capturedImages.length; index++) {
        const img = capturedImages[index];
        const frame = selectedTemplate.frames[index];
        if (!frame) continue;

        const imageObj = await loadImage(img.dataUrl);
        
        const scaleX = CANVAS_WIDTH / 400;
        const scaleY = CANVAS_HEIGHT / (selectedTemplate.aspectRatio === '1:1' ? 400 : 533);

        const baseX = frame.x * scaleX;
        const baseY = frame.y * scaleY;
        const width = frame.width * scaleX;
        const height = frame.height * scaleY;

        // Apply individual photo offset
        const offset = photoOffsets[index] || { x: 0, y: 0 };
        const x = baseX + offset.x;
        const y = baseY + offset.y;

        ctx.save();

        // Apply filter
        if (editorState.activeFilter !== 'none') {
          ctx.filter = filterDefinitions[editorState.activeFilter];
        }

        // Apply rotation and scale
        ctx.translate(x + width / 2, y + height / 2);
        ctx.rotate((editorState.rotation * Math.PI) / 180);
        ctx.scale(editorState.scale, editorState.scale);

        // Draw image
        ctx.drawImage(
          imageObj,
          -width / 2,
          -height / 2,
          width,
          height
        );

        // Draw selection border for selected photo
        if (selectedPhotoIndex === index) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          ctx.strokeRect(-width / 2 - 5, -height / 2 - 5, width + 10, height + 10);
        }

        ctx.restore();
      }

      // Layer 1: Draw template overlay
      if (selectedTemplate.overlayImageUrl) {
        try {
          const templateImg = await loadImage(selectedTemplate.overlayImageUrl);
          ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
        } catch {
          // Template image failed to load
        }
      }

      // Layer 2: Draw stickers (only one at a time)
      for (const sticker of stickers) {
        try {
          const stickerImg = await loadImage(sticker.url);
          ctx.save();
          ctx.translate(sticker.x + sticker.width / 2, sticker.y + sticker.height / 2);
          ctx.rotate((sticker.rotation * Math.PI) / 180);
          ctx.drawImage(
            stickerImg,
            -sticker.width / 2,
            -sticker.height / 2,
            sticker.width,
            sticker.height
          );
          ctx.restore();

          // Draw selection border
          if (selectedSticker === sticker.id) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.strokeRect(sticker.x, sticker.y, sticker.width, sticker.height);
          }
        } catch {
          // Sticker failed to load
        }
      }

      // Layer 3: Draw text elements (frontmost)
      for (const text of textElements) {
        ctx.save();
        ctx.translate(text.x, text.y);
        ctx.rotate((text.rotation * Math.PI) / 180);
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text.text, 0, 0);
        ctx.restore();

        // Draw selection indicator
        if (selectedText === text.id) {
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 3;
          const metrics = ctx.measureText(text.text);
          ctx.strokeRect(
            text.x - metrics.width / 2 - 5,
            text.y - text.fontSize / 2 - 5,
            metrics.width + 10,
            text.fontSize + 10
          );
        }
      }
    } catch (error) {
      console.error('Error rendering canvas:', error);
    }
  }, [
    selectedTemplate,
    capturedImages,
    editorState,
    stickers,
    textElements,
    selectedSticker,
    selectedText,
    selectedPhotoIndex,
    photoOffsets,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  ]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle filter toggle
  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  // Handle rotation with slider
  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  // Handle scale
  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  // Add ONE sticker at a time (replace existing)
  const handleAddSticker = (stickerUrl: string) => {
    // Clear existing stickers first (only one at a time)
    clearStickers();
    
    const newSticker: StickerType = {
      id: `sticker-${Date.now()}`,
      url: stickerUrl,
      x: CANVAS_WIDTH / 2 - 40,
      y: CANVAS_HEIGHT / 2 - 40,
      width: 80,
      height: 80,
      rotation: 0,
    };
    addSticker(newSticker);
    setSelectedSticker(newSticker.id);
    setSelectedText(null);
    setSelectedPhotoIndex(null);
  };

  // Handle custom sticker upload
  const handleCustomStickerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewStickerUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save custom sticker to category
  const handleSaveCustomSticker = () => {
    if (newStickerUrl) {
      const newSticker: CustomStickerItem = {
        id: `custom-sticker-${Date.now()}`,
        url: newStickerUrl,
        name: 'Custom',
      };
      
      // Check if it's a custom category
      const customCat = customStickerCategories.find((c) => c.id === selectedCategoryForNewSticker);
      if (customCat) {
        addStickerToCategory(selectedCategoryForNewSticker, newSticker);
      }
      
      // Add to canvas (only one)
      handleAddSticker(newStickerUrl);
      
      setNewStickerUrl(null);
      setIsAddStickerDialogOpen(false);
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: CustomStickerCategory = {
        id: `category-${Date.now()}`,
        name: newCategoryName,
        stickers: [],
      };
      addCustomStickerCategory(newCategory);
      setNewCategoryName('');
      setIsAddCategoryDialogOpen(false);
      setActiveStickerCategory(newCategory.id);
    }
  };

  // Add text inline
  const handleAddText = () => {
    if (newText.trim()) {
      const textElement: TextElement = {
        id: `text-${Date.now()}`,
        text: newText,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        fontSize: newTextSize,
        fontFamily: newTextFont,
        color: newTextColor,
        rotation: 0,
      };
      addTextElement(textElement);
      setNewText('');
      setShowTextInput(false);
      setSelectedText(textElement.id);
      setSelectedSticker(null);
      setSelectedPhotoIndex(null);
    }
  };

  // Handle canvas mouse events for dragging
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check if clicking on text (frontmost layer)
    const canvasContext = canvas.getContext('2d');
    if (canvasContext) {
      for (let i = textElements.length - 1; i >= 0; i--) {
        const t = textElements[i];
        const metrics = canvasContext.measureText(t.text);
        if (
          x >= t.x - metrics.width / 2 - 10 &&
          x <= t.x + metrics.width / 2 + 10 &&
          y >= t.y - t.fontSize / 2 - 10 &&
          y <= t.y + t.fontSize / 2 + 10
        ) {
          setSelectedText(t.id);
          setSelectedSticker(null);
          setSelectedPhotoIndex(null);
          setIsDragging(true);
          setDragStart({ x: x - t.x, y: y - t.y });
          return;
        }
      }
    }

    // Check if clicking on a sticker
    for (let i = stickers.length - 1; i >= 0; i--) {
      const s = stickers[i];
      if (
        x >= s.x &&
        x <= s.x + s.width &&
        y >= s.y &&
        y <= s.y + s.height
      ) {
        setSelectedSticker(s.id);
        setSelectedText(null);
        setSelectedPhotoIndex(null);
        setIsDragging(true);
        setDragStart({ x: x - s.x, y: y - s.y });
        return;
      }
    }

    // Check if clicking on a photo (individual selection)
    for (let index = capturedImages.length - 1; index >= 0; index--) {
      const frame = selectedTemplate?.frames[index];
      if (!frame) continue;

      const scaleXF = CANVAS_WIDTH / 400;
      const scaleYF = CANVAS_HEIGHT / (selectedTemplate?.aspectRatio === '1:1' ? 400 : 533);
      const offset = photoOffsets[index] || { x: 0, y: 0 };
      const fx = frame.x * scaleXF + offset.x;
      const fy = frame.y * scaleYF + offset.y;
      const fw = frame.width * scaleXF;
      const fh = frame.height * scaleYF;

      if (x >= fx && x <= fx + fw && y >= fy && y <= fy + fh) {
        setSelectedPhotoIndex(index);
        setSelectedSticker(null);
        setSelectedText(null);
        setIsDragging(true);
        setDragStart({ x: x - fx, y: y - fy });
        return;
      }
    }

    setSelectedSticker(null);
    setSelectedText(null);
    setSelectedPhotoIndex(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedSticker) {
      updateSticker(selectedSticker, {
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (selectedText) {
      updateTextElement(selectedText, {
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    } else if (selectedPhotoIndex !== null) {
      const scaleXF = CANVAS_WIDTH / 400;
      const scaleYF = CANVAS_HEIGHT / (selectedTemplate?.aspectRatio === '1:1' ? 400 : 533);
      const frame = selectedTemplate?.frames[selectedPhotoIndex];
      if (frame) {
        const baseX = frame.x * scaleXF;
        const baseY = frame.y * scaleYF;
        setPhotoOffsets((prev) => ({
          ...prev,
          [selectedPhotoIndex]: {
            x: x - dragStart.x - baseX,
            y: y - dragStart.y - baseY,
          },
        }));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Resize sticker
  const handleResizeSticker = (delta: number) => {
    if (selectedSticker) {
      const sticker = stickers.find((s) => s.id === selectedSticker);
      if (sticker) {
        const newSize = Math.max(20, sticker.width + delta);
        updateSticker(selectedSticker, {
          width: newSize,
          height: newSize,
        });
      }
    }
  };

  // Rotate sticker with slider
  const handleStickerRotationChange = (value: number[]) => {
    if (selectedSticker) {
      updateSticker(selectedSticker, {
        rotation: value[0],
      });
    }
  };

  // Rotate text with slider
  const handleTextRotationChange = (value: number[]) => {
    if (selectedText) {
      updateTextElement(selectedText, {
        rotation: value[0],
      });
    }
  };

  // Download image
  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    await renderCanvas();

    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `photobooth-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100);
  };

  if (!selectedTemplate || capturedImages.length === 0) {
    setCurrentStep('home');
    return null;
  }

  const selectedStickerData = stickers.find((s) => s.id === selectedSticker);
  const selectedTextData = textElements.find((t) => t.id === selectedText);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('capture')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        <h2 className="text-xl font-bold">Edit Your Photos</h2>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Save
        </Button>
      </div>

      {/* Main editor area */}
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        {/* Canvas - HALF SIZE */}
        <div className="lg:col-span-2">
          <Card className="p-4 overflow-hidden bg-gray-400 flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className="cursor-move border border-border rounded shadow-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-2">
            Click photo/sticker/text to select, then drag to move
          </p>
        </div>

        {/* Tools panel */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="filters">
                  <Palette className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="stickers">
                  <Sticker className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>

              {/* Filters Tab */}
              <TabsContent value="filters" className="space-y-4">
                <h3 className="font-semibold">Filters</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filters.map((filter) => (
                    <Button
                      key={filter.name}
                      variant={editorState.activeFilter === filter.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterClick(filter.name)}
                      className="justify-start"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Adjustments</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        Rotation
                      </Label>
                      <Slider
                        value={[editorState.rotation]}
                        onValueChange={handleRotationChange}
                        min={0}
                        max={360}
                        step={15}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">
                        {editorState.rotation}°
                      </span>
                    </div>

                    <div>
                      <Label className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Scale
                      </Label>
                      <Slider
                        value={[editorState.scale]}
                        onValueChange={handleScaleChange}
                        min={0.5}
                        max={2}
                        step={0.1}
                        className="mt-2"
                      />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(editorState.scale * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Photo Controls */}
                {selectedPhotoIndex !== null && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Selected Photo #{selectedPhotoIndex + 1}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPhotoOffsets((prev) => ({ ...prev, [selectedPhotoIndex]: { x: 0, y: 0 } }))}
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Position
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Stickers Tab */}
              <TabsContent value="stickers" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Stickers</h3>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddCategoryDialogOpen(true)}
                    >
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddStickerDialogOpen(true)}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Category tabs */}
                <ScrollArea className="h-10">
                  <div className="flex gap-1">
                    {Object.entries(allCategories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveStickerCategory(key)}
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                          activeStickerCategory === key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Sticker grid - only 3 stickers */}
                <div className="grid grid-cols-3 gap-2">
                  {allCategories[activeStickerCategory]?.stickers.slice(0, 3).map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => handleAddSticker(sticker.url)}
                      className="p-2 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <img
                        src={sticker.url}
                        alt={sticker.name}
                        className="w-full h-10 object-contain"
                      />
                    </button>
                  ))}
                </div>

                {selectedSticker && selectedStickerData && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Selected Sticker</h3>
                    
                    {/* Size controls */}
                    <div className="mb-3">
                      <Label className="text-xs">Size</Label>
                      <div className="flex gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResizeSticker(-10)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="flex-1 text-center text-sm py-2">
                          {Math.round(selectedStickerData.width)}px
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResizeSticker(10)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Rotation slider */}
                    <div className="mb-3">
                      <Label className="text-xs flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Rotation
                      </Label>
                      <Slider
                        value={[selectedStickerData.rotation]}
                        onValueChange={handleStickerRotationChange}
                        min={0}
                        max={360}
                        step={15}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {selectedStickerData.rotation}°
                      </span>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        removeSticker(selectedSticker);
                        setSelectedSticker(null);
                      }}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Sticker
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Text Tab */}
              <TabsContent value="text" className="space-y-4">
                <h3 className="font-semibold">Text</h3>
                
                {/* Inline text input */}
                {!showTextInput ? (
                  <Button onClick={() => setShowTextInput(true)} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text
                  </Button>
                ) : (
                  <div className="space-y-3 border rounded-lg p-3">
                    <Input
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      placeholder="Enter your text"
                      autoFocus
                    />
                    <select
                      value={newTextFont}
                      onChange={(e) => setNewTextFont(e.target.value)}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      {extendedFonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Size:</Label>
                      <Slider
                        value={[newTextSize]}
                        onValueChange={(v) => setNewTextSize(v[0])}
                        min={12}
                        max={72}
                        step={2}
                      />
                      <span className="text-xs w-8">{newTextSize}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Color:</Label>
                      <input
                        type="color"
                        value={newTextColor}
                        onChange={(e) => setNewTextColor(e.target.value)}
                        className="w-10 h-8 rounded"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowTextInput(false)} className="flex-1" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button onClick={handleAddText} className="flex-1" size="sm">
                        <Check className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}

                {selectedText && selectedTextData && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3">Selected Text</h3>
                    
                    {/* Rotation slider */}
                    <div className="mb-3">
                      <Label className="text-xs flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Rotation
                      </Label>
                      <Slider
                        value={[selectedTextData.rotation]}
                        onValueChange={handleTextRotationChange}
                        min={0}
                        max={360}
                        step={15}
                        className="mt-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {selectedTextData.rotation}°
                      </span>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        removeTextElement(selectedText);
                        setSelectedText(null);
                      }}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Text
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Add Custom Sticker Dialog */}
      <Dialog open={isAddStickerDialogOpen} onOpenChange={setIsAddStickerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Sticker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <select
                value={selectedCategoryForNewSticker}
                onChange={(e) => setSelectedCategoryForNewSticker(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(allCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Sticker Image</Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomStickerUpload}
                className="hidden"
                id="sticker-upload"
              />
              <label
                htmlFor="sticker-upload"
                className="mt-2 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors block"
              >
                {newStickerUrl ? (
                  <img src={newStickerUrl} alt="New sticker" className="max-h-32 object-contain" />
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Click to upload from gallery</span>
                  </>
                )}
              </label>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setNewStickerUrl(null);
                setIsAddStickerDialogOpen(false);
              }} className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustomSticker}
                disabled={!newStickerUrl}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save & Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter category name"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsAddCategoryDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
