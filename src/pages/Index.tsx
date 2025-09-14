import React, { useState } from 'react';
import { GroundwaterChat } from '@/components/GroundwaterChat';

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <GroundwaterChat 
        language={language} 
        onLanguageChange={setLanguage} 
      />
    </div>
  );
};

export default Index;
