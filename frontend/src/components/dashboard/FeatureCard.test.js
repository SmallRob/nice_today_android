/**
 * FeatureCard 组件单元测试示例
 *
 * 使用 Jest + React Testing Library 进行测试
 * 注意:实际使用前需要安装测试依赖
 * npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FeatureCard from './FeatureCard';
import { ICON_MAP } from './constants';

describe('FeatureCard Component', () => {
  const defaultProps = {
    title: '测试卡片',
    description: '这是一个测试卡片',
    icon: 'star',
    color: '#6366f1'
  };

  describe('基础渲染', () => {
    test('应该正确渲染卡片内容', () => {
      render(<FeatureCard {...defaultProps} />);

      expect(screen.getByText('测试卡片')).toBeInTheDocument();
      expect(screen.getByText('这是一个测试卡片')).toBeInTheDocument();
    });

    test('应该显示正确的图标', () => {
      render(<FeatureCard {...defaultProps} icon="star" />);

      const iconElement = screen.getByText('⭐');
      expect(iconElement).toBeInTheDocument();
    });

    test('应该应用正确的颜色', () => {
      const { container } = render(<FeatureCard {...defaultProps} color="#ef4444" />);

      const card = container.querySelector('.feature-card');
      expect(card).toHaveStyle({ '--card-color': '#ef4444' });
    });

    test('应该使用默认颜色当传入无效颜色时', () => {
      const { container } = render(<FeatureCard {...defaultProps} color="invalid" />);

      const card = container.querySelector('.feature-card');
      expect(card).toHaveStyle({ '--card-color': '#6366f1' });
    });
  });

  describe('交互行为', () => {
    test('应该调用 onClick 处理函数', () => {
      const handleClick = jest.fn();
      render(<FeatureCard {...defaultProps} onClick={handleClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('禁用状态时不应该触发点击', () => {
      const handleClick = jest.fn();
      render(<FeatureCard {...defaultProps} onClick={handleClick} disabled />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(handleClick).not.toHaveBeenCalled();
    });

    test('应该正确设置 aria-disabled 属性', () => {
      const { rerender } = render(<FeatureCard {...defaultProps} disabled={false} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-disabled', 'false');

      rerender(<FeatureCard {...defaultProps} disabled={true} />);
      expect(card).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('拖拽功能', () => {
    test('应该设置正确的 draggable 属性', () => {
      const { container } = render(<FeatureCard {...defaultProps} draggable={false} />);
      let card = container.querySelector('.feature-card');
      expect(card).not.toHaveAttribute('draggable');

      const { container: container2 } = render(<FeatureCard {...defaultProps} draggable={true} />);
      card = container2.querySelector('.feature-card');
      expect(card).toHaveAttribute('draggable', 'true');
    });

    test('拖拽开始时应该调用 onDragStart', () => {
      const handleDragStart = jest.fn();
      const { container } = render(
        <FeatureCard
          {...defaultProps}
          draggable={true}
          id="test-1"
          index={0}
          onDragStart={handleDragStart}
        />
      );

      const card = container.querySelector('.feature-card');
      fireEvent.dragStart(card);

      expect(handleDragStart).toHaveBeenCalledWith(
        expect.any(Object),
        0
      );
    });

    test('拖拽结束时应该调用 onDragEnd', () => {
      const handleDragEnd = jest.fn();
      const { container } = render(
        <FeatureCard
          {...defaultProps}
          draggable={true}
          onDragEnd={handleDragEnd}
        />
      );

      const card = container.querySelector('.feature-card');
      fireEvent.dragEnd(card);

      expect(handleDragEnd).toHaveBeenCalled();
    });
  });

  describe('图标处理', () => {
    test('应该支持预定义的图标名称', () => {
      render(<FeatureCard {...defaultProps} icon="brain" />);
      expect(screen.getByText('🧠')).toBeInTheDocument();
    });

    test('应该支持直接使用 emoji', () => {
      render(<FeatureCard {...defaultProps} icon="🎯" />);
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    test('未知图标应该使用默认图标', () => {
      render(<FeatureCard {...defaultProps} icon="unknown-icon" />);
      expect(screen.getByText('🔮')).toBeInTheDocument();
    });

    test('没有图标时应该使用默认图标', () => {
      render(<FeatureCard {...defaultProps} />);
      expect(screen.getByText('🔮')).toBeInTheDocument();
    });
  });

  describe('样式类名', () => {
    test('应该添加 feature-card-loading 类当 disabled', () => {
      const { container } = render(<FeatureCard {...defaultProps} disabled={true} />);
      const card = container.querySelector('.feature-card');
      expect(card).toHaveClass('feature-card-loading');
    });

    test('应该添加 feature-card-draggable 类当 draggable', () => {
      const { container } = render(<FeatureCard {...defaultProps} draggable={true} />);
      const card = container.querySelector('.feature-card');
      expect(card).toHaveClass('feature-card-draggable');
    });
  });

  describe('可访问性', () => {
    test('应该有正确的 role 属性', () => {
      render(<FeatureCard {...defaultProps} />);
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
    });

    test('应该有正确的 aria-label', () => {
      render(<FeatureCard {...defaultProps} title="我的卡片" />);
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('aria-label', '我的卡片');
    });

    test('禁用时应该设置 tabIndex 为 -1', () => {
      const { container } = render(<FeatureCard {...defaultProps} disabled={true} />);
      const card = container.querySelector('.feature-card');
      expect(card).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Props 类型验证', () => {
    test('应该接受必需的 title props', () => {
      expect(() => {
        render(<FeatureCard description="test" />);
      }).toThrow();
    });

    test('应该接受必需的 description props', () => {
      expect(() => {
        render(<FeatureCard title="test" />);
      }).toThrow();
    });
  });
});
