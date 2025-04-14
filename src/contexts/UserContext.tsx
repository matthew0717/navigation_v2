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
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, confirmPassword: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string; user?: User; token?: string }>;
  setPassword: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (email: string, code: string, password: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
        setIsLoading(false);
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
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.loginError'));
      }
      
      // 保存用户信息和令牌
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      
      setUser(data.user);
    } catch (error) {
      console.error('登录失败:', error);
      setError(error instanceof Error ? error.message : t('auth.loginError'));
      throw error;
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, confirmPassword }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.registerError'));
      }
      
      return data;
    } catch (error) {
      console.error('注册失败:', error);
      setError(error instanceof Error ? error.message : t('auth.registerError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 验证验证码
   * @param email 邮箱
   * @param code 验证码
   */
  const verifyCode = async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.verifyError'));
      }
      
      // 如果验证成功，保存用户信息和令牌
      if (data.success && data.user && data.token) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setUser(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('验证码验证失败:', error);
      setError(error instanceof Error ? error.message : t('auth.verifyError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 设置密码
   * @param email 邮箱
   * @param password 密码
   */
  const setPassword = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '设置密码失败');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('设置密码失败:', error);
      throw error;
    }
  };

  /**
   * 重置密码
   * @param email 邮箱
   */
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.resetPasswordError'));
      }
      
      return data;
    } catch (error) {
      console.error('找回密码失败:', error);
      setError(error instanceof Error ? error.message : t('auth.resetPasswordError'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 更新密码
   * @param email 邮箱
   * @param code 验证码
   * @param password 密码
   */
  const updatePassword = async (email: string, code: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || t('auth.updatePasswordError'));
      }
      
      return data;
    } catch (error) {
      console.error('更新密码失败:', error);
      setError(error instanceof Error ? error.message : t('auth.updatePasswordError'));
      throw error;
    } finally {
      setIsLoading(false);
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
    isLoading,
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