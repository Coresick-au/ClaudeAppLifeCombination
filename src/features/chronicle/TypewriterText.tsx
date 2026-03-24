import { useState, useEffect, useRef, memo } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText = memo(function TypewriterText({
  text,
  speed = 30,
  onComplete,
  className = '',
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        onComplete?.();
      } else {
        setDisplayedText(text.slice(0, indexRef.current));
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, speed, onComplete]);

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayedText(text);
    setIsComplete(true);
    onComplete?.();
  };

  return (
    <div className={`relative ${className}`}>
      <p className="font-serif text-lg leading-relaxed text-text-primary">
        {displayedText}
        {!isComplete && (
          <span className="inline-block w-2 h-5 ml-1 bg-accent animate-pulse align-middle" />
        )}
      </p>
      {!isComplete && (
        <button
          onClick={handleSkip}
          className="absolute top-0 right-0 text-xs text-text-secondary hover:text-accent transition-colors"
        >
          Skip ▶
        </button>
      )}
    </div>
  );
});
