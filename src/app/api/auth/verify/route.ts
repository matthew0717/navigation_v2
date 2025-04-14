import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sign } from 'jsonwebtoken';

// 获取数据文件路径
const dataFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 读取数据文件
const readDataFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { users: [] };
  }
};

// 写入数据文件
const writeDataFile = (data: any) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('写入数据文件失败:', error);
    return false;
  }
};

// 验证码验证API处理函数
export async function POST(request: NextRequest) {
  try {
    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('验证码验证请求已接收');
    }

    const { email, code } = await request.json();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('验证信息:', { email, code });
    }

    // 读取数据
    const data = readDataFile();
    
    // 查找用户
    const userIndex = data.users.findIndex((u: any) => u.email === email);
    
    if (userIndex === -1) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('验证失败: 用户不存在', { email });
      }
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    const user = data.users[userIndex];
    
    // 检查验证码是否匹配
    if (user.verificationCode !== code) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('验证失败: 验证码不匹配', { 
          email, 
          providedCode: code, 
          expectedCode: user.verificationCode 
        });
      }
      return NextResponse.json(
        { error: '验证码错误' },
        { status: 400 }
      );
    }
    
    // 检查验证码是否过期
    const now = new Date();
    const codeExpiry = new Date(user.codeExpiry);
    
    if (now > codeExpiry) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('验证失败: 验证码已过期', { 
          email, 
          expiryTime: codeExpiry,
          currentTime: now
        });
      }
      return NextResponse.json(
        { error: '验证码已过期' },
        { status: 400 }
      );
    }
    
    // 更新用户验证状态
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();
    user.lastLogin = new Date().toISOString();
    
    // 保存数据
    writeDataFile(data);

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
      console.log('验证成功:', { userId: user.id, email });
    }

    return NextResponse.json({ 
      success: true, 
      message: '验证码验证成功',
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
      console.error('验证码验证失败:', error);
    }
    return NextResponse.json(
      { error: '验证码验证失败' },
      { status: 500 }
    );
  }
} 