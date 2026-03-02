import React, { useState } from 'react';
import LanguagePicker from './components/LanguagePicker';
import RoleSelector from './components/RoleSelector';
import RefugeeDashboard from './components/RefugeeDashboard';
import HostPanel from './components/HostPanel';
import FoodPanel from './components/FoodPanel';
import DoctorRegister from './components/DoctorRegister';
import CustomCursor from './components/CustomCursor';

function App() {
  const [language, setLanguage] = useState(null);
  const [role, setRole] = useState(null);

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
  };

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

    switch (role) {
      case 'refugee': return <RefugeeDashboard />;
      case 'host': return <HostPanel />;
      case 'restaurant': return <FoodPanel />;
      case 'doctor': return <DoctorRegister />;
      default: return <RoleSelector onSelectRole={handleSelectRole} onBack={handleBackToLanguage} />;
    }
  };

  return (
    <>
      <CustomCursor />
      {renderContent()}
    </>
  );
}

export default App;
