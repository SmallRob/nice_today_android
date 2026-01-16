import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import EnhancedDocumentRenderer from '../components/EnhancedDocumentRenderer';
import { readFileWithEncodingDetection, readFileWithMultipleEncodings } from '../utils/textEncodingDetector';
import './UnifiedDocumentViewerPage.css';

const UnifiedDocumentViewerPage = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 当前文档状态
  const [documentContent, setDocumentContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('文档阅读器');
  const [documentPath, setDocumentPath] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  // 界面状态
  const [activeTab, setActiveTab] = useState('viewer'); // 'viewer', 'list', 'history'
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  
  // 文档列表和历史记录
  const [documentList, setDocumentList] = useState([]);
  const [documentHistory, setDocumentHistory] = useState([]);

  // 检查文件扩展名是否为Markdown
  const checkIfMarkdown = (path) => {
    return /\.md$|\.markdown$/i.test(path);
  };

  // 清理历史记录数据，移除不必要的内容字段
  const cleanHistoryData = (history) => {
    return history.map(item => {
      // 只保留必要的字段，移除可能很大的content字段
      return {
        path: item.path,
        title: item.title,
        scrollPosition: item.scrollPosition || 0,
        timestamp: item.timestamp,
        isMarkdown: item.isMarkdown,
        folderName: item.folderName,
        addedAt: item.addedAt
        // 不包含 content 字段以节省空间
      };
    });
  };
  
  // 加载文档列表
  useEffect(() => {
    const storedList = JSON.parse(localStorage.getItem('documentList') || '[]');
    setDocumentList(storedList);
    
    let storedHistory = JSON.parse(localStorage.getItem('documentHistory') || '[]');
    // 清理历史记录数据，移除可能占用大量空间的内容字段
    storedHistory = cleanHistoryData(storedHistory);
    setDocumentHistory(storedHistory);
  }, []);

  // 保存文档列表到localStorage，带错误处理
  const saveDocumentList = useCallback((list) => {
    try {
      // 检查localStorage容量
      const serializedList = JSON.stringify(list);
      localStorage.setItem('documentList', serializedList);
    } catch (error) {
      console.error('保存文档列表到localStorage失败:', error);
      // 如果存储失败，尝试减少列表大小
      if (list.length > 10) {
        const reducedList = list.slice(0, 10);
        try {
          localStorage.setItem('documentList', JSON.stringify(reducedList));
        } catch (e) {
          console.error('减少列表大小后仍然无法保存:', e);
        }
      }
    }
  }, []);

  // 保存历史记录到localStorage，带错误处理
  const saveDocumentHistory = useCallback((history) => {
    try {
      // 检查localStorage容量
      const serializedHistory = JSON.stringify(history);
      localStorage.setItem('documentHistory', serializedHistory);
    } catch (error) {
      console.error('保存历史记录到localStorage失败:', error);
      // 如果存储失败，尝试减少历史记录大小
      if (history.length > 5) {
        const reducedHistory = history.slice(0, 5);
        try {
          localStorage.setItem('documentHistory', JSON.stringify(reducedHistory));
        } catch (e) {
          console.error('减少历史记录大小后仍然无法保存:', e);
        }
      }
    }
  }, []);

  // 添加文档到列表
  const addDocumentToList = useCallback((doc) => {
    setDocumentList(prevList => {
      const existingIndex = prevList.findIndex(item => item.path === doc.path);
      let newList;
      
      if (existingIndex !== -1) {
        // 更新已存在的文档
        newList = [...prevList];
        newList[existingIndex] = doc;
      } else {
        // 添加新文档
        newList = [doc, ...prevList];
      }
      
      // 限制列表数量
      if (newList.length > 50) {
        newList = newList.slice(0, 50);
      }
      
      saveDocumentList(newList);
      return newList;
    });
  }, [saveDocumentList]);

  // 添加到历史记录
  const addToHistory = useCallback((doc) => {
    setDocumentHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(item => item.path === doc.path);
      let newHistory;
      
      // 创建历史记录项，不包含完整内容以节省空间
      const historyItem = {
        path: doc.path,
        title: doc.title,
        scrollPosition: doc.scrollPosition || 0,
        timestamp: new Date().toISOString(),
        isMarkdown: doc.isMarkdown,
        folderName: doc.folderName,
        addedAt: doc.addedAt
      };
      
      if (existingIndex !== -1) {
        // 更新已存在的记录
        newHistory = [...prevHistory];
        newHistory[existingIndex] = {
          ...newHistory[existingIndex],
          ...historyItem
        };
      } else {
        // 添加新记录
        newHistory = [historyItem, ...prevHistory];
      }
      
      // 限制历史记录数量
      if (newHistory.length > 20) {
        newHistory = newHistory.slice(0, 20);
      }
      
      saveDocumentHistory(newHistory);
      return newHistory;
    });
  }, [saveDocumentHistory]);

  // 从Capacitor接收外部文件事件
  useEffect(() => {
    const handleDocumentFileOpened = (event) => {
      const { uri, content } = event.detail;
      setDocumentContent(content);
      setDocumentPath(uri);
      setIsMarkdown(checkIfMarkdown(uri));
      setDocumentTitle(uri.split('/').pop() || '外部文档');
      setActiveTab('viewer');
    };

    window.addEventListener('documentFileOpened', handleDocumentFileOpened);
    
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
      setActiveTab('viewer');
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

  // 读取本地文件（优化中文编码）
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        let content;
        
        // 优先使用智能编码检测
        try {
          content = await readFileWithEncodingDetection(file);
        } catch (error) {
          console.warn('自动编码检测失败，尝试多种编码', error);
          // 回退到多种编码尝试
          content = await readFileWithMultipleEncodings(file);
        }
        
        setDocumentContent(content);
        setDocumentTitle(file.name);
        setDocumentPath(file.name);
        setIsMarkdown(checkIfMarkdown(file.name));
        setActiveTab('viewer');
        
        // 添加到文档列表
        addDocumentToList({
          path: file.name,
          title: file.name,
          content: content,
          isMarkdown: checkIfMarkdown(file.name),
          folderName: '本地文件',
          addedAt: new Date().toISOString()
        });
        
        // 添加到历史记录
        addToHistory({
          path: file.name,
          title: file.name,
          scrollPosition: 0,
          isMarkdown: checkIfMarkdown(file.name)
        });
      } catch (error) {
        console.error('读取文件失败:', error);
        alert('读取文件失败，请检查文件格式');
      }
    }
  };

  // 处理文件夹选择
  const handleFolderChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const folderName = files[0].webkitRelativePath.split('/')[0] || '未命名文件夹';
      const newDocs = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 只处理文本文件
        const isTextFile = /\.(txt|md|markdown|json|xml|html|css|js|java|py|c|h|cpp|go|rs|rb|php|sh|bat|log|csv)$/i.test(file.name);
        
        if (isTextFile) {
          try {
            let content;
            try {
              content = await readFileWithEncodingDetection(file);
            } catch (error) {
              content = await readFileWithMultipleEncodings(file);
            }
            
            newDocs.push({
              path: file.webkitRelativePath,
              title: file.name,
              content: content,
              isMarkdown: checkIfMarkdown(file.name),
              folderName: folderName,
              addedAt: new Date().toISOString()
            });
          } catch (error) {
            console.error(`读取文件 ${file.name} 失败:`, error);
          }
        }
      }
      
      if (newDocs.length > 0) {
        setDocumentList(prevList => {
          // 去重：根据路径判断是否已存在
          const existingPaths = new Set(prevList.map(doc => doc.path));
          const uniqueNewDocs = newDocs.filter(doc => !existingPaths.has(doc.path));
          const mergedList = [...uniqueNewDocs, ...prevList];
          
          // 限制总数
          const limitedList = mergedList.length > 50 ? mergedList.slice(0, 50) : mergedList;
          
          saveDocumentList(limitedList);
          return limitedList;
        });
        
        setActiveTab('list');
        alert(`成功导入 ${newDocs.length} 个文本文件`);
      } else {
        alert('未找到支持的文本文件');
      }
    }
  };

  // 选择单个文件
  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 选择文件夹
  const handleSelectFolder = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  // 从文档列表打开文档
  const handleOpenFromList = (doc) => {
    setDocumentContent(doc.content);
    setDocumentTitle(doc.title);
    setDocumentPath(doc.path);
    setIsMarkdown(doc.isMarkdown);
    setScrollPosition(doc.scrollPosition || 0);
    setActiveTab('viewer');
    
    // 添加到历史记录（只包含必要信息，不包含完整内容）
    addToHistory({
      path: doc.path,
      title: doc.title,
      scrollPosition: doc.scrollPosition || 0,
      isMarkdown: doc.isMarkdown,
      folderName: doc.folderName,
      addedAt: doc.addedAt
    });
  };

  // 从历史记录打开文档
  const handleOpenFromHistory = (historyItem) => {
    // 检查文档是否在文档列表中，以获取完整内容
    const docInList = documentList.find(doc => doc.path === historyItem.path);
    
    if (docInList) {
      // 如果在文档列表中，使用列表中的内容
      setDocumentContent(docInList.content);
      setIsMarkdown(docInList.isMarkdown);
    } else {
      // 如果不在列表中，尝试从localStorage中获取内容（如果有的话）
      // 这种情况应该很少发生，因为文档内容不再存储在历史记录中
      setDocumentContent(historyItem.content || '');
      setIsMarkdown(historyItem.isMarkdown);
    }
    
    setDocumentTitle(historyItem.title);
    setDocumentPath(historyItem.path);
    setScrollPosition(historyItem.scrollPosition || 0);
    setActiveTab('viewer');
  };

  // 删除文档列表项
  const handleDeleteFromList = (path) => {
    setDocumentList(prevList => {
      const newList = prevList.filter(doc => doc.path !== path);
      saveDocumentList(newList);
      return newList;
    });
  };

  // 清空文档列表
  const handleClearList = () => {
    if (window.confirm('确定要清空文档列表吗？')) {
      setDocumentList([]);
      saveDocumentList([]);
    }
  };

  // 删除历史记录项
  const handleDeleteFromHistory = (path) => {
    setDocumentHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.path !== path);
      saveDocumentHistory(newHistory);
      return newHistory;
    });
  };

  // 清空历史记录
  const handleClearHistory = () => {
    if (window.confirm('确定要清空历史记录吗？')) {
      setDocumentHistory([]);
      saveDocumentHistory([]);
    }
  };

  // 格式化时间
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  // 按文件夹分组文档列表
  const groupedDocumentList = documentList.reduce((groups, doc) => {
    const folder = doc.folderName || '未分类';
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(doc);
    return groups;
  }, {});

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

  // 渲染文档列表
  const renderDocumentList = () => {
    if (Object.keys(groupedDocumentList).length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <p>文档列表为空</p>
          <p className="empty-subtext">选择文件夹导入文档，或选择单个文件</p>
          <div className="button-group">
            <button className="primary-button" onClick={handleSelectFolder}>
              选择文件夹
            </button>
            <button className="secondary-button" onClick={handleSelectFile}>
              选择文件
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="document-list-container">
        <div className="list-header">
          <h2>文档列表 ({documentList.length})</h2>
          {documentList.length > 0 && (
            <button className="clear-button" onClick={handleClearList}>
              清空列表
            </button>
          )}
        </div>
        
        {Object.entries(groupedDocumentList).map(([folder, docs]) => (
          <div key={folder} className="folder-section">
            <h3 className="folder-name">{folder}</h3>
            <ul className="document-list">
              {docs.map((doc, index) => (
                <li key={`${doc.path}-${index}`} className="document-item">
                  <div className="document-item-content" onClick={() => handleOpenFromList(doc)}>
                    <div className="document-item-icon">
                      {doc.isMarkdown ? '📝' : '📄'}
                    </div>
                    <div className="document-item-info">
                      <div className="document-item-title">{doc.title}</div>
                      <div className="document-item-path">{doc.path}</div>
                      <div className="document-item-time">
                        {formatDate(doc.addedAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFromList(doc.path)}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        <div className="list-footer">
          <button className="primary-button" onClick={handleSelectFolder}>
            添加文件夹
          </button>
          <button className="secondary-button" onClick={handleSelectFile}>
            添加文件
          </button>
        </div>
      </div>
    );
  };

  // 渲染历史记录
  const renderHistory = () => {
    if (documentHistory.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>暂无历史记录</p>
          <p className="empty-subtext">阅读过的文档会显示在这里</p>
        </div>
      );
    }

    return (
      <div className="history-container">
        <div className="history-header">
          <h2>历史记录 ({documentHistory.length})</h2>
          {documentHistory.length > 0 && (
            <button className="clear-button" onClick={handleClearHistory}>
              清空历史
            </button>
          )}
        </div>
        
        <ul className="history-list">
          {documentHistory.map((item, index) => (
            <li key={`${item.path}-${index}`} className="history-item">
              <div
                className="history-item-content"
                onClick={() => handleOpenFromHistory(item)}
              >
                <div className="history-item-icon">
                  {checkIfMarkdown(item.path) ? '📝' : '📄'}
                </div>
                <div className="history-item-info">
                  <div className="history-item-title">{item.title}</div>
                  <div className="history-item-path">{item.path}</div>
                  <div className="history-item-time">
                    {formatDate(item.timestamp)}
                  </div>
                </div>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDeleteFromHistory(item.path)}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`unified-document-viewer ${theme}`}>
      <div className="sticky-header">
        {/* 固定的顶部导航栏 - 包含文本阅读和本地文档功能 */}
        <div className="top-nav">
          <button 
            className={`nav-button ${activeTab === 'viewer' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('viewer');
              setDocumentContent('');
              setDocumentTitle('文本阅读');
            }}
          >
            <span className="nav-icon">📖</span>
            <span className="nav-text">文本阅读</span>
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'list' ? 'active' : ''}`} 
            onClick={() => {
              setActiveTab('list');
              setDocumentContent('');
              setDocumentTitle('本地文档');
            }}
          >
            <span className="nav-icon">📁</span>
            <span className="nav-text">本地文档</span>
          </button>
          
          <button 
            className={`nav-button ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">🕒</span>
            <span className="nav-text">历史记录</span>
          </button>
        </div>
        
        {/* 条件显示文档标题和操作按钮 */}
        {activeTab === 'viewer' && documentContent && (
          <div className="viewer-header">
            <div className="file-name-header">
              <h1 className="header-title">{documentTitle}</h1>
            </div>
            <div className="header-actions-row">
              <button className="back-button" onClick={() => {
                setDocumentContent('');
                setDocumentTitle('文本阅读');
              }}>
                <span className="back-icon">←</span>
                返回
              </button>
              <button className="select-file-button" onClick={handleSelectFile}>
                打开文件
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="viewer-content">
        {activeTab === 'viewer' ? (
          <div
            ref={contentRef}
            className={`document-content-container ${theme}`}
            onScroll={handleScroll}
          >
            {documentContent ? (
              renderDocumentContent()
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📖</div>
                <p>请选择或打开一个文档文件</p>
                <p className="empty-subtext">支持 .txt 和 .md 文件格式</p>
                <div className="button-group">
                  <button className="primary-button" onClick={handleSelectFile}>
                    选择文件
                  </button>
                  <button className="secondary-button" onClick={handleSelectFolder}>
                    选择文件夹
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'list' ? (
          renderDocumentList()
        ) : (
          renderHistory()
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".txt,.md,.markdown,.json,.xml,.html,.css,.js,.java,.py,.c,.h,.cpp,.go,.rs,.rb,.php,.sh,.bat,.log,.csv"
        onChange={handleFileChange}
      />

      <input
        type="file"
        ref={folderInputRef}
        style={{ display: 'none' }}
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleFolderChange}
      />
    </div>
  );
};

export default UnifiedDocumentViewerPage;
