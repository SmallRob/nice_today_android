import React, { useState, useEffect, useRef } from 'react';
import './FeatureDragPanel.css';

/**
 * 功能入口上拉/收起面板组件
 */
const FeatureDragPanel = ({ children, maxHeight = '1000px', minHeight = '320px', externalIsExpanded, onToggle }) => {
    const isExpanded = externalIsExpanded;
    const [dragStartY, setDragStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const panelRef = useRef(null);

    const handleTouchStart = (e) => {
        setDragStartY(e.touches[0].clientY);
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - dragStartY;

        // 限制拖拽方向和距离，防止过度拖拽
        if (isExpanded) {
            // 展开状态下，只有向下拖拽才有效
            if (deltaY > 0) {
                setCurrentY(deltaY);
            }
        } else {
            // 收起状态下，只有向上拖拽才有效
            if (deltaY < 0) {
                setCurrentY(deltaY);
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        const threshold = 50; // 触发切换的阈值
        if (Math.abs(currentY) > threshold) {
            if (isExpanded && currentY > threshold) {
                onToggle(false);
            } else if (!isExpanded && currentY < -threshold) {
                onToggle(true);
            }
        }
        setCurrentY(0);
    };

    const toggleExpand = () => {
        onToggle(!isExpanded);
    };

    return (
        <div
            ref={panelRef}
            className={`features-drag-panel ${isExpanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
            style={{
                maxHeight: isExpanded ? maxHeight : minHeight,
                transform: isDragging ? `translateY(${currentY}px)` : 'none'
            }}
        >
            <div
                className="drag-indicator-wrapper"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={toggleExpand}
            >
                <div className="drag-indicator"></div>
                <span className="drag-hint">{isExpanded ? '下滑收起' : '上滑查看全部'}</span>
            </div>
            <div className="features-panel-content">
                {children}
            </div>
        </div>
    );
};

export default FeatureDragPanel;
