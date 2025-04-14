import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

// 用户数据文件路径
const usersFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

/**
 * 处理用户登录请求
 * @param request 请求对象
 * @returns 响应对象
 */
export async function POST(request: Request) {
  try {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('登录请求已接收');
    }

    const { email, password } = await request.json();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('登录信息:', { email });
    }

    // 读取用户数据
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    
    // 查找用户
    const user = usersData.users.find((u: any) => u.email === email);
    
    if (!user) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('登录失败: 用户不存在', { email });
      }
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('登录失败: 密码错误', { email });
      }
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      );
    }
    
    // 更新用户最后登录时间
    user.lastLogin = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    
    // 保存数据
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));

    // 生成JWT令牌
    const token = sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('登录成功:', { userId: user.id, email });
    }

    return NextResponse.json({ 
      success: true, 
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.error('登录失败:', error);
    }
    return NextResponse.json(
      { error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
} 