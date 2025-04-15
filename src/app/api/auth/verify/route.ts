import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { sign } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// 获取数据文件路径
const dataFilePath = path.join(process.cwd(), 'src/app/api/data/users.json');

// 读取数据文件
const readDataFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据文件失败:', error);
    return { users: [], verificationCodes: [] };
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

    const { email, code, newPassword } = await request.json();

    // 开发环境日志
    if (process.env.NODE_ENV === 'development') {
      console.log('验证信息:', { email, code, hasNewPassword: !!newPassword });
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
        { error: 'auth.error.userNotFound' },
        { status: 404 }
      );
    }
    
    const user = data.users[userIndex];
    
    // 检查验证码是否匹配 - 首先检查用户对象中的验证码
    let isCodeValid = false;
    let codeExpiry = null;
    
    // 检查用户对象中的验证码
    if (user.verificationCode === code) {
      isCodeValid = true;
      codeExpiry = user.codeExpiry;
    }
    
    // 如果用户对象中没有匹配的验证码，检查verificationCodes数组
    if (!isCodeValid && data.verificationCodes && data.verificationCodes.length > 0) {
      const verificationCodeIndex = data.verificationCodes.findIndex(
        (vc: any) => vc.email === email && vc.code === code && !vc.used
      );
      
      if (verificationCodeIndex !== -1) {
        isCodeValid = true;
        codeExpiry = data.verificationCodes[verificationCodeIndex].expiresAt;
        
        // 标记验证码为已使用
        data.verificationCodes[verificationCodeIndex].used = true;
      }
    }
    
    if (!isCodeValid) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('验证失败: 验证码不匹配', { 
          email, 
          providedCode: code
        });
      }
      return NextResponse.json(
        { error: 'auth.error.invalidCode' },
        { status: 400 }
      );
    }
    
    // 检查验证码是否过期
    const now = new Date();
    const expiryDate = new Date(codeExpiry);
    
    if (now > expiryDate) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('验证失败: 验证码已过期', { 
          email, 
          expiryTime: expiryDate,
          currentTime: now
        });
      }
      return NextResponse.json(
        { error: 'auth.error.invalidCode' },
        { status: 400 }
      );
    }
    
    // 更新用户验证状态
    user.isVerified = true;
    user.updatedAt = new Date().toISOString();
    user.lastLogin = new Date().toISOString();
    
    // 如果提供了新密码，则更新密码
    if (newPassword) {
      // 开发环境日志
      if (process.env.NODE_ENV === 'development') {
        console.log('设置新密码:', { email });
      }
      
      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      
      // 清除验证码
      user.verificationCode = null;
      user.codeExpiry = null;
    }
    
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
      console.log('验证成功:', { userId: user.id, email, hasNewPassword: !!newPassword });
    }

    return NextResponse.json({ 
      success: true, 
      message: newPassword ? 'auth.setPasswordSuccess' : 'auth.verifySuccess',
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
      { error: 'auth.error.serverError' },
      { status: 500 }
    );
  }
} 