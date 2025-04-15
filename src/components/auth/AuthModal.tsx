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
  onLogin: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  onRegister: (email: string, name: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  onVerifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string; user?: User; randomPassword?: string }>;
  onResetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  onSetPassword: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  onGithubLogin: () => Promise<void>;
  onBindEmail: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
}

type AuthMode = 'login' | 'register' | 'verify' | 'reset' | 'setPassword';

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
  onSetPassword,
  onGithubLogin,
  onBindEmail
}) => {
  const { t } = useI18n();
  const { verifyCode, setPassword, resetPassword, updatePassword, githubLogin, bindEmail } = useUser();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 当对话框打开时，清空提示信息并设置为登录模式
  useEffect(() => {
    if (isOpen) {
      setStatusMessage(null);
      setMode('login');
    }
  }, [isOpen]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      let result;
      switch (mode) {
        case 'login':
          result = await onLogin(email, passwordValue);
          if (result.success) {
            setStatusMessage({ type: 'success', message: result.message });
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setStatusMessage({ type: 'error', message: result.message });
          }
          break;

        case 'register':
          result = await onRegister(email, name, passwordValue, confirmPassword);
          if (result.success) {
            setStatusMessage({ type: 'success', message: result.message });
            setMode('verify');
          } else {
            setStatusMessage({ type: 'error', message: result.message });
          }
          break;

        case 'verify':
          // 检查密码是否匹配
          if (passwordValue !== confirmPassword) {
            setStatusMessage({
              type: 'error',
              message: t('auth.error.passwordsDoNotMatch')
            });
            setIsSubmitting(false);
            return;
          }
          
          // 检查密码长度
          if (passwordValue.length < 6) {
            setStatusMessage({
              type: 'error',
              message: t('auth.error.passwordTooShort')
            });
            setIsSubmitting(false);
            return;
          }
          
          // 验证码验证并设置新密码
          result = await verifyCode(email, code, passwordValue);
          if (result.success) {
            setStatusMessage({
              type: 'success',
              message: result.message
            });
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setStatusMessage({
              type: 'error',
              message: result.message
            });
          }
          break;

        case 'reset':
          result = await onResetPassword(email);
          if (result.success) {
            setStatusMessage({ type: 'success', message: result.message });
            setMode('verify');
          } else {
            setStatusMessage({ type: 'error', message: result.message });
          }
          break;

        case 'setPassword':
          result = await onSetPassword(email, passwordValue);
          if (result.success) {
            setStatusMessage({ type: 'success', message: result.message });
            setTimeout(() => {
              onClose();
            }, 1500);
          } else {
            setStatusMessage({ type: 'error', message: result.message });
          }
          break;
      }
    } catch (error: any) {
      setStatusMessage({ 
        type: 'error', 
        message: error.message || t('auth.error.networkError') 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 处理第三方登录
   * @param provider 第三方登录提供商
   */
  const handleThirdPartyLogin = (provider: 'github' | 'google') => {
    if (provider === 'github') {
      githubLogin();
    } else {
      // 在实际应用中，这里应该重定向到第三方登录页面
      console.log(`${provider} login`);
      // 模拟登录成功
      onClose();
    }
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
          {mode === 'verify' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.verificationCode')}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.newPassword')}
                </label>
                <input
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                disabled={isSubmitting || !code || !passwordValue || !confirmPassword}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : (
                  t('auth.verify')
                )}
              </button>
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
              
              {/* 错误信息显示 */}
              {statusMessage?.type === 'error' && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                  {statusMessage.message}
                </div>
              )}
              
              {/* 分割线 */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    {t('auth.thirdPartyLogin')}
                  </span>
                </div>
              </div>
              
              {/* 第三方登录按钮 */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleThirdPartyLogin('github')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 text-white py-2 rounded-md hover:bg-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span>GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThirdPartyLogin('google')}
                  className="flex-1 flex items-center justify-center space-x-2 bg-white text-gray-700 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="currentColor" />
                  </svg>
                  <span>Google</span>
                </button>
              </div>
            </>
          )}

          {/* 注册按钮 */}
          {mode === 'register' && (
            <div className="mb-4">
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
                  t('auth.register')
                )}
              </button>
            </div>
          )}

          {/* 错误信息显示 */}
          {statusMessage?.type === 'error' && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {statusMessage.message}
            </div>
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