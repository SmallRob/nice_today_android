import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TodoListPage.css';

/**
 * 待办事项页面
 * 功能：添加待办事项、分类、标签、完成时间、标记完成/删除、本地存储
 */
const TodoListPage = () => {
  const navigate = useNavigate();

  // 检测系统是否使用dark主题
  const isDarkTheme = () => {
    const html = document.documentElement;
    return html.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState({
    description: '',
    category: '工作',
    tags: '',
    dueDate: ''
  });
  const [filter, setFilter] = useState('all');
  const [editingTodo, setEditingTodo] = useState(null);

  // 从本地存储加载数据
  useEffect(() => {
    const savedTodos = localStorage.getItem('todoList');
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // 保存到本地存储
  useEffect(() => {
    localStorage.setItem('todoList', JSON.stringify(todos));
  }, [todos]);

  // 添加待办事项
  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.description.trim()) return;

    const todo = {
      id: Date.now(),
      description: newTodo.description,
      category: newTodo.category,
      tags: newTodo.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      dueDate: newTodo.dueDate,
      completed: false,
      createdAt: new Date().toISOString()
    };

    setTodos([todo, ...todos]);
    setNewTodo({
      description: '',
      category: '工作',
      tags: '',
      dueDate: ''
    });
  };

  // 标记完成/未完成
  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // 删除待办事项
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // 编辑待办事项
  const startEdit = (todo) => {
    setEditingTodo({
      ...todo,
      tags: todo.tags.join(', ')
    });
  };

  // 保存编辑
  const saveEdit = (id) => {
    if (!editingTodo || !editingTodo.description.trim()) return;

    setTodos(todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            description: editingTodo.description,
            category: editingTodo.category,
            tags: editingTodo.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            dueDate: editingTodo.dueDate
          }
        : todo
    ));
    setEditingTodo(null);
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingTodo(null);
  };

  // 过滤待办事项
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // 按分类统计
  const categoryStats = todos.reduce((stats, todo) => {
    stats[todo.category] = (stats[todo.category] || 0) + 1;
    return stats;
  }, {});

  // 分类颜色
  const categoryColors = {
    '工作': '#3b82f6',
    '生活': '#10b981',
    '学习': '#f59e0b',
    '健康': '#ef4444',
    '其他': '#6b7280'
  };

  return (
    <div className={`todo-page ${isDarkTheme() ? 'dark' : ''}`}>
      {/* 顶部导航栏 */}
      <div className="todo-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 className="page-title">📋 待办事项</h1>
      </div>

      {/* 添加待办事项表单 */}
      <div className="todo-form-card">
        <form onSubmit={addTodo}>
          <input
            type="text"
            className="todo-input"
            placeholder="输入待办事项..."
            value={newTodo.description}
            onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
            maxLength={200}
          />

          <div className="todo-form-row">
            <select
              className="todo-select"
              value={newTodo.category}
              onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
            >
              <option value="工作">工作</option>
              <option value="生活">生活</option>
              <option value="学习">学习</option>
              <option value="健康">健康</option>
              <option value="其他">其他</option>
            </select>

            <input
              type="date"
              className="todo-date-input"
              value={newTodo.dueDate}
              onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
            />
          </div>

          <input
            type="text"
            className="todo-input"
            placeholder="标签 (用逗号分隔，如：重要,紧急)"
            value={newTodo.tags}
            onChange={(e) => setNewTodo({ ...newTodo, tags: e.target.value })}
          />

          <button type="submit" className="todo-add-btn">
            + 添加待办
          </button>
        </form>
      </div>

      {/* 统计信息 */}
      <div className="todo-stats">
        <div className="stat-item">
          <span className="stat-number">{todos.length}</span>
          <span className="stat-label">总计</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => !t.completed).length}</span>
          <span className="stat-label">待完成</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{todos.filter(t => t.completed).length}</span>
          <span className="stat-label">已完成</span>
        </div>
      </div>

      {/* 分类统计 */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="category-stats">
          <h3>分类统计</h3>
          <div className="category-tags">
            {Object.entries(categoryStats).map(([category, count]) => (
              <span
                key={category}
                className="category-tag"
                style={{ backgroundColor: categoryColors[category] }}
              >
                {category}: {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 过滤器 */}
      <div className="todo-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          待完成
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          已完成
        </button>
      </div>

      {/* 待办事项列表 */}
      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">
            <p>暂无待办事项</p>
            <p className="empty-hint">点击上方添加您的第一个待办事项</p>
          </div>
        ) : (
          filteredTodos.map(todo => {
            if (editingTodo && editingTodo.id === todo.id) {
              // 编辑模式
              return (
                <div key={todo.id} className="todo-item editing">
                  <form onSubmit={(e) => { e.preventDefault(); saveEdit(todo.id); }}>
                    <input
                      type="text"
                      className="todo-edit-input"
                      value={editingTodo.description}
                      onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                      autoFocus
                    />

                    <div className="todo-form-row">
                      <select
                        className="todo-select"
                        value={editingTodo.category}
                        onChange={(e) => setEditingTodo({ ...editingTodo, category: e.target.value })}
                      >
                        <option value="工作">工作</option>
                        <option value="生活">生活</option>
                        <option value="学习">学习</option>
                        <option value="健康">健康</option>
                        <option value="其他">其他</option>
                      </select>

                      <input
                        type="date"
                        className="todo-date-input"
                        value={editingTodo.dueDate}
                        onChange={(e) => setEditingTodo({ ...editingTodo, dueDate: e.target.value })}
                      />
                    </div>

                    <input
                      type="text"
                      className="todo-edit-input"
                      placeholder="标签 (用逗号分隔)"
                      value={editingTodo.tags}
                      onChange={(e) => setEditingTodo({ ...editingTodo, tags: e.target.value })}
                    />

                    <div className="todo-edit-actions">
                      <button type="submit" className="save-btn">保存</button>
                      <button type="button" className="cancel-btn" onClick={cancelEdit}>取消</button>
                    </div>
                  </form>
                </div>
              );
            }

            return (
              <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <div className="todo-main">
                  <button
                    className={`todo-check ${todo.completed ? 'checked' : ''}`}
                    onClick={() => toggleComplete(todo.id)}
                  >
                    {todo.completed ? '✓' : ''}
                  </button>

                  <div className="todo-content">
                    <p className="todo-description">{todo.description}</p>

                    <div className="todo-meta">
                      <span
                        className="todo-category"
                        style={{ backgroundColor: categoryColors[todo.category] }}
                      >
                        {todo.category}
                      </span>

                      {todo.dueDate && (
                        <span className="todo-date">
                          📅 {new Date(todo.dueDate).toLocaleDateString('zh-CN')}
                        </span>
                      )}

                      {todo.tags.length > 0 && (
                        <div className="todo-tags">
                          {todo.tags.map((tag, index) => (
                            <span key={index} className="todo-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="todo-actions">
                  <button className="edit-btn" onClick={() => startEdit(todo)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodoListPage;
