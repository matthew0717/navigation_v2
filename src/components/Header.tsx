"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

/**
 * 顶部菜单区组件
 * 左侧：logo、频道（图片，视频）
 * 右侧：壁纸设置、登录/注册、设置、收缩按钮
 */
export default function Header() {
  const { t } = useI18n();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'image' | 'video'>('image');

  /**
   * 切换菜单收缩状态
   */
  const toggleMenuCollapse = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  /**
   * 切换频道
   * @param channel 频道类型
   */
  const switchChannel = (channel: 'image' | 'video') => {
    setActiveChannel(channel);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* 左侧菜单 */}
        <div className="flex items-center space-x-6">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt={t('common.appName')} 
              width={32} 
              height={32} 
              className="mr-2"
            />
            <span className="text-xl font-bold text-gray-800 dark:text-white">{t('common.appName')}</span>
          </Link>

          {/* 频道选择 */}
          <div className="flex space-x-4">
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${
                activeChannel === 'image' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => switchChannel('image')}
            >
              {t('header.channels.image')}
            </button>
            <button 
              className={`px-3 py-1 rounded-md transition-colors ${
                activeChannel === 'video' 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => switchChannel('video')}
            >
              {t('header.channels.video')}
            </button>
          </div>
        </div>

        {/* 右侧菜单 */}
        <div className="flex items-center space-x-4">
          {/* 壁纸设置按钮 */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('header.buttons.wallpaper')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* 登录/注册按钮 */}
          <button 
            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            aria-label={t('header.buttons.login')}
          >
            {t('header.buttons.login')}
          </button>

          {/* 设置按钮 */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t('header.buttons.settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* 语言切换器 */}
          <LanguageSwitcher />

          {/* 收缩按钮 */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={toggleMenuCollapse}
            aria-label={t('header.buttons.collapse')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 