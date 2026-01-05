import React from 'react';
import { useTheme } from '../context/ThemeContext';
import DocumentHistoryManager from '../components/DocumentHistoryManager';
import './DocumentHistoryPage.css';

const DocumentHistoryPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`document-history-page ${theme}`}>
      <div className="document-history-header">
        <h1>文档历史</h1>
      </div>
      <div className="document-history-content">
        <DocumentHistoryManager />
      </div>
    </div>
  );
};

export default DocumentHistoryPage;