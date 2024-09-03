import { useState, useEffect } from 'react';

export const useTypedText = (
  isAnimationComplete: boolean,
  isVisible: boolean,
  fullText: string = 'Writ 99',
  typingSpeed: number = 150
) => {
  const [typedText, setTypedText] = useState<string>('');

  useEffect(() => {
    if (!isAnimationComplete || !isVisible) {
      setTypedText('');
      return;
    }

    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, typingSpeed);

      return () => clearTimeout(timeout);
    }
  }, [isAnimationComplete, isVisible, typedText, fullText, typingSpeed]);

  const resetText = () => {
    setTypedText('');
  };

  return { typedText, resetText };
};