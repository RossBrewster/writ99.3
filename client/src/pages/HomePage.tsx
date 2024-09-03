import React, { useState, useEffect } from 'react';
import { DarkModeToggle } from '../components/shared/DarkModeToggle';
import { Logo } from '../components/shared/Logo';
import { TypedText } from '../components/TypedText';
import { useDarkMode } from '../contexts/DarkModeContext'; // Updated import
import { ButtonData } from '../types/types';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode(); // Updated to use the new context
  const [isLogoAnimationComplete, setIsLogoAnimationComplete] = useState(false);
  const [isAboutUsVisible, setIsAboutUsVisible] = useState(false);

  const buttons: ButtonData[] = [
    { text: 'Teachers', color: '#EA4335' },
    { text: 'Students', color: '#34A853' },
    { text: 'Sign Up', color: '#FBBC05' },
    { text: 'About Us', color: '#4285F4' },
  ];

  const aboutUsContent = `Writ99 is a cutting-edge educational technology startup that leverages state of the art transformer models to aid the writing assessment process in schools. Our innovative platform automates grading and delivers personalized feedback, addressing the inefficiencies and potential biases inherent in traditional evaluation methods.

  We aim to empower students with unprecedented opportunities for writing practice and improvement. By automating the grading process and providing instant, constructive feedback, Writ99 enables students to write more frequently and learn more rapidly than ever before. This approach not only streamlines educators' workloads but also creates a dynamic, engaging environment where students can continuously hone their writing skills.

  Writ99's AI-driven platform allows students to engage in writing exercises at a volume and frequency that would be impossible with traditional grading methods. By providing immediate, objective evaluations and detailed feedback, our system encourages students to write more often, experiment with different styles, and rapidly iterate on their work. This increased practice leads to faster skill development and greater confidence in writing abilities.

  For educators, our platform offers invaluable insights into student progress and areas needing attention, all while dramatically reducing grading time. This allows teachers to focus on high-impact instructional activities and provide more targeted, personalized guidance to their students.

  At Writ99, we believe in the power of technology to create inclusive and individualized learning experiences. Our commitment to continuous innovation ensures that our platform evolves to meet the changing demands of educators and students, ultimately enhancing the educational journey for all stakeholders.`;


  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLogoAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleButtonClick = (buttonText: string) => {
    switch (buttonText) {
      case 'About Us':
        setIsAboutUsVisible(true);
        break;
      case 'Students':
      case 'Teachers':
        navigate('/login', { state: { userType: buttonText.toLowerCase() } });
        break;
      case 'Sign Up':
        navigate('/register');
        break;
      default:
        console.log(`Button clicked: ${buttonText}`);
    }
  };

  return (
    <div className={`w-full min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'} font-sans transition-colors duration-300 flex flex-col items-center`}>
      <DarkModeToggle /> {/* Updated: removed props as they're now handled internally */}
      <div className="w-full max-w-4xl mx-auto py-20 px-4 flex flex-col items-center">
        <div className={`w-full flex justify-center mb-8 ${isAboutUsVisible ? 'relative' : 'sticky top-20'}`}>
          <Logo onButtonClick={handleButtonClick} buttons={buttons} />
        </div>
        <TypedText
          isAboutUsVisible={isAboutUsVisible}
          isLogoAnimationComplete={isLogoAnimationComplete}
          isDarkMode={isDarkMode}
          aboutUsContent={aboutUsContent}
        />
      </div>
      <style>{`
        @keyframes blink {
          from, to { border-color: transparent }
          50% { border-color: ${isDarkMode ? '#ffffff' : '#000000'} }
        }
        .animate-blink {
          animation: blink 0.7s step-end infinite;
        }
      `}</style>
    </div>
  );
};