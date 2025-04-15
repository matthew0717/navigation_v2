"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useI18n } from "@/i18n";
import { useUser } from "@/contexts/UserContext";
import LanguageSwitcher from "./LanguageSwitcher";
import AuthModal from "./auth/AuthModal";
import UserAvatar from "./UserAvatar";
import UpdatePasswordModal from './auth/UpdatePasswordModal';

/**
 * 顶部菜单区组件
 * 左侧：logo、频道（图片，视频）
 * 右侧：壁纸设置、登录/注册、设置、收缩按钮
 */
export default function Header() {
  const { t } = useI18n();
  const { user, login, register, verifyCode, resetPassword, setPassword, logout } = useUser();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'image' | 'video'>('image');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  // 添加点击外部关闭下拉菜单的功能
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenu = document.getElementById('user-menu');
      const userAvatar = document.getElementById('user-avatar');
      
      if (showUserMenu && userMenu && userAvatar) {
        if (!userMenu.contains(event.target as Node) && !userAvatar.contains(event.target as Node)) {
          setShowUserMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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

  /**
   * 打开认证模态框
   */
  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  /**
   * 关闭认证模态框
   */
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  /**
   * 处理登录
   * @param email 邮箱
   * @param password 密码
   */
  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login(email, password);
      if (result.success) {
        setIsAuthModalOpen(false);
      }
      return result;
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : t('auth.error.loginFailed')
      };
    }
  };

  /**
   * 处理注册
   * @param email 邮箱
   * @param name 姓名
   * @param password 密码
   * @param confirmPassword 确认密码
   */
  const handleRegister = async (email: string, name: string, password: string, confirmPassword: string) => {
    try {
      const result = await register(email, name, password, confirmPassword);
      return result;
    } catch (error) {
      console.error('注册失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.registerFailed')
      };
    }
  };

  /**
   * 处理验证码验证
   * @param email 邮箱
   * @param code 验证码
   */
  const handleVerifyCode = async (email: string, code: string) => {
    try {
      return await verifyCode(email, code);
    } catch (error) {
      console.error('验证失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : t('auth.error.verifyFailed')
      };
    }
  };

  /**
   * 处理重置密码
   * @param email 邮箱
   */
  const handleResetPassword = async (email: string) => {
    try {
      return await resetPassword(email);
    } catch (error) {
      console.error('重置密码失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : t('auth.error.resetPasswordFailed')
      };
    }
  };

  /**
   * 处理设置密码
   * @param email 邮箱
   * @param password 密码
   */
  const handleSetPassword = async (email: string, password: string) => {
    try {
      return await setPassword(email, password);
    } catch (error) {
      console.error('设置密码失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : t('auth.error.setPasswordFailed')
      };
    }
  };

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
  };

  /**
   * 获取用户首字母
   * @param name 用户名
   * @returns 首字母
   */
  const getUserInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  /**
   * 获取随机背景颜色
   * @param name 用户名
   * @returns 背景颜色类名
   */
  const getAvatarBgColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    // 使用用户名生成一个固定的索引
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
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

          {/* 用户菜单 */}
          {user ? (
            <div className="relative">
              {/* 用户头像按钮 */}
              <button
                id="user-avatar"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="relative focus:outline-none"
              >
                <UserAvatar user={user} size="md" />
              </button>
              
              {/* 用户下拉菜单 */}
              {showUserMenu && (
                <div 
                  id="user-menu"
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                >
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      setShowUpdatePasswordModal(true);
                      setShowUserMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('auth.updatePassword')}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('auth.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              onClick={openAuthModal}
              aria-label={t('header.buttons.login')}
            >
              {t('header.buttons.login')}
            </button>
          )}

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

      {/* 认证模态框 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onVerifyCode={handleVerifyCode}
        onResetPassword={handleResetPassword}
        onSetPassword={handleSetPassword}
      />

      {/* 修改密码模态框 */}
      <UpdatePasswordModal
        isOpen={showUpdatePasswordModal}
        onClose={() => setShowUpdatePasswordModal(false)}
      />
    </header>
  );
} 