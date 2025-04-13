"use client";

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';

/**
 * 场景类型
 */
type SceneType = 'minimal' | 'meditation' | 'custom' | 'recommended';

/**
 * 场景按钮配置
 */
interface SceneButton {
  id: SceneType;
  icon: string;
  label: string;
  active: boolean;
}

/**
 * 底部场景按钮组件
 * 提供四种场景模式：极简模式、冥想模式、自定义模式、常用推荐
 */
const SceneButtons: React.FC = () => {
  const { t } = useI18n();
  const [scenes, setScenes] = useState<SceneButton[]>([
    { id: 'minimal', icon: '🌱', label: t('scenes.minimal'), active: true },
    { id: 'meditation', icon: '🧘', label: t('scenes.meditation'), active: false },
    { id: 'custom', icon: '🎨', label: t('scenes.custom'), active: false },
    { id: 'recommended', icon: '⭐', label: t('scenes.recommended'), active: false },
  ]);

  /**
   * 切换场景
   * @param sceneId 场景ID
   */
  const switchScene = (sceneId: SceneType) => {
    setScenes(prevScenes => 
      prevScenes.map(scene => ({
        ...scene,
        active: scene.id === sceneId
      }))
    );
    
    // 保存场景选择到本地存储
    localStorage.setItem('activeScene', sceneId);
  };

  /**
   * 从本地存储加载场景设置
   */
  useEffect(() => {
    const savedScene = localStorage.getItem('activeScene') as SceneType;
    if (savedScene) {
      switchScene(savedScene);
    }
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex space-x-2 bg-white dark:bg-gray-800 rounded-full shadow-lg p-2">
        {scenes.map(scene => (
          <button
            key={scene.id}
            onClick={() => switchScene(scene.id)}
            className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${
              scene.active 
                ? 'bg-blue-500 text-white shadow-md scale-105' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label={scene.label}
            title={scene.label}
          >
            <span className="text-2xl">{scene.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneButtons; 