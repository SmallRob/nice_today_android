import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './EnhancedDocumentRenderer.css';

const EnhancedDocumentRenderer = ({ content, isMarkdown, theme }) => {
  if (isMarkdown) {
    return (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        className={`enhanced-markdown-content ${theme}`}
        components={{
          // 自定义渲染组件以增强样式
          h1: ({ node, ...props }) => <h1 className="enhanced-h1" {...props} />,
          h2: ({ node, ...props }) => <h2 className="enhanced-h2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="enhanced-h3" {...props} />,
          h4: ({ node, ...props }) => <h4 className="enhanced-h4" {...props} />,
          h5: ({ node, ...props }) => <h5 className="enhanced-h5" {...props} />,
          h6: ({ node, ...props }) => <h6 className="enhanced-h6" {...props} />,
          p: ({ node, ...props }) => <p className="enhanced-p" {...props} />,
          ul: ({ node, ...props }) => <ul className="enhanced-ul" {...props} />,
          ol: ({ node, ...props }) => <ol className="enhanced-ol" {...props} />,
          li: ({ node, ...props }) => <li className="enhanced-li" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="enhanced-blockquote" {...props} />,
          code: ({ node, inline, ...props }) => {
            if (inline) {
              return <code className="enhanced-inline-code" {...props} />;
            } else {
              return <code className="enhanced-block-code" {...props} />;
            }
          },
          pre: ({ node, ...props }) => <pre className="enhanced-pre" {...props} />,
          strong: ({ node, ...props }) => <strong className="enhanced-strong" {...props} />,
          em: ({ node, ...props }) => <em className="enhanced-em" {...props} />,
          a: ({ node, ...props }) => <a className="enhanced-a" target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ node, ...props }) => <img className="enhanced-img" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    );
  } else {
    return (
      <pre className={`enhanced-text-content ${theme}`}>
        {content}
      </pre>
    );
  }
};

export default EnhancedDocumentRenderer;