"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * 热门区组件
 * 核心功能：推荐热门网站（一行）
 * 交互功能：可以选择（2行,3行,4行）
 * 数据：可以通过json配置，用户选择后进行本地和服务器通过虚拟api获取和保存
 */
const HotSites: React.FC = () => {
  // 状态管理
  const [hotSites, setHotSites] = useState<any[]>([]);
  const [layout, setLayout] = useState<'2rows' | '3rows' | '4rows'>('3rows');
  const [isLoading, setIsLoading] = useState(true);

  // 获取热门网站数据
  useEffect(() => {
    const fetchHotSites = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/hot-sites');
        const data = await response.json();
        setHotSites(data);
      } catch (error) {
        console.error('获取热门网站失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotSites();
  }, []);

  // 获取用户配置
  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        const response = await fetch('/api/user-preferences');
        const data = await response.json();
        if (data.hotSitesLayout) {
          setLayout(data.hotSitesLayout as '2rows' | '3rows' | '4rows');
        }
      } catch (error) {
        console.error('获取用户配置失败:', error);
      }
    };

    fetchUserPreferences();
  }, []);

  /**
   * 切换布局
   * @param newLayout 新布局
   */
  const switchLayout = async (newLayout: '2rows' | '3rows' | '4rows') => {
    setLayout(newLayout);
    
    // 更新用户配置
    try {
      await fetch('/api/user-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hotSitesLayout: newLayout }),
      });
    } catch (error) {
      console.error('更新用户配置失败:', error);
    }
  };

  // 计算每行显示的网站数量
  const getSitesPerRow = () => {
    switch (layout) {
      case '2rows':
        return 4;
      case '3rows':
        return 6;
      case '4rows':
        return 8;
      default:
        return 6;
    }
  };

  // 计算行数
  const getRows = () => {
    const sitesPerRow = getSitesPerRow();
    return Math.ceil(hotSites.length / sitesPerRow);
  };

  // 获取当前布局的网站
  const getCurrentLayoutSites = () => {
    const sitesPerRow = getSitesPerRow();
    const rows = getRows();
    const result = [];
    
    for (let i = 0; i < rows; i++) {
      const rowSites = hotSites.slice(i * sitesPerRow, (i + 1) * sitesPerRow);
      result.push(rowSites);
    }
    
    return result;
  };

  // 当前布局的网站
  const layoutSites = getCurrentLayoutSites();

  return (
    <div className="w-full max-w-5xl mx-auto my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">热门网站</h2>
        
        {/* 布局选择 */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              layout === '2rows'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => switchLayout('2rows')}
          >
            2行
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              layout === '3rows'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => switchLayout('3rows')}
          >
            3行
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${
              layout === '4rows'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            onClick={() => switchLayout('4rows')}
          >
            4行
          </button>
        </div>
      </div>

      {/* 热门网站列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {layoutSites.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {row.map((site: any) => (
                <a
                  key={site.id}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 mb-2 relative">
                    <Image
                      src={`${new URL(site.url).origin}/favicon.ico`}
                      alt={site.title}
                      fill
                      className="rounded-full object-contain"
                    />
                  </div>
                  <span className="text-sm text-center text-gray-700 dark:text-gray-300 truncate w-full">
                    {site.title}
                  </span>
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotSites; 