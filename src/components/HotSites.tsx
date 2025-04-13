"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

/**
 * 热门网站区组件
 * 核心功能：展示热门网站
 * 交互：点击跳转到对应网站
 * 数据：可以通过json配置，用户获取页面，或新建页面，排序选择后进行本地和服务器通过虚拟api获取和保存
 */
const HotSites: React.FC = () => {
  // 状态管理
  const [hotSites, setHotSites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});

  // 默认图标
  const defaultIcon = '/default-favicon.png';

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

  /**
   * 处理图标加载错误
   * @param siteId 网站ID
   */
  const handleIconError = (siteId: string) => {
    setIconErrors(prev => ({
      ...prev,
      [siteId]: true
    }));
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">热门网站</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500"></div>
        </div>
      ) : hotSites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {hotSites.map((site) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 mb-1.5 relative">
                <Image
                  src={iconErrors[site.id] ? defaultIcon : `${new URL(site.url).origin}/favicon.ico`}
                  alt={site.title}
                  fill
                  className="rounded-full object-contain"
                  onError={() => handleIconError(site.id)}
                />
              </div>
              <span className="text-xs text-center text-gray-700 dark:text-gray-300 truncate w-full">
                {site.title}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          暂无热门网站
        </div>
      )}
    </div>
  );
};

export default HotSites; 