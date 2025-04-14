"use client";

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { useUser, User } from '@/contexts/UserContext';
import toast from 'react-hot-toast';

/**
 * 认证模态框组件
 * 提供登录、注册、修改密码、找回密码功能
 */
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, name: string, password: string, confirmPassword: string) => Promise<void>;
  onVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string; user?: User; token?: string }>;
  onResetPassword: (email: string) => Promise<void>;
  onSetPassword: (email: string, password: string) => Promise<void>;
}

/**
 * 认证模态框组件
 */
const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onVerifyCode,
  onResetPassword,
  onSetPassword
}) => {
  const { t } = useI18n();
  const { verifyCode, setPassword, resetPassword, updatePassword } = useUser();
  const [mode, setMode] = useState<'login' | 'register' | 'verify' | 'reset' | 'setPassword'>('login');
  const [email, setEmail] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 当对话框打开时，清空提示信息并设置为登录模式
  useEffect(() => {
    if (isOpen) {
      setStatus(null);
      setMode('login');
    }
  }, [isOpen]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    
    try {
      switch (mode) {
        case 'login':
          await onLogin(email, passwordValue);
          toast.success(t('auth.loginSuccess'));
          onClose();
          break;
        case 'register':
          await onRegister(email, name, passwordValue, confirmPassword);
          toast.success(t('auth.registerSuccess'));
          setMode('verify');
          break;
        case 'verify':
          const result = await onVerifyCode(email, code);
          if (result.success) {
            toast.success(t('auth.verifySuccess'));
            onClose();
          } else {
            setStatus({ type: 'error', message: result.message });
          }
          break;
        case 'reset':
          await onResetPassword(email);
          toast.success(t('auth.resetPasswordSuccess'));
          setMode('verify');
          break;
        case 'setPassword':
          await onSetPassword(email, passwordValue);
          toast.success(t('auth.setPasswordSuccess'));
          setMode('login');
          break;
      }
    } catch (error) {
      console.error('认证操作失败:', error);
      toast.error(error instanceof Error ? error.message : t('auth.error.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 处理第三方登录
   * @param provider 第三方登录提供商
   */
  const handleThirdPartyLogin = (provider: 'github' | 'google') => {
    // 在实际应用中，这里应该重定向到第三方登录页面
    console.log(`${provider} login`);
    // 模拟登录成功
    onClose();
  };

  /**
   * 切换到登录模式
   */
  const switchToLogin = () => {
    setMode('login');
    setEmail('');
    setPasswordValue('');
    setCode('');
  };

  /**
   * 切换到注册模式
   */
  const switchToRegister = () => {
    setMode('register');
    setEmail('');
    setPasswordValue('');
    setConfirmPassword('');
    setCode('');
  };

  /**
   * 切换到找回密码模式
   */
  const switchToReset = () => {
    setMode('reset');
    setEmail('');
    setPasswordValue('');
    setCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="w-6"></div> {/* 左侧占位，保持关闭按钮位置 */}
          <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center flex-1">
            {mode === 'login' && t('auth.login')}
            {mode === 'register' && t('auth.register')}
            {mode === 'verify' && t('auth.verifyCode')}
            {mode === 'reset' && t('auth.resetPassword')}
            {mode === 'setPassword' && t('auth.setPassword')}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 w-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 登录模式下的分割线和邮箱登录标签 */}
        {mode === 'login' && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  {t('auth.emailLogin')}
                </span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {/* 邮箱输入 */}
          {(mode === 'login' || mode === 'register' || mode === 'reset') && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 姓名输入 - 仅注册时显示 */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                {t('auth.name')}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 密码输入 - 登录、注册和设置密码时显示 */}
          {(mode === 'login' || mode === 'register' || mode === 'setPassword') && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="password">
                {t('auth.password')}
              </label>
              <input
                id="password"
                type="password"
                value={passwordValue}
                onChange={(e) => setPasswordValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 确认密码输入 - 仅注册时显示 */}
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="confirmPassword">
                {t('auth.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 验证码输入 - 验证和设置密码时显示 */}
          {(mode === 'verify' || mode === 'setPassword') && (
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="code">
                {t('auth.verificationCode')}
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 登录方式选择 - 仅登录时显示 */}
          {mode === 'login' && (
            <>
              {/* 邮箱登录部分 */}
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    ) : (
                      t('auth.login')
                    )}
                  </button>
                </div>
              </div>
              
              {/* 分割线 */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {t('auth.thirdPartyLogin')}
                  </span>
                </div>
              </div>
              
              {/* 第三方登录部分 */}
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleThirdPartyLogin('github')}
                  >
                    GitHub
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => handleThirdPartyLogin('google')}
                  >
                    Google
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 其他模式的提交按钮 */}
          {mode !== 'login' && (
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                </div>
              ) : (
                mode === 'register' && t('auth.register') ||
                mode === 'verify' && t('auth.verify') ||
                mode === 'reset' && t('auth.sendCode') ||
                mode === 'setPassword' && t('auth.setPassword')
              )}
            </button>
          )}
        </form>

        {/* 底部链接 */}
        <div className="mt-4 text-center text-sm">
          {mode === 'login' && (
            <>
              <button
                onClick={switchToRegister}
                className="text-blue-500 hover:text-blue-700 mr-2"
              >
                {t('auth.noAccount')}
              </button>
              <button
                onClick={switchToReset}
                className="text-blue-500 hover:text-blue-700"
              >
                {t('auth.forgotPassword')}
              </button>
            </>
          )}
          {mode === 'register' && (
            <button
              onClick={switchToLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              {t('auth.haveAccount')}
            </button>
          )}
          {mode === 'reset' && (
            <button
              onClick={switchToLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              {t('auth.backToLogin')}
            </button>
          )}
          {mode === 'verify' && (
            <button
              onClick={switchToLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              {t('auth.backToLogin')}
            </button>
          )}
          {mode === 'setPassword' && (
            <button
              onClick={switchToLogin}
              className="text-blue-500 hover:text-blue-700"
            >
              {t('auth.backToLogin')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 