import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PasswordVaultPage.css';

// 加密工具函数
const EncryptionService = {
  // 生成加密密钥（基于密码）
  async deriveKey(password) {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // 使用PBKDF2派生密钥
    const salt = encoder.encode('nice-today-vault-salt'); // 固定盐值（由于完全本地存储，使用固定盐值）
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  },
  
  // 加密数据
  async encrypt(data, password) {
    try {
      const key = await this.deriveKey(password);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(data));
      
      // 生成随机IV（初始化向量）
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBuffer
      );
      
      // 将IV和加密数据组合存储
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // 转换为Base64字符串存储
      return btoa(String.fromCharCode.apply(null, combined));
    } catch (error) {
      console.error('加密失败:', error);
      throw error;
    }
  },
  
  // 解密数据
  async decrypt(encryptedData, password) {
    try {
      const key = await this.deriveKey(password);
      
      // 从Base64解码
      const binaryString = atob(encryptedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // 提取IV（前12字节）和加密数据
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);
      
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        data
      );
      
      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedBuffer));
    } catch (error) {
      console.error('解密失败:', error);
      throw error;
    }
  }
};

// 本地存储服务
const StorageService = {
  VAULT_KEY: 'nice_today_password_vault',
  MASTER_PASSWORD_KEY: 'nice_today_master_password_hash',
  
  // 检查是否已设置主密码
  hasMasterPassword() {
    return !!localStorage.getItem(this.MASTER_PASSWORD_KEY);
  },
  
  // 设置主密码（初始化）
  async setMasterPassword(password) {
    // 简单哈希存储（用于验证）
    const hash = await this.hashPassword(password);
    localStorage.setItem(this.MASTER_PASSWORD_KEY, hash);
    
    // 初始化空密码列表
    const emptyVault = { passwords: [], createdAt: new Date().toISOString() };
    await this.saveVault(emptyVault, password);
  },
  
  // 验证主密码
  async verifyMasterPassword(password) {
    const storedHash = localStorage.getItem(this.MASTER_PASSWORD_KEY);
    if (!storedHash) return false;
    
    const hash = await this.hashPassword(password);
    return hash === storedHash;
  },
  
  // 密码哈希（SHA-256）
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  // 保存密码库
  async saveVault(vault, password) {
    try {
      const encrypted = await EncryptionService.encrypt(vault, password);
      localStorage.setItem(this.VAULT_KEY, encrypted);
      return true;
    } catch (error) {
      console.error('保存密码库失败:', error);
      return false;
    }
  },
  
  // 加载密码库
  async loadVault(password) {
    try {
      const encrypted = localStorage.getItem(this.VAULT_KEY);
      if (!encrypted) return { passwords: [], createdAt: new Date().toISOString() };
      
      const vault = await EncryptionService.decrypt(encrypted, password);
      return vault;
    } catch (error) {
      console.error('加载密码库失败:', error);
      throw error;
    }
  }
};

const PasswordVaultPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('check'); // 'check', 'setup', 'login', 'main'
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [passwords, setPasswords] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassword, setNewPassword] = useState({ name: '', value: '', notes: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 检查是否已设置主密码
  useEffect(() => {
    const checkSetup = () => {
      if (StorageService.hasMasterPassword()) {
        setStep('login');
      } else {
        setStep('setup');
      }
    };
    
    checkSetup();
  }, []);

  // 处理主密码设置
  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (masterPassword.length < 8) {
      setError('密保必须至少8位数字或字母');
      return;
    }

    if (masterPassword !== confirmPassword) {
      setError('两次输入的密保不一致');
      return;
    }

    // 检查密码复杂度（至少包含数字和字母）
    const hasLetter = /[a-zA-Z]/.test(masterPassword);
    const hasNumber = /[0-9]/.test(masterPassword);
    
    if (!hasLetter || !hasNumber) {
      setError('密保必须包含数字和字母');
      return;
    }

    try {
      await StorageService.setMasterPassword(masterPassword);
      setSuccess('密保设置成功！请牢记您的密保，丢失后将无法找回数据。');
      setTimeout(() => {
        setStep('main');
        loadPasswords(masterPassword);
      }, 1500);
    } catch (error) {
      setError('设置失败，请重试');
    }
  };

  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!loginPassword) {
      setError('请输入密保');
      return;
    }

    try {
      const isValid = await StorageService.verifyMasterPassword(loginPassword);
      if (isValid) {
        setStep('main');
        loadPasswords(loginPassword);
      } else {
        setError('密保错误');
      }
    } catch (error) {
      setError('验证失败，请重试');
    }
  };

  // 加载密码列表
  const loadPasswords = async (password) => {
    try {
      const vault = await StorageService.loadVault(password);
      setPasswords(vault.passwords || []);
    } catch (error) {
      setError('加载密码失败');
    }
  };

  // 添加新密码
  const handleAddPassword = async () => {
    if (!newPassword.name.trim() || !newPassword.value.trim()) {
      setError('请输入名称和密码');
      return;
    }

    try {
      const currentPassword = step === 'main' ? masterPassword : loginPassword;
      const vault = await StorageService.loadVault(currentPassword);
      
      const updatedPasswords = [
        ...vault.passwords,
        {
          id: Date.now().toString(),
          name: newPassword.name.trim(),
          value: newPassword.value.trim(),
          notes: newPassword.notes.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      const updatedVault = { ...vault, passwords: updatedPasswords };
      const saved = await StorageService.saveVault(updatedVault, currentPassword);
      
      if (saved) {
        setPasswords(updatedPasswords);
        setNewPassword({ name: '', value: '', notes: '' });
        setShowAddModal(false);
        setSuccess('密码添加成功');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('保存失败');
      }
    } catch (error) {
      setError('添加失败');
    }
  };

  // 删除密码
  const handleDeletePassword = async (id) => {
    if (!window.confirm('确定要删除这个密码吗？此操作不可撤销。')) {
      return;
    }

    try {
      const currentPassword = step === 'main' ? masterPassword : loginPassword;
      const vault = await StorageService.loadVault(currentPassword);
      
      const updatedPasswords = vault.passwords.filter(p => p.id !== id);
      const updatedVault = { ...vault, passwords: updatedPasswords };
      
      const saved = await StorageService.saveVault(updatedVault, currentPassword);
      if (saved) {
        setPasswords(updatedPasswords);
        setSuccess('密码删除成功');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('删除失败');
      }
    } catch (error) {
      setError('删除失败');
    }
  };

  // 编辑密码
  const handleEditPassword = async (id, updatedData) => {
    try {
      const currentPassword = step === 'main' ? masterPassword : loginPassword;
      const vault = await StorageService.loadVault(currentPassword);
      
      const updatedPasswords = vault.passwords.map(p => 
        p.id === id ? { ...p, ...updatedData, updatedAt: new Date().toISOString() } : p
      );
      
      const updatedVault = { ...vault, passwords: updatedPasswords };
      const saved = await StorageService.saveVault(updatedVault, currentPassword);
      
      if (saved) {
        setPasswords(updatedPasswords);
        setSuccess('密码更新成功');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('更新失败');
      }
    } catch (error) {
      setError('更新失败');
    }
  };

  // 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="password-vault-page">
      {/* 顶部导航栏 */}
      <div className="vault-header">
        <button className="back-button" onClick={handleBack}>
          <span className="back-icon">←</span>
          返回
        </button>
        <h1 className="header-title">密码保管箱</h1>
        <div className="header-actions">
          {step === 'main' && (
            <button 
              className="add-password-button"
              onClick={() => setShowAddModal(true)}
            >
              新增密码
            </button>
          )}
        </div>
      </div>

      <div className="vault-content">
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* 步骤1: 设置密保 */}
        {step === 'setup' && (
          <div className="setup-container">
            <div className="warning-box">
              <h3>⚠️ 重要提示</h3>
              <p>1. 请设置8位以上的数字字母组合作为密保</p>
              <p>2. 密保丢失后将无法找回存储的数据</p>
              <p>3. 无法重置密码，请务必牢记</p>
              <p>4. 所有数据仅存储在您的设备本地</p>
            </div>

            <form className="setup-form" onSubmit={handleSetup}>
              <div className="form-group">
                <label>设置密保（8位以上数字字母）</label>
                <input
                  type="password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="请输入密保"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>确认密保</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密保"
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                设置密保并初始化
              </button>
            </form>
          </div>
        )}

        {/* 步骤2: 登录验证 */}
        {step === 'login' && (
          <div className="login-container">
            <div className="login-header">
              <h2>请输入密保</h2>
              <p>访问密码保管箱需要验证您的密保</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>密保</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="请输入您的密保"
                  required
                />
              </div>

              <button type="submit" className="submit-button">
                验证并进入
              </button>
            </form>

            <div className="login-footer">
              <p>忘记密保？<strong>数据将无法找回</strong>，请谨慎操作</p>
            </div>
          </div>
        )}

        {/* 步骤3: 主界面 */}
        {step === 'main' && (
          <div className="main-container">
            {passwords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔐</div>
                <h3>暂无保存的密码</h3>
                <p>点击下方按钮添加您的第一个密码</p>
                <button 
                  className="add-first-password"
                  onClick={() => setShowAddModal(true)}
                >
                  添加密码
                </button>
              </div>
            ) : (
              <div className="password-list">
                <h3 className="list-title">已保存的密码 ({passwords.length})</h3>
                {passwords.map((item) => (
                  <PasswordItem
                    key={item.id}
                    item={item}
                    onDelete={handleDeletePassword}
                    onEdit={handleEditPassword}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 添加密码模态框 */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>添加新密码</h3>
              <button className="close-button" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>名称（用途）</label>
                <input
                  type="text"
                  value={newPassword.name}
                  onChange={(e) => setNewPassword({...newPassword, name: e.target.value})}
                  placeholder="例如：微信登录密码"
                  required
                />
              </div>

              <div className="form-group">
                <label>密码</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword.value}
                    onChange={(e) => setNewPassword({...newPassword, value: e.target.value})}
                    placeholder="请输入密码"
                    required
                  />
                  <button 
                    className="toggle-visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>备注（可选）</label>
                <textarea
                  value={newPassword.notes}
                  onChange={(e) => setNewPassword({...newPassword, notes: e.target.value})}
                  placeholder="可添加额外信息，如用户名、网址等"
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setShowAddModal(false)}>
                取消
              </button>
              <button className="save-button" onClick={handleAddPassword}>
                保存密码
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 悬浮添加按钮（移动端优化） */}
      {step === 'main' && (
        <button 
          className="add-password-fab"
          onClick={() => setShowAddModal(true)}
          aria-label="添加密码"
        >
          <span className="fab-icon">+</span>
          <span className="fab-text">添加</span>
        </button>
      )}
    </div>
  );
};

// 密码项组件
const PasswordItem = ({ item, onDelete, onEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(item.name);
  const [editedValue, setEditedValue] = useState(item.value);
  const [editedNotes, setEditedNotes] = useState(item.notes);

  const handleSave = () => {
    onEdit(item.id, {
      name: editedName,
      value: editedValue,
      notes: editedNotes
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="password-item">
      {isEditing ? (
        <div className="edit-mode">
          <input
            type="text"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="edit-input"
          />
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              value={editedValue}
              onChange={(e) => setEditedValue(e.target.value)}
              className="edit-input"
            />
            <button 
              className="toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <textarea
            value={editedNotes}
            onChange={(e) => setEditedNotes(e.target.value)}
            className="edit-textarea"
            rows="2"
          />
          <div className="edit-actions">
            <button className="save-edit" onClick={handleSave}>保存</button>
            <button className="cancel-edit" onClick={() => setIsEditing(false)}>取消</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <div className="item-header">
            <h4 className="item-name">{item.name}</h4>
            <div className="item-actions">
              <button className="edit-button" onClick={() => setIsEditing(true)}>编辑</button>
              <button className="delete-button" onClick={() => onDelete(item.id)}>删除</button>
            </div>
          </div>
          
          <div className="item-body">
            <div className="password-display">
              <span className="password-value">
                {showPassword ? item.value : '•'.repeat(Math.min(item.value.length, 12))}
              </span>
              <button 
                className="toggle-visibility"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            
            {item.notes && (
              <p className="item-notes">{item.notes}</p>
            )}
            
            <div className="item-meta">
              <span className="item-date">更新于 {formatDate(item.updatedAt)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordVaultPage;