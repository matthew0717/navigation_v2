"use client";

import React from 'react';
import { useI18n } from '@/i18n';

/**
 * 语言切换组件
 * 提供中英文切换功能
 */
const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center">
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'zh' | 'en')}
        className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher; 