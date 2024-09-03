import React, { useState, useEffect, useCallback } from 'react';

interface TypedTextProps {
  isAboutUsVisible: boolean;
  isLogoAnimationComplete: boolean;
  isDarkMode: boolean;
  aboutUsContent: string;
}

export const TypedText: React.FC<TypedTextProps> = ({
  isAboutUsVisible,
  isLogoAnimationComplete,
  isDarkMode,
  aboutUsContent,
}) => {
  const [typedText, setTypedText] = useState<string>('');
  const [isBackspacing, setIsBackspacing] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<
    'initial' | 'backspace' | 'aboutUsTitle' | 'aboutUsContent'
  >('initial');

  const getTypingSpeed = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    return {
      h1: isMobile ? 50 : 100,
      p: isMobile ? 0.5 : 1,
      backspace: isMobile ? 25 : 50,
    };
  }, []);

  useEffect(() => {
    if (!isLogoAnimationComplete) {
      setTypedText('');
      return;
    }

    if (isAboutUsVisible && currentPhase === 'initial') {
      setIsBackspacing(true);
      setCurrentPhase('backspace');
    }

    const { h1: h1TypingSpeed, p: pTypingSpeed, backspace: backspaceSpeed } = getTypingSpeed();

    let timeout: NodeJS.Timeout;

    if (currentPhase === 'initial' && typedText.length < 'Writ 99'.length) {
      timeout = setTimeout(() => {
        setTypedText('Writ 99'.slice(0, typedText.length + 1));
      }, h1TypingSpeed);
    } else if (isBackspacing) {
      if (typedText.length > 0) {
        timeout = setTimeout(() => {
          setTypedText(typedText.slice(0, -1));
        }, backspaceSpeed);
      } else {
        setIsBackspacing(false);
        setCurrentPhase('aboutUsTitle');
      }
    } else if (
      currentPhase === 'aboutUsTitle' &&
      typedText.length < 'About Us'.length
    ) {
      timeout = setTimeout(() => {
        setTypedText('About Us'.slice(0, typedText.length + 1));
      }, h1TypingSpeed);
    } else if (currentPhase === 'aboutUsTitle' && typedText === 'About Us') {
      setCurrentPhase('aboutUsContent');
      setTypedText('About Us\n');
    } else if (
      currentPhase === 'aboutUsContent' &&
      typedText.length < aboutUsContent.length + 'About Us\n'.length
    ) {
      timeout = setTimeout(() => {
        setTypedText(
          (prev) => prev + aboutUsContent[prev.length - 'About Us\n'.length]
        );
      }, pTypingSpeed);
    }

    return () => clearTimeout(timeout);
  }, [
    isLogoAnimationComplete,
    isAboutUsVisible,
    typedText,
    currentPhase,
    aboutUsContent,
    isBackspacing,
    getTypingSpeed,
  ]);

  return (
    <div className="text-center px-4 sm:px-6 lg:px-8">
      <h1 className=" text-[72px] sm:text-[80px] md:text-[80px] lg:text-[96px] font-bold font-['Saira',_sans-serif] mb-4 leading-tight">
        {typedText.split('\n')[0]}
        {(currentPhase === 'initial' ||
          currentPhase === 'backspace' ||
          currentPhase === 'aboutUsTitle') && (
          <span
            className={`border-r-2 ${
              isDarkMode ? 'border-white' : 'border-black'
            } animate-blink`}
          />
        )}
      </h1>
      {currentPhase === 'aboutUsContent' && (
        <p className="text-base sm:text-lg md:text-xl font-normal font-[sans-serif] text-left whitespace-pre-line leading-relaxed mt-4">
          {typedText.split('\n').slice(1).join('\n')}
          <span
            className={`border-r-2 ${
              isDarkMode ? 'border-white' : 'border-black'
            } animate-blink`}
          />
        </p>
      )}
    </div>
  );
};