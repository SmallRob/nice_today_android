import React, { useState, useEffect } from 'react';
import { userCenterService } from '../services/userCenterService';
import type { UserProfile } from '../types';

interface UserProfilePageProps {
  onBack?: () => void;
}

const GENDER_OPTIONS = [
  { value: 'male', label: '男', emoji: '👨' },
  { value: 'female', label: '女', emoji: '👩' },
  { value: 'secret', label: '保密', emoji: '🤐' },
];

const ZODIAC_SIGNS = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
];

const UserProfilePage: React.FC<UserProfilePageProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const p = userCenterService.getUserProfile();
    setProfile(p);
    setEditData(p);
  };

  const handleSave = () => {
    if (!editData.nickname?.trim()) {
      return;
    }
    userCenterService.saveUserProfile(editData as UserProfile);
    setProfile(editData as UserProfile);
    setEditing(false);
    setSuccess('个人资料已更新');
    setTimeout(() => setSuccess(null), 2000);
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          {onBack && (
            <button onClick={onBack} className="text-blue-500 text-sm">← 返回</button>
          )}
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">个人资料</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="text-blue-500 text-sm font-medium"
          >
            {editing ? '保存' : '编辑'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Success message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center text-green-600 dark:text-green-400 text-sm">
            {success}
          </div>
        )}

        {/* Avatar section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl text-white">
              {profile.nickname ? profile.nickname[0] : '👤'}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
              {profile.nickname || '未设置昵称'}
            </h2>
            <span className="text-sm text-gray-500 mt-1">
              {profile.zodiac || '未设置星座'} · {profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '保密'}
            </span>
          </div>
        </div>

        {/* Profile info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Nickname */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">昵称</span>
              {editing ? (
                <input
                  type="text"
                  value={editData.nickname || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, nickname: e.target.value }))}
                  className="text-right bg-transparent text-gray-900 dark:text-white outline-none"
                  placeholder="请输入昵称"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile.nickname || '未设置'}</span>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">性别</span>
              {editing ? (
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEditData(prev => ({ ...prev, gender: opt.value as any }))}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        editData.gender === opt.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-gray-900 dark:text-white">
                  {GENDER_OPTIONS.find(g => g.value === profile.gender)?.emoji} {GENDER_OPTIONS.find(g => g.value === profile.gender)?.label || '未设置'}
                </span>
              )}
            </div>
          </div>

          {/* Birthday */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">出生日期</span>
              {editing ? (
                <input
                  type="date"
                  value={editData.birthDate || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="text-right bg-transparent text-gray-900 dark:text-white outline-none"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile.birthDate || '未设置'}</span>
              )}
            </div>
          </div>

          {/* Birth time */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">出生时辰</span>
              {editing ? (
                <input
                  type="time"
                  value={editData.birthTime || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, birthTime: e.target.value }))}
                  className="text-right bg-transparent text-gray-900 dark:text-white outline-none"
                />
              ) : (
                <span className="text-gray-900 dark:text-white">{profile.birthTime || '未设置'}</span>
              )}
            </div>
          </div>

          {/* Zodiac */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">星座</span>
              {editing ? (
                <select
                  value={editData.zodiac || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, zodiac: e.target.value }))}
                  className="text-right bg-transparent text-gray-900 dark:text-white outline-none"
                >
                  <option value="">请选择</option>
                  {ZODIAC_SIGNS.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              ) : (
                <span className="text-gray-900 dark:text-white">{profile.zodiac || '未设置'}</span>
              )}
            </div>
          </div>

          {/* MBTI */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">MBTI</span>
              {editing ? (
                <input
                  type="text"
                  value={editData.mbti || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, mbti: e.target.value }))}
                  className="text-right bg-transparent text-gray-900 dark:text-white outline-none"
                  placeholder="例如: INTJ"
                  maxLength={4}
                />
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">
                  {profile.mbti || '未测试'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Editing buttons */}
        {editing && (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-medium"
            >
              保存
            </button>
          </div>
        )}

        {/* Quick actions */}
        {!editing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-gray-700 dark:text-gray-300">导出我的数据</span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="text-red-500">清除所有数据</span>
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;