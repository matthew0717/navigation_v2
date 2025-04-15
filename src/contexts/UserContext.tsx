"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useI18n } from '@/i18n';

/**
 * 用户信息接口
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
}

/**
 * 用户上下文接口
 */
export interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (email: string, name: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyCode: (email: string, code: string, newPassword?: string) => Promise<{ success: boolean; message: string; user?: User; randomPassword?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  setPassword: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (email: string, oldPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
}

/**
 * 创建用户上下文
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 * 用户上下文提供者属性
 */
interface UserProviderProps {
  children: ReactNode;
}

/**
 * 用户上下文提供者组件
 */
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { t } = useI18n();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 从本地存储加载用户信息
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  /**
   * 登录
   * @param email 邮箱
   * @param password 密码
   */
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.error || t('auth.error.loginFailed'),
          user: undefined 
        };
      }

      // 保存用户信息和令牌
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      setUser(data.user);
      
      return { 
        success: true, 
        message: t('auth.loginSuccess'),
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error('登录失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.loginFailed'),
        user: undefined 
      };
    }
  };

  /**
   * 注册
   * @param email 邮箱
   * @param name 姓名
   * @param password 密码
   * @param confirmPassword 确认密码
   */
  const register = async (email: string, name: string, password: string, confirmPassword: string) => {
    console.log('开始注册流程:', { email, name });
    try {
      console.log('发送注册请求...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, confirmPassword }),
      });

      console.log('注册请求响应状态:', response.status);
      const data = await response.json();
      console.log('注册请求响应数据:', data);

      if (!response.ok) {
        console.log('注册失败:', data.error || '未知错误');
        return { 
          success: false, 
          message: data.error || t('auth.error.registerFailed')
        };
      }

      console.log('注册成功，等待验证码验证');
      return { success: true, message: t('auth.registerSuccess') };
    } catch (error) {
      console.log('注册过程发生错误:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.registerFailed')
      };
    }
  };

  /**
   * 验证验证码
   * @param email 邮箱
   * @param code 验证码
   * @param newPassword 新密码（可选）
   */
  const verifyCode = async (email: string, code: string, newPassword?: string) => {
    console.log('开始验证码验证流程:', { email, code, hasNewPassword: !!newPassword });
    try {
      console.log('发送验证码验证请求...');
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      console.log('验证码验证请求响应状态:', response.status);
      const data = await response.json();
      console.log('验证码验证请求响应数据:', data);

      if (!response.ok) {
        console.log('验证码验证失败:', data.error || '未知错误');
        return { 
          success: false, 
          message: data.error || t('auth.error.verifyFailed')
        };
      }

      console.log('验证码验证成功');
      
      // 如果验证成功且有用户信息，设置登录状态
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }

      return { 
        success: true, 
        message: data.message || t('auth.verifySuccess'),
        user: data.user,
        randomPassword: data.randomPassword
      };
    } catch (error) {
      console.log('验证码验证过程发生错误:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.verifyFailed')
      };
    }
  };

  /**
   * 设置密码
   * @param email 邮箱
   * @param password 密码
   */
  const setPassword = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.error || t('auth.error.setPasswordFailed')
        };
      }

      return { 
        success: true, 
        message: t('auth.setPasswordSuccess')
      };
    } catch (error) {
      console.error('设置密码失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.setPasswordFailed')
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 重置密码
   * @param email 邮箱
   */
  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { 
          success: false, 
          message: data.error || t('auth.error.resetPasswordFailed')
        };
      }

      return { 
        success: true, 
        message: t('auth.resetPasswordSuccess')
      };
    } catch (error) {
      console.error('重置密码失败:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.resetPasswordFailed')
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * 更新密码
   * @param email 邮箱
   * @param oldPassword 旧密码
   * @param newPassword 新密码
   */
  const updatePassword = async (email: string, oldPassword: string, newPassword: string) => {
    console.log('开始修改密码流程:', { email });
    try {
      console.log('发送修改密码请求...');
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          oldPassword, 
          newPassword
        }),
      });

      console.log('修改密码请求响应状态:', response.status);
      const data = await response.json();
      console.log('修改密码请求响应数据:', data);

      if (!response.ok) {
        console.log('修改密码失败:', data.error || '未知错误');
        return { 
          success: false, 
          message: data.error || t('auth.error.updatePasswordFailed')
        };
      }

      console.log('修改密码成功');
      return { success: true, message: t('auth.updatePasswordSuccess') };
    } catch (error) {
      console.log('修改密码过程发生错误:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : t('auth.error.updatePasswordFailed')
      };
    }
  };

  /**
   * 登出
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  /**
   * 上下文值
   */
  const value = {
    user,
    loading,
    error,
    login,
    register,
    verifyCode,
    setPassword,
    resetPassword,
    updatePassword,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * 使用用户上下文
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 