import React, { useState, useEffect } from 'react';
import LanguagePicker from './components/LanguagePicker';
import RoleSelector from './components/RoleSelector';
import RefugeeDashboard from './components/RefugeeDashboard';
import HostPanel from './components/HostPanel';
import FoodPanel from './components/FoodPanel';
import DoctorRegister from './components/DoctorRegister';
import CustomCursor from './components/CustomCursor';
import OfflineBanner from './components/OfflineBanner';

function App() {
  const [language, setLanguage] = useState(null);
  const [role, setRole] = useState(null);

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
  };

  useEffect(() => {
    // Automatically switch HTML dir to RTL for Arabic (ar) or Dari/Farsi (fa)
    if (language === 'ar' || language === 'fa' || language === 'fa-AF') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);


  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole);
  };

  const handleBackToLanguage = () => {
    setLanguage(null);
  };

  // Main UI routing wrapper
  const renderContent = () => {
    if (!language) {
      return <LanguagePicker onSelectLanguage={handleSelectLanguage} />;
    }

    if (!role) {
      return <RoleSelector onSelectRole={handleSelectRole} onBack={handleBackToLanguage} />;
    }

    const handleBackToRole = () => setRole(null);

    switch (role) {
      case 'refugee': return <RefugeeDashboard onBack={handleBackToRole} />;
      case 'host': return <HostPanel />;
      case 'restaurant': return <FoodPanel />;
      case 'doctor': return <DoctorRegister />;
      default: return <RoleSelector onSelectRole={handleSelectRole} onBack={handleBackToLanguage} />;
    }
  };

  return (
    <>
      <OfflineBanner />
      <CustomCursor />
      {renderContent()}
    </>
  );
}

export default App;
