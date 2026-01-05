import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EnhancedDocumentRenderer from '../components/EnhancedDocumentRenderer';
import './DocumentViewerPage.css';

const DocumentViewerPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [documentContent, setDocumentContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('文档查看器');
  const [documentPath, setDocumentPath] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // 检查文件扩展名是否为Markdown
  const checkIfMarkdown = (path) => {
    return /\.md$|\.markdown$/i.test(path);
  };

  // 从Capacitor接收外部文件事件
  useEffect(() => {
    const handleDocumentFileOpened = (event) => {
      const { uri, content } = event.detail;
      setDocumentContent(content);
      setDocumentPath(uri);
      setIsMarkdown(checkIfMarkdown(uri));
      setDocumentTitle(uri.split('/').pop() || '外部文档');
    };

    window.addEventListener('documentFileOpened', handleDocumentFileOpened);
    
    // 清理事件监听器
    return () => {
      window.removeEventListener('documentFileOpened', handleDocumentFileOpened);
    };
  }, []);

  // 处理路由参数中的文档内容
  useEffect(() => {
    if (location.state?.content) {
      setDocumentContent(location.state.content);
      setDocumentTitle(location.state.title || '文档');
      setDocumentPath(location.state.path || '');
      setIsMarkdown(checkIfMarkdown(location.state.path || ''));
      setScrollPosition(location.state.scrollPosition || 0);
    }
  }, [location.state]);

  // 恢复滚动位置
  useEffect(() => {
    if (contentRef.current && scrollPosition > 0) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [documentContent, scrollPosition]);

  // 保存滚动位置
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop);
    }
  }, []);

  // 读取本地文件
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setDocumentContent(content);
        setDocumentTitle(file.name);
        setDocumentPath(file.name);
        setIsMarkdown(checkIfMarkdown(file.name));
      };
      reader.readAsText(file);
    }
  };

  // 选择文件
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 保存当前文档状态到历史记录
  const saveToHistory = () => {
    if (documentContent && documentPath) {
      const historyItem = {
        path: documentPath,
        title: documentTitle,
        content: documentContent,
        scrollPosition: scrollPosition,
        timestamp: new Date().toISOString()
      };
      
      // 保存到localStorage
      const history = JSON.parse(localStorage.getItem('documentHistory') || '[]');
      // 检查是否已存在，如果存在则更新
      const existingIndex = history.findIndex(item => item.path === documentPath);
      if (existingIndex !== -1) {
        history[existingIndex] = historyItem;
      } else {
        history.unshift(historyItem);
      }
      
      // 限制历史记录数量
      if (history.length > 10) {
        history.length = 10;
      }
      
      localStorage.setItem('documentHistory', JSON.stringify(history));
    }
  };

  // 保存当前状态
  useEffect(() => {
    saveToHistory();
  }, [documentContent, documentPath, scrollPosition]);

  // 渲染文档内容
  const renderDocumentContent = () => {
    return (
      <EnhancedDocumentRenderer
        content={documentContent}
        isMarkdown={isMarkdown}
        theme={theme}
      />
    );
  };

  return (
    <div className={`document-viewer-page ${theme}`}>
      <div className="document-viewer-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-icon">←</span>
          返回
        </button>
        <h1 className="document-title">{documentTitle}</h1>
        <button className="select-file-button" onClick={handleSelectFile}>
          选择文件
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".txt,.md,.markdown"
          onChange={handleFileChange}
        />
      </div>
      
      <div 
        ref={contentRef}
        className={`document-content-container ${theme}`}
        onScroll={handleScroll}
      >
        {documentContent ? (
          renderDocumentContent()
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p>请选择或打开一个文档文件</p>
            <p className="empty-subtext">支持 .txt 和 .md 文件格式</p>
            <button className="open-file-button" onClick={handleSelectFile}>
              选择文件
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewerPage;