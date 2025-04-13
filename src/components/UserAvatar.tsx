"use client";

import React from 'react';
import Image from 'next/image';
import { User } from '@/contexts/UserContext';

interface UserAvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 用户头像组件
 * 如果用户有自定义头像则显示头像，否则显示默认头像加上用户首字母
 * @param user 用户信息
 * @param size 头像大小
 * @param className 额外的CSS类名
 */
export default function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  // 根据size确定头像尺寸
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-lg'
  };

  // 获取用户首字母
  const getUserInitial = (name: string): string => {
    return name.charAt(0).toUpperCase();
  };

  // 获取随机背景颜色
  const getAvatarBgColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    
    // 使用用户名生成一个固定的索引
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // 确定头像尺寸
  const sizeClass = sizeClasses[size];
  const imageSize = size === 'sm' ? 24 : size === 'md' ? 32 : 48;

  // 检查是否有有效的自定义头像
  const hasCustomAvatar = user.avatar && 
    user.avatar !== '/avatars/default.png' && 
    user.avatar !== '/avatars/default.min.svg' &&
    user.avatar !== '/avatars/default.svg';

  return (
    <div className={`${sizeClass} rounded-full overflow-hidden flex items-center justify-center ${className}`}>
      {hasCustomAvatar ? (
        <Image 
          src={user.avatar} 
          alt={user.name} 
          width={imageSize} 
          height={imageSize} 
          className="object-cover"
        />
      ) : (
        <div className="relative w-full h-full">
          <Image 
            src="/avatars/default.min.svg" 
            alt="默认头像" 
            width={imageSize} 
            height={imageSize} 
            className="object-cover"
          />
          <div className={`absolute inset-0 flex items-center justify-center text-white ${getAvatarBgColor(user.name)} bg-opacity-50`}>
            {getUserInitial(user.name)}
          </div>
        </div>
      )}
    </div>
  );
} 