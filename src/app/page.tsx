import React from 'react';
import SearchBox from '@/components/SearchBox';
import HotSites from '@/components/HotSites';
import TabPages from '@/components/TabPages';

/**
 * 主页面组件
 * 整合搜索框区组件、热门区组件和多标签页区组件
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* 搜索框区组件 */}
        <SearchBox />
        
        {/* 热门区组件 */}
        <HotSites />
        
        {/* 多标签页区组件 */}
        <TabPages />
      </div>
    </div>
  );
}
