"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * 搜索框区组件
 * 核心功能：搜索框（一行）
 * 交互：可以选择bing/百度/谷歌，默认bing，回车或点击搜索按钮跳转搜索
 * 数据：可以通过json配置，用户选择后进行本地和服务器通过虚拟api获取和保存
 */
const SearchBox: React.FC = () => {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEngines, setSearchEngines] = useState<any[]>([]);
  const [currentEngine, setCurrentEngine] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [iconError, setIconError] = useState<Record<string, boolean>>({});

  // 搜索引擎配置
  const engineConfigs: Record<string, { name: string; favicon: string }> = {
    'bing': {
      name: '必应',
      favicon: 'https://cn.bing.com/favicon.ico'
    },
    'baidu': {
      name: '百度',
      favicon: 'https://www.baidu.com/favicon.ico'
    },
    'google': {
      name: '谷歌',
      favicon: 'https://www.google.com/favicon.ico'
    }
  };

  // 默认图标
  const defaultIcon = '/default-favicon.png';

  // 获取搜索引擎数据
  useEffect(() => {
    const fetchSearchEngines = async () => {
      try {
        const response = await fetch('/api/search-engines');
        const data = await response.json();
        setSearchEngines(data);
        
        // 设置默认搜索引擎
        if (data.length > 0 && !currentEngine) {
          setCurrentEngine(data[0]);
        }
      } catch (error) {
        console.error('获取搜索引擎失败:', error);
      }
    };

    fetchSearchEngines();
  }, [currentEngine]);

  /**
   * 处理搜索提交
   */
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const searchUrl = `${currentEngine.url}${encodeURIComponent(searchQuery)}`;
    window.open(searchUrl, '_blank');
  };

  /**
   * 处理键盘事件
   * @param e 键盘事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  /**
   * 切换搜索引擎
   * @param engine 搜索引擎对象
   */
  const switchSearchEngine = (engine: any) => {
    setCurrentEngine(engine);
    setIsDropdownOpen(false);
  };

  /**
   * 处理图标加载错误
   * @param engineId 搜索引擎ID
   */
  const handleIconError = (engineId: string) => {
    setIconError(prev => ({
      ...prev,
      [engineId]: true
    }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6">
      <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        {/* 搜索引擎选择下拉菜单 */}
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {currentEngine && (
              <Image
                src={iconError[currentEngine.id] ? defaultIcon : engineConfigs[currentEngine.id]?.favicon || defaultIcon}
                alt={engineConfigs[currentEngine.id]?.name || '搜索引擎'}
                width={18}
                height={18}
                className="rounded-full"
                onError={() => handleIconError(currentEngine.id)}
              />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {currentEngine?.name || '必应'}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* 下拉菜单 */}
          {isDropdownOpen && (
            <div className="absolute z-10 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
              <ul className="py-1">
                {searchEngines.map((engine) => (
                  <li key={engine.id}>
                    <button
                      className={`flex items-center w-full px-3 py-2 text-sm ${
                        engine.id === currentEngine?.id
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => switchSearchEngine(engine)}
                    >
                      <Image
                        src={iconError[engine.id] ? defaultIcon : engineConfigs[engine.id]?.favicon || defaultIcon}
                        alt={engineConfigs[engine.id]?.name || '搜索引擎'}
                        width={18}
                        height={18}
                        className="rounded-full mr-2"
                        onError={() => handleIconError(engine.id)}
                      />
                      {engine.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 搜索框 */}
        <input
          type="text"
          className="flex-1 px-4 py-2 focus:outline-none dark:bg-gray-800 dark:text-white"
          placeholder="输入搜索内容..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {/* 搜索按钮 */}
        <button
          className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          onClick={handleSearch}
        >
          搜索
        </button>
      </div>
    </div>
  );
};

export default SearchBox; 