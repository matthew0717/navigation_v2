"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from 'react-beautiful-dnd';

/**
 * 多标签页区组件
 * 核心功能：默认官方推荐导航模板（如工作，娱乐，学习）
 * 交互功能：点击"+"号添加新 tab页，可以拖动Tab 进行排序
 * 数据：可以通过json配置，用户获取页面，或新建页面，排序选择后进行本地和服务器通过虚拟api获取和保存
 */
const TabPages: React.FC = () => {
  // 状态管理
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabTitle, setNewTabTitle] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});

  // 默认图标
  const defaultIcon = '/default-favicon.png';

  // 客户端渲染标记
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 获取标签页数据
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tabs');
        const data = await response.json();
        setTabs(data);
        
        // 设置默认活动标签
        if (data.length > 0 && !activeTab) {
          setActiveTab(data[0].id);
        }
      } catch (error) {
        console.error('获取标签页失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTabs();
  }, [activeTab]);

  /**
   * 处理标签切换
   * @param tabId 标签ID
   */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  /**
   * 处理添加新标签
   */
  const handleAddTab = () => {
    setIsAddingTab(true);
  };

  /**
   * 处理保存新标签
   */
  const handleSaveNewTab = async () => {
    if (!newTabTitle.trim()) {
      setIsAddingTab(false);
      setNewTabTitle('');
      return;
    }

    const newTab = {
      id: `tab-${Date.now()}`,
      title: newTabTitle,
      sites: []
    };

    const updatedTabs = [...tabs, newTab];
    setTabs(updatedTabs);
    setActiveTab(newTab.id);
    setIsAddingTab(false);
    setNewTabTitle('');

    // 更新服务器数据
    try {
      await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(await (await fetch('/api/config')).json()),
          tabs: updatedTabs
        }),
      });
    } catch (error) {
      console.error('更新标签页失败:', error);
    }
  };

  /**
   * 处理拖拽结束
   * @param result 拖拽结果
   */
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // 如果是标签拖拽
    if (result.type === 'tabs') {
      const reorderedTabs = Array.from(tabs);
      const [removed] = reorderedTabs.splice(source.index, 1);
      reorderedTabs.splice(destination.index, 0, removed);

      setTabs(reorderedTabs);

      // 更新服务器数据
      try {
        await fetch('/api/config', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...(await (await fetch('/api/config')).json()),
            tabs: reorderedTabs
          }),
        });
      } catch (error) {
        console.error('更新标签页排序失败:', error);
      }
    }
  };

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

  // 获取当前活动标签
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="w-full max-w-5xl mx-auto my-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">导航分类</h2>
        
        {/* 添加新标签按钮 */}
        {!isLoading && !isAddingTab && (
          <button
            className="flex items-center px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            onClick={handleAddTab}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            添加标签
          </button>
        )}
      </div>

      {/* 添加新标签输入框 */}
      {isAddingTab && (
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="text"
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="输入标签名称..."
            value={newTabTitle}
            onChange={(e) => setNewTabTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveNewTab();
              }
            }}
          />
          <button
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            onClick={handleSaveNewTab}
          >
            保存
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            onClick={() => {
              setIsAddingTab(false);
              setNewTabTitle('');
            }}
          >
            取消
          </button>
        </div>
      )}

      {/* 标签页导航 */}
      {isClient ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tabs" direction="horizontal" type="tabs" isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex overflow-x-auto pb-2 mb-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
                suppressHydrationWarning
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-8 w-full">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {tabs.map((tab, index) => (
                      <Draggable key={tab.id} draggableId={tab.id} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-3 py-1.5 mr-1.5 rounded-md cursor-pointer text-sm font-medium ${
                              activeTab === tab.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            onClick={() => handleTabChange(tab.id)}
                            suppressHydrationWarning
                          >
                            {tab.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="flex overflow-x-auto pb-2 mb-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-8 w-full">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`px-3 py-1.5 mr-1.5 rounded-md cursor-pointer text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.title}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* 标签页内容 */}
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500"></div>
        </div>
      ) : activeTabData ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {activeTabData.sites.map((site: any) => (
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
          请选择一个标签页
        </div>
      )}
    </div>
  );
};

export default TabPages; 