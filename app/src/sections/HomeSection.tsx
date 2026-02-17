import { motion } from 'framer-motion';
import { Camera, Moon, Sun, Sparkles, Image, Sticker, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useStore } from '@/store/useStore';

const stats = [
  { icon: Image, label: 'Templates', value: '15+' },
  { icon: Sparkles, label: 'Filters', value: '20+' },
  { icon: Sticker, label: 'Stickers', value: '50+' },
  { icon: Type, label: 'Fonts', value: '10+' },
];

export function HomeSection() {
  const { isDarkMode, toggleDarkMode, setCurrentStep } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-full bg-card border border-border hover:bg-accent transition-colors"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-600" />
        )}
      </button>

      {/* Main content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center z-10"
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl">
            <Camera className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          PhotoBooth
        </h1>
        <p className="text-xl text-muted-foreground mb-12 max-w-md mx-auto">
          Capture moments, add creative filters, and make memories that last forever
        </p>

        {/* Start button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={() => setCurrentStep('template')}
            className="px-12 py-6 text-xl font-semibold rounded-full shadow-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
          >
            <Camera className="w-6 h-6 mr-3" />
            Start Capture
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats dashboard */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 z-10"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <Card className="p-6 text-center hover:shadow-lg transition-shadow border-border/50 bg-card/80 backdrop-blur-sm">
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-sm text-muted-foreground"
      >
        Built with React + Canvas API
      </motion.p>
    </motion.div>
  );
}
