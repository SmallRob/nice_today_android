import React from 'react';
import { useNavigate } from 'react-router-dom';

const PersonalityTestCard = ({ draggable, index, id, showDragHandle, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/personality-test');
  };

  return (
    <div
      className={`feature-card ${draggable ? 'draggable' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      id={id}
      onClick={handleClick}
    >
      {showDragHandle && (
        <div className="drag-handle">
          <span>::</span>
        </div>
      )}
      <div className="feature-card-content">
        <div className="feature-icon">🎭</div>
        <div className="feature-title">性格测试</div>
        <div className="feature-subtitle">MBTI & 气质类型</div>
        <div className="feature-description">
          探索你的性格特质和行为倾向
        </div>
      </div>
    </div>
  );
};

export default PersonalityTestCard;