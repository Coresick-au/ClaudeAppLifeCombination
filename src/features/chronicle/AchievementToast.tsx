import { useState, useEffect, useCallback, memo } from 'react';

interface AchievementToastProps {
  title: string;
  description: string;
  icon: string;
  onDismiss: () => void;
}

export const AchievementToast = memo(function AchievementToast({
  title,
  description,
  icon,
  onDismiss,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Slide in
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    // Auto dismiss after 4 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300);
    }, 4000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  }, [onDismiss]);

  return (
    <div
      className={`fixed top-4 right-4 z-[200] max-w-sm transition-all duration-300 ${
        isVisible
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <button
        onClick={handleDismiss}
        className="w-full bg-[var(--color-surface-card)] border-2 border-accent rounded-xl p-4 shadow-lg shadow-accent/20 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <p className="font-rpg text-[0.6rem] text-accent leading-tight">
              ACHIEVEMENT UNLOCKED
            </p>
            <p className="font-display font-bold text-text-primary mt-1">
              {title}
            </p>
            <p className="text-sm text-text-secondary mt-0.5">
              {description}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
});
