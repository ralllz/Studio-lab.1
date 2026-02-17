import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Upload, X, Check, Image as ImageIcon, Shuffle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStore, defaultTemplates } from '@/store/useStore';
import { upsertTemplateToSupabase, deleteTemplateFromSupabase } from '@/lib/supabaseTemplates';
import type { Template, TemplateFrame } from '@/types';

export function TemplateSection() {
  const { 
    setCurrentStep, 
    selectedTemplate, 
    setSelectedTemplate, 
    customTemplates, 
    addCustomTemplate,
    removeCustomTemplate
  } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateImage, setTemplateImage] = useState<string | null>(null);
  const [thumbnailImage, setThumbnailImage] = useState<string | null>(null);
  const [framesCount, setFramesCount] = useState(1);
  const [customFrameCount, setCustomFrameCount] = useState('');
  const [isCustomFrame, setIsCustomFrame] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'template' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'template') {
          setTemplateImage(event.target?.result as string);
        } else {
          setThumbnailImage(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearTemplateImage = () => setTemplateImage(null);
  const clearThumbnailImage = () => setThumbnailImage(null);

  const handleRandomFrameCount = () => {
    const randomCount = Math.floor(Math.random() * 6) + 1;
    setFramesCount(randomCount);
    setIsCustomFrame(true);
    setCustomFrameCount(randomCount.toString());
  };

  const handleCustomFrameCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomFrameCount(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 10) {
      setFramesCount(num);
      setIsCustomFrame(true);
    }
  };

  const generateFrames = (count: number): TemplateFrame[] => {
    const frames: TemplateFrame[] = [];
    const canvasWidth = 400;
    const canvasHeight = count === 1 ? 500 : Math.min(count * 120 + 40, 700);
    
    if (count === 1) {
      frames.push({
        id: 0,
        x: 50,
        y: 50,
        width: canvasWidth - 100,
        height: canvasHeight - 100,
      });
    } else {
      const cols = count <= 2 ? 1 : 2;
      const rows = Math.ceil(count / cols);
      const frameWidth = cols === 1 ? canvasWidth - 100 : (canvasWidth - 120) / 2;
      const frameHeight = (canvasHeight - (rows + 1) * 20) / rows;
      
      for (let i = 0; i < count; i++) {
        frames.push({
          id: i,
          x: 50 + (i % cols) * (frameWidth + 20),
          y: 50 + Math.floor(i / cols) * (frameHeight + 20),
          width: frameWidth,
          height: frameHeight,
        });
      }
    }
    return frames;
  };

  const handleAddTemplate = () => {
    if (newTemplateName && templateImage && thumbnailImage) {
      const newTemplate: Template = {
        id: `custom-${Date.now()}`,
        name: newTemplateName,
        thumbnailUrl: thumbnailImage,
        overlayImageUrl: templateImage,
        framesCount,
        frames: generateFrames(framesCount),
        aspectRatio: framesCount >= 4 ? '1:1' : '3:4',
      };
      addCustomTemplate(newTemplate);
      // persist to Supabase (best-effort)
      upsertTemplateToSupabase(newTemplate).then((ok) => {
        if (!ok) console.warn('Failed to persist template to Supabase');
      });
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewTemplateName('');
    setTemplateImage(null);
    setThumbnailImage(null);
    setFramesCount(1);
    setCustomFrameCount('');
    setIsCustomFrame(false);
  };

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleDeleteTemplate = () => {
    if (templateToDelete) {
      // delete locally
      removeCustomTemplate(templateToDelete.id);
      // delete remotely
      deleteTemplateFromSupabase(templateToDelete.id).then((ok) => {
        if (!ok) console.warn('Failed to delete template from Supabase');
      });
      setTemplateToDelete(null);
    }
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      setCurrentStep('capture');
    }
  };

  const isCustomTemplate = (template: Template) => {
    return template.id.startsWith('custom-');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep('home')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Choose Template</h2>
        <div className="w-20" />
      </div>

      {/* Template grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Add custom template card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              onClick={() => setIsDialogOpen(true)}
              className="aspect-[3/4] flex flex-col items-center justify-center cursor-pointer border-dashed border-2 hover:border-primary hover:bg-accent/50 transition-all"
            >
              <Plus className="w-12 h-12 text-muted-foreground mb-4" />
              <span className="text-muted-foreground font-medium">Add Custom</span>
            </Card>
          </motion.div>

          {/* Template cards */}
          {allTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <Card
                onClick={() => handleSelectTemplate(template)}
                className={`aspect-[3/4] overflow-hidden cursor-pointer relative transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'ring-4 ring-primary ring-offset-2'
                    : 'hover:shadow-xl'
                }`}
              >
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold">{template.name}</h3>
                  <p className="text-white/70 text-sm">{template.framesCount} frame(s)</p>
                </div>
                {selectedTemplate?.id === template.id && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </Card>
              
              {/* Delete button for custom templates */}
              {isCustomTemplate(template) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTemplateToDelete(template);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Continue button */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center"
          >
            <Button
              size="lg"
              onClick={handleContinue}
              className="px-12 py-6 text-lg font-semibold rounded-full"
            >
              Continue with &quot;{selectedTemplate.name}&quot;
            </Button>
          </motion.div>
        )}
      </div>

      {/* Add Custom Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Add Custom Template</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] px-6">
            <div className="space-y-4 pb-6">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <Label>Number of Frames</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {[1, 3, 4].map((count) => (
                    <Button
                      key={count}
                      variant={!isCustomFrame && framesCount === count ? 'default' : 'outline'}
                      onClick={() => {
                        setFramesCount(count);
                        setIsCustomFrame(false);
                        setCustomFrameCount('');
                      }}
                      className="flex-1 min-w-[80px]"
                    >
                      {count} Frame{count > 1 ? 's' : ''}
                    </Button>
                  ))}
                  <Button
                    variant={isCustomFrame ? 'default' : 'outline'}
                    onClick={handleRandomFrameCount}
                    className="flex-1 min-w-[100px]"
                  >
                    <Shuffle className="w-4 h-4 mr-1" />
                    Random
                  </Button>
                </div>
                {isCustomFrame && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={customFrameCount}
                      onChange={handleCustomFrameCountChange}
                      placeholder="Enter frame count (1-10)"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Template Image (PNG with transparency)</Label>
                  {templateImage && (
                    <button
                      onClick={clearTemplateImage}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Cancel
                    </button>
                  )}
                </div>
                <input
                  ref={templateInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleTemplateUpload(e, 'template')}
                  className="hidden"
                />
                <div
                  onClick={() => !templateImage && templateInputRef.current?.click()}
                  className={`mt-2 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center transition-colors relative ${
                    templateImage ? '' : 'cursor-pointer hover:border-primary'
                  }`}
                >
                  {templateImage ? (
                    <>
                      <img src={templateImage} alt="Template" className="max-h-32 object-contain" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearTemplateImage();
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload PNG</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label>Thumbnail Image</Label>
                  {thumbnailImage && (
                    <button
                      onClick={clearThumbnailImage}
                      className="text-xs text-destructive hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Cancel
                    </button>
                  )}
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleTemplateUpload(e, 'thumbnail')}
                  className="hidden"
                />
                <div
                  onClick={() => !thumbnailImage && thumbnailInputRef.current?.click()}
                  className={`mt-2 border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center transition-colors relative ${
                    thumbnailImage ? '' : 'cursor-pointer hover:border-primary'
                  }`}
                >
                  {thumbnailImage ? (
                    <>
                      <img src={thumbnailImage} alt="Thumbnail" className="max-h-32 object-contain" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearThumbnailImage();
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload thumbnail</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTemplate}
                  disabled={!newTemplateName || !templateImage || !thumbnailImage}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Template Confirmation Dialog */}
      <Dialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete &quot;{templateToDelete?.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setTemplateToDelete(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTemplate} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
