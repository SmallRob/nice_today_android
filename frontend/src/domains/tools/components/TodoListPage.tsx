import React, { useState, useEffect, useCallback } from 'react';
import { toolsService } from '../services/toolsService';
import type { TodoItem } from '../types';

interface TodoListPageProps {
  onBack?: () => void;
}

type FilterType = 'all' | 'active' | 'completed';

const CATEGORIES = ['工作', '学习', '生活', '健康', '社交', '其他'];
const PRIORITIES = [
  { value: 'low', label: '低', color: 'bg-gray-400' },
  { value: 'medium', label: '中', color: 'bg-yellow-400' },
  { value: 'high', label: '高', color: 'bg-orange-400' },
  { value: 'urgent', label: '紧急', color: 'bg-red-400' },
];

const TodoListPage: React.FC<TodoListPageProps> = ({ onBack }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    category: '工作',
    priority: 'medium' as TodoItem['priority'],
    dueDate: '',
    tags: '',
  });

  useEffect(() => {
    loadTodos();
  }, [filter]);

  const loadTodos = useCallback(() => {
    const data = toolsService.getTodosByFilter(filter);
    setTodos(data);
  }, [filter]);

  const handleAddTodo = () => {
    if (!newTodo.title.trim()) return;

    toolsService.addTodo({
      title: newTodo.title,
      completed: false,
      priority: newTodo.priority,
      category: newTodo.category,
      tags: newTodo.tags.split(',').map(t => t.trim()).filter(Boolean),
      dueDate: newTodo.dueDate || undefined,
      subtasks: [],
      attachments: [],
    });

    setNewTodo({ title: '', category: '工作', priority: 'medium', dueDate: '', tags: '' });
    setShowAddModal(false);
    loadTodos();
  };

  const handleToggleComplete = (todoId: string) => {
    toolsService.toggleTodoComplete(todoId);
    loadTodos();
  };

  const handleDeleteTodo = (todoId: string) => {
    if (window.confirm('确定要删除这个待办事项吗？')) {
      toolsService.deleteTodo(todoId);
      loadTodos();
    }
  };

  const stats = toolsService.getTodoStats();

  const getPriorityColor = (priority: TodoItem['priority']) => {
    return PRIORITIES.find(p => p.value === priority)?.color || 'bg-gray-400';
  };

  const getPriorityLabel = (priority: TodoItem['priority']) => {
    return PRIORITIES.find(p => p.value === priority)?.label || '中';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return '今天';
    if (date.toDateString() === tomorrow.toDateString()) return '明天';
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const isOverdue = (todo: TodoItem) => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">待办事项</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-blue-500 text-sm font-medium"
          >
            + 添加
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-500">总计</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
            <div className="text-xs text-gray-500">进行中</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['all', 'active', 'completed'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
            </button>
          ))}
        </div>

        {/* Todo list */}
        <div className="space-y-2">
          {todos.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm text-center">
              <span className="text-4xl">📝</span>
              <p className="text-sm text-gray-500 mt-3">
                {filter === 'all' ? '还没有待办事项' : filter === 'active' ? '没有进行中的事项' : '没有已完成的事项'}
              </p>
            </div>
          ) : (
            todos.map(todo => (
              <div
                key={todo.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all ${
                  todo.completed ? 'opacity-60' : ''
                } ${isOverdue(todo) ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleComplete(todo.id)}
                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      todo.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {todo.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {todo.title}
                      </span>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(todo.priority)}`} />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
                        {todo.category}
                      </span>
                      {todo.dueDate && (
                        <span className={`text-[10px] ${isOverdue(todo) ? 'text-red-500' : 'text-gray-400'}`}>
                          {formatDate(todo.dueDate)}
                        </span>
                      )}
                      {todo.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">添加待办</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 text-xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">标题</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="输入待办事项..."
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">分类</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewTodo(prev => ({ ...prev, category: cat }))}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        newTodo.category === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">优先级</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setNewTodo(prev => ({ ...prev, priority: p.value as any }))}
                      className={`flex-1 py-2 rounded-lg text-sm ${
                        newTodo.priority === p.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">截止日期 (可选)</label>
                <input
                  type="date"
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500 mb-1 block">标签 (逗号分隔)</label>
                <input
                  type="text"
                  value={newTodo.tags}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="重要, 紧急"
                  className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleAddTodo}
              disabled={!newTodo.title.trim()}
              className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              添加待办
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoListPage;