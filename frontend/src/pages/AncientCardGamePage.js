import React from 'react';
import { useTheme } from '../context/ThemeContext';
import AncientCardGame from '../components/ancientCardGame/AncientCardGame.tsx';

// Wrapper page component for lazy loading
const AncientCardGamePage = () => {
  return (
    <div className="page-container">
      <AncientCardGame />
    </div>
  );
};

export default AncientCardGamePage;