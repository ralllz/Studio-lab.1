import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { ArrowLeft, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';
import type { CapturedImage } from '@/types';

const COUNTDOWN_SECONDS = 3;

export function CaptureSection() {
  const { 
    setCurrentStep, 
    selectedTemplate, 
    capturedImages, 
    addCapturedImage, 
    clearCapturedImages,
    clearStickers,
    clearTextElements,
    resetEditorState
  } = useStore();
  const webcamRef = useRef<Webcam>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const totalFrames = selectedTemplate?.framesCount || 1;
  const isComplete = capturedImages.length >= totalFrames;

  // Reset state when entering capture section
  useEffect(() => {
    clearCapturedImages();
    clearStickers();
    clearTextElements();
    resetEditorState();
    setCurrentFrameIndex(0);
    setShowPreview(false);
    setIsCapturing(false);
    setCountdown(0);
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const newImage: CapturedImage = {
          id: `capture-${Date.now()}`,
          dataUrl: imageSrc,
          frameIndex: currentFrameIndex,
        };
        addCapturedImage(newImage);
        
        if (currentFrameIndex < totalFrames - 1) {
          setCurrentFrameIndex((prev) => prev + 1);
          setIsCapturing(false);
          setCountdown(0);
        } else {
          setIsCapturing(false);
          setShowPreview(true);
        }
      }
    }
  }, [webcamRef, currentFrameIndex, totalFrames, addCapturedImage]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isCapturing && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isCapturing && countdown === 0) {
      capture();
    }
    return () => clearTimeout(timer);
  }, [isCapturing, countdown, capture]);

  const startCapture = () => {
    setIsCapturing(true);
    setCountdown(COUNTDOWN_SECONDS);
  };

  const handleRetake = () => {
    clearCapturedImages();
    setCurrentFrameIndex(0);
    setShowPreview(false);
    setIsCapturing(false);
    setCountdown(0);
  };

  const handleContinue = () => {
    setCurrentStep('editor');
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!selectedTemplate) {
    setCurrentStep('template');
    return null;
  }

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
          onClick={() => setCurrentStep('template')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-bold">Capture Photos</h2>
          <p className="text-sm text-muted-foreground">
            Frame {Math.min(currentFrameIndex + 1, totalFrames)} of {totalFrames}
          </p>
        </div>
        <div className="w-20" />
      </div>

      {/* Main content */}
      <div className="max-w-2xl mx-auto">
        {!showPreview ? (
          <div className="space-y-6">
            {/* Camera container - HALF SIZE */}
            <div className="relative mx-auto" style={{ maxWidth: '400px' }}>
              <div className="relative aspect-[3/4] bg-black rounded-2xl overflow-hidden shadow-2xl">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={1}
                  videoConstraints={{ facingMode }}
                  className="w-full h-full object-cover"
                />

                {/* Countdown overlay */}
                <AnimatePresence>
                  {isCapturing && countdown > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50"
                    >
                      <motion.div
                        key={countdown}
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="text-8xl font-bold text-white"
                      >
                        {countdown}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Captured frames indicator */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {Array.from({ length: totalFrames }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < capturedImages.length ? 'bg-green-500' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleCamera}
                className="w-12 h-12 rounded-full"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCapture}
                disabled={isCapturing || isComplete}
                className="w-16 h-16 rounded-full bg-white border-4 border-primary flex items-center justify-center disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-full bg-primary" />
              </motion.button>

              <div className="w-12" />
            </div>

            <p className="text-center text-muted-foreground">
              {isCapturing
                ? 'Get ready...'
                : isComplete
                ? 'All frames captured!'
                : 'Click the button to capture'}
            </p>
          </div>
        ) : (
          /* Preview mode */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-center">Preview Your Photos</h3>

            {/* Preview grid */}
            <div className={`grid gap-4 ${
              totalFrames === 1
                ? 'grid-cols-1 max-w-xs mx-auto'
                : totalFrames === 3
                ? 'grid-cols-1 max-w-xs mx-auto'
                : 'grid-cols-2 max-w-sm mx-auto'
            }`}>
              {capturedImages.map((img, index) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <img
                      src={img.dataUrl}
                      alt={`Captured ${index + 1}`}
                      className="w-full aspect-[4/3] object-cover"
                    />
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleRetake}
                className="px-8"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Retake
              </Button>
              <Button
                size="lg"
                onClick={handleContinue}
                className="px-8"
              >
                <Check className="w-5 h-5 mr-2" />
                Continue to Editor
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
